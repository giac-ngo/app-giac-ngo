// server/db.js
import pg from 'pg';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper function to map database rows to camelCase object keys
const mapRowToCamelCase = (row) => {
    if (!row) return null;
    const newObj = {};
    for (const key in row) {
        const camelCaseKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        newObj[camelCaseKey] = row[key];
    }
    return newObj;
};

// Helper function to enrich user with roles and permissions
const enrichUserWithPermissions = async (user) => {
    if (!user) return null;
    const roles = await db.getRolesForUser(user.id);
    const roleIds = roles.map(r => r.id);
    // Use a Set to ensure unique permissions
    const permissions = new Set(roles.flatMap(r => r.permissions));
    return { ...user, roleIds, permissions: Array.from(permissions) };
}


export const db = {
    pool,

    // --- Dashboard ---
    async getDashboardStats() {
        const client = await pool.connect();
        try {
            const statsPromises = [
                client.query('SELECT COUNT(*) AS total_users FROM users'),
                client.query('SELECT COUNT(*) AS total_ai_configs FROM ai_configs'),
                client.query('SELECT COUNT(*) AS total_conversations FROM conversations'),
                client.query('SELECT COUNT(DISTINCT user_id) AS interacting_users FROM conversations WHERE user_id IS NOT NULL'),
                client.query(`
                    SELECT a.name, a.avatar_url, COUNT(c.id) AS conversation_count 
                    FROM ai_configs a 
                    LEFT JOIN conversations c ON a.id = c.ai_config_id 
                    GROUP BY a.id 
                    ORDER BY conversation_count DESC 
                    LIMIT 5;
                `),
                 client.query(`
                    SELECT c.id, c.user_name, c.start_time, a.name AS ai_name 
                    FROM conversations c
                    JOIN ai_configs a ON c.ai_config_id = a.id
                    ORDER BY c.start_time DESC 
                    LIMIT 5;
                `),
            ];

            const [
                totalUsersRes,
                totalAiConfigsRes,
                totalConversationsRes,
                interactingUsersRes,
                topAIsRes,
                recentConversationsRes
            ] = await Promise.all(statsPromises);
            
            return {
                totalUsers: parseInt(totalUsersRes.rows[0].total_users, 10),
                totalAiConfigs: parseInt(totalAiConfigsRes.rows[0].total_ai_configs, 10),
                totalConversations: parseInt(totalConversationsRes.rows[0].total_conversations, 10),
                interactingUsers: parseInt(interactingUsersRes.rows[0].interacting_users, 10),
                topAIs: topAIsRes.rows.map(mapRowToCamelCase),
                recentConversations: recentConversationsRes.rows.map(mapRowToCamelCase),
            };

        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            throw error;
        } finally {
            client.release();
        }
    },

    // --- User Management ---
    async getUserByEmail(email) {
        const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
        const user = res.rows[0] ? mapRowToCamelCase(res.rows[0]) : null;
        if (!user) return null;
        return enrichUserWithPermissions(user);
    },

    async getUserById(id) {
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        const user = res.rows[0] ? mapRowToCamelCase(res.rows[0]) : null;
        if (!user) return null;
        return enrichUserWithPermissions(user);
    },

    async getAllUsers() {
        const res = await pool.query('SELECT * FROM users ORDER BY id ASC');
        const users = res.rows.map(mapRowToCamelCase);
        // Enrich each user with their roles
        return Promise.all(users.map(enrichUserWithPermissions));
    },

    async createUser(userData) {
        const { email, password, name, avatarUrl, isAdmin, roleIds } = userData;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            if (!email || !password || !name) {
                throw new Error('Email, password, and name are required.');
            }
            const lowerEmail = email.toLowerCase();
            const hashedPassword = bcrypt.hashSync(password, 10);
            const res = await client.query(
                'INSERT INTO users (email, password, name, avatar_url, is_admin, coins, is_active) VALUES ($1, $2, $3, $4, $5, 0, true) RETURNING *',
                [lowerEmail, hashedPassword, name, avatarUrl || `https://i.pravatar.cc/150?u=${lowerEmail}`, !!isAdmin]
            );
            const newUser = mapRowToCamelCase(res.rows[0]);

            if (roleIds && roleIds.length > 0) {
                 await this.updateRolesForUser(newUser.id, roleIds, client);
            }

            await client.query('COMMIT');
            return enrichUserWithPermissions(newUser);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async updateUser(id, userData) {
         const { name, email, avatarUrl, isAdmin, coins, apiKeys, isActive, roleIds } = userData;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const lowerEmail = email ? email.toLowerCase() : undefined;
            const res = await client.query(
                `UPDATE users SET 
                    name = $1, email = $2, avatar_url = $3, is_admin = $4,
                    coins = $5, api_keys = $6, is_active = $7
                 WHERE id = $8 RETURNING *`,
                [name, lowerEmail, avatarUrl, isAdmin, coins, apiKeys, isActive, id]
            );
            
            // roleIds can be an empty array to remove all roles
            if (roleIds !== undefined) {
                 await this.updateRolesForUser(id, roleIds, client);
            }

            const updatedUser = mapRowToCamelCase(res.rows[0]);
            await client.query('COMMIT');
            return enrichUserWithPermissions(updatedUser);
        } catch(e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    async deleteUser(id) {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
    },
    
    async regenerateApiToken(userId) {
        const apiToken = crypto.randomBytes(24).toString('hex');
        const res = await pool.query('UPDATE users SET api_token = $1 WHERE id = $2 RETURNING *', [apiToken, userId]);
        if (res.rows.length === 0) throw new Error('User not found.');
        return enrichUserWithPermissions(mapRowToCamelCase(res.rows[0]));
    },
    
    // --- Role Management ---
    async getAllRoles() {
        const res = await pool.query('SELECT * FROM roles ORDER BY name ASC');
        return res.rows.map(mapRowToCamelCase);
    },
    async createRole(roleData) {
        const { name, permissions } = roleData;
        const res = await pool.query('INSERT INTO roles (name, permissions) VALUES ($1, $2) RETURNING *', [name, permissions]);
        return mapRowToCamelCase(res.rows[0]);
    },
    async updateRole(id, roleData) {
        const { name, permissions } = roleData;
        const res = await pool.query('UPDATE roles SET name = $1, permissions = $2 WHERE id = $3 RETURNING *', [name, permissions, id]);
        return mapRowToCamelCase(res.rows[0]);
    },
    async deleteRole(id) {
        await pool.query('DELETE FROM roles WHERE id = $1', [id]);
    },
    async getRolesForUser(userId) {
        const res = await pool.query(`
            SELECT r.* FROM roles r
            JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = $1
        `, [userId]);
        return res.rows.map(mapRowToCamelCase);
    },
    async updateRolesForUser(userId, roleIds, client = pool) {
        // Use the provided client if in a transaction, otherwise use the pool
        await client.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
        if (roleIds && roleIds.length > 0) {
            const values = roleIds.map(roleId => `(${userId}, ${roleId})`).join(',');
            await client.query(`INSERT INTO user_roles (user_id, role_id) VALUES ${values}`);
        }
    },

    // --- Coin & Subscription Management ---
    async purchaseSubscription(userId, planId) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const planRes = await client.query('SELECT * FROM pricing_plans WHERE id = $1', [planId]);
            if (planRes.rows.length === 0) throw new Error('Không tìm thấy gói.');
            const plan = mapRowToCamelCase(planRes.rows[0]);

            const userRes = await client.query('SELECT coins FROM users WHERE id = $1', [userId]);
            const userCoins = userRes.rows[0].coins;

            if (userCoins !== null && userCoins < plan.coinCost) {
                throw new Error('Không đủ coin để mua gói này.');
            }
            
            // Deduct coins if not unlimited
            let updatedUserRes;
            if (userCoins !== null) {
                updatedUserRes = await client.query(
                    'UPDATE users SET coins = coins - $1 WHERE id = $2 RETURNING *',
                    [plan.coinCost, userId]
                );
                // Log the transaction
                await client.query(
                    'INSERT INTO transactions (user_id, coins, type) VALUES ($1, $2, $3)',
                    [userId, -plan.coinCost, 'subscription']
                );
            } else {
                 updatedUserRes = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
            }
            
            // Update subscription
            const currentSubRes = await client.query('SELECT subscription_expires_at FROM users WHERE id = $1', [userId]);
            const currentSubDate = currentSubRes.rows[0].subscription_expires_at;
            
            const startDate = (currentSubDate && new Date(currentSubDate) > new Date()) ? new Date(currentSubDate) : new Date();
            
            const newExpiryDate = plan.durationDays ? new Date(startDate.setDate(startDate.getDate() + plan.durationDays)) : null;

            const finalUserRes = await client.query(
                'UPDATE users SET subscription_plan_id = $1, subscription_expires_at = $2 WHERE id = $3 RETURNING *',
                [planId, newExpiryDate, userId]
            );

            await client.query('COMMIT');
            return enrichUserWithPermissions(mapRowToCamelCase(finalUserRes.rows[0]));
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async checkSubscriptionStatus(userId) {
        // This function could be used to nullify subscription if expired
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        let user = mapRowToCamelCase(res.rows[0]);
        if (user && user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date()) {
             const updatedRes = await pool.query(
                `UPDATE users SET subscription_plan_id = NULL, subscription_expires_at = NULL 
                 WHERE id = $1 RETURNING *`, [userId]
            );
            user = mapRowToCamelCase(updatedRes.rows[0]);
        }
        return enrichUserWithPermissions(user);
    },

    async addCoinsToUser(userId, coins, adminId, type = 'manual') {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const res = await client.query(
                'UPDATE users SET coins = COALESCE(coins, 0) + $1 WHERE id = $2 RETURNING *',
                [coins, userId]
            );
            await client.query(
                'INSERT INTO transactions (user_id, coins, admin_id, type) VALUES ($1, $2, $3, $4)',
                [userId, coins, adminId, type]
            );
            await client.query('COMMIT');
            return enrichUserWithPermissions(mapRowToCamelCase(res.rows[0]));
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },
    
    async deductCoinFromUser(userId) {
        const userRes = await pool.query('SELECT coins FROM users WHERE id = $1', [userId]);
        const userCoins = userRes.rows[0].coins;
        if (userCoins === null || userCoins > 0) {
             const res = await pool.query(
                'UPDATE users SET coins = CASE WHEN coins IS NULL THEN NULL ELSE coins - 1 END WHERE id = $1 RETURNING *',
                [userId]
            );
            return enrichUserWithPermissions(mapRowToCamelCase(res.rows[0]));
        }
        return null; // Should not happen due to prior checks, but good practice
    },

    // --- AI Config Management ---
    async getVisibleAiConfigsForUser(user) {
        let query = 'SELECT * FROM ai_configs WHERE 1=1';
        const params = [];

        if (user) {
            const hasActiveSub = user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date();
            if (hasActiveSub) {
                 // User with active sub can see public, trial, and subscription-based AIs
                 query += ' AND (is_public = true)';
            } else {
                // User without sub can see public and trial AIs
                query += ' AND (is_public = true AND requires_subscription = false)';
            }
        } else {
            // Guest can see public, trial-allowed, non-subscription AIs
            query += ' AND is_public = true AND is_trial_allowed = true AND requires_subscription = false';
        }
        query += ' ORDER BY name ASC';
        const res = await pool.query(query, params);
        return res.rows.map(mapRowToCamelCase);
    },

    async getManageableAiConfigsForUser(user) {
        if (user.isAdmin) {
            const res = await pool.query('SELECT * FROM ai_configs ORDER BY name ASC');
            return res.rows.map(mapRowToCamelCase);
        }
        if (user.permissions?.includes('ai')) {
            const res = await pool.query('SELECT * FROM ai_configs WHERE owner_id = $1 ORDER BY name ASC', [user.id]);
            return res.rows.map(mapRowToCamelCase);
        }
        return [];
    },

    async createAiConfig(configData) {
        const { name, description, avatarUrl, modelType, modelName, trainingContent, suggestedQuestions, tags, isPublic, ownerId, isTrialAllowed, requiresSubscription } = configData;
        const res = await pool.query(
            `INSERT INTO ai_configs (name, description, avatar_url, model_type, model_name, training_content, suggested_questions, tags, is_public, owner_id, is_trial_allowed, requires_subscription) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [name, description, avatarUrl, modelType, modelName, trainingContent, suggestedQuestions, tags, isPublic, ownerId, isTrialAllowed, requiresSubscription]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async updateAiConfig(id, configData) {
        const { name, description, avatarUrl, modelType, modelName, trainingContent, suggestedQuestions, tags, isPublic, isTrialAllowed, requiresSubscription } = configData;
        const res = await pool.query(
            `UPDATE ai_configs SET 
                name = $1, description = $2, avatar_url = $3, model_type = $4, model_name = $5, 
                training_content = $6, suggested_questions = $7, tags = $8, is_public = $9, 
                is_trial_allowed = $10, requires_subscription = $11 
             WHERE id = $12 RETURNING *`,
            [name, description, avatarUrl, modelType, modelName, trainingContent, suggestedQuestions, tags, isPublic, isTrialAllowed, requiresSubscription, id]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async deleteAiConfig(id) {
        await pool.query('DELETE FROM ai_configs WHERE id = $1', [id]);
    },

    // --- Training Data Management ---
    async getTrainingDataByAiId(aiId) {
        const res = await pool.query('SELECT * FROM training_data_sources WHERE ai_config_id = $1', [aiId]);
        return res.rows.map(mapRowToCamelCase);
    },

    async createTrainingDataSource(data) {
        const { aiConfigId, type, question, answer, fileName, fileUrl } = data;
        const res = await pool.query(
            'INSERT INTO training_data_sources (ai_config_id, type, question, answer, file_name, file_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [aiConfigId, type, question, answer, fileName, fileUrl]
        );
        return mapRowToCamelCase(res.rows[0]);
    },
    
    async deleteTrainingDataSource(id) {
        const res = await pool.query('DELETE FROM training_data_sources WHERE id = $1 RETURNING *', [id]);
        return mapRowToCamelCase(res.rows[0]);
    },


    // --- Conversation Management ---
    async getConversationsByUserId(userId) {
        const res = await pool.query('SELECT * FROM conversations WHERE user_id = $1 ORDER BY start_time DESC', [userId]);
        return res.rows.map(mapRowToCamelCase);
    },

    async getLatestConversationByAiId(aiId, userId) {
        const res = await pool.query(
            'SELECT * FROM conversations WHERE ai_config_id = $1 AND user_id = $2 ORDER BY start_time DESC LIMIT 1',
            [aiId, userId]
        );
        return res.rows[0] ? mapRowToCamelCase(res.rows[0]) : null;
    },

    async getAllConversations() {
        const res = await pool.query('SELECT * FROM conversations ORDER BY start_time DESC');
        return res.rows.map(mapRowToCamelCase);
    },
    
    async createConversation(convoData) {
        const { userId, userName, aiConfigId, messages } = convoData;
        const res = await pool.query(
            'INSERT INTO conversations (user_id, user_name, ai_config_id, messages) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, userName, aiConfigId, JSON.stringify(messages)]
        );
        return mapRowToCamelCase(res.rows[0]);
    },
    
    async updateConversation(id, messages) {
        const res = await pool.query(
            'UPDATE conversations SET messages = $1 WHERE id = $2 RETURNING *',
            [JSON.stringify(messages), id]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async deleteConversation(id) {
        await pool.query('DELETE FROM conversations WHERE id = $1', [id]);
    },

    // --- System Config ---
    async getSystemConfig() {
        const res = await pool.query('SELECT * FROM system_config LIMIT 1');
        return mapRowToCamelCase(res.rows[0]);
    },
    
    async updateSystemConfig(config) {
        const { guestMessageLimit, systemKeys, template, templateSettings } = config;
        const res = await pool.query(
            'UPDATE system_config SET guest_message_limit = $1, system_keys = $2, template = $3, template_settings = $4 WHERE id = 1 RETURNING *',
            [guestMessageLimit, systemKeys, template, templateSettings]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    // --- Pricing Plans ---
    async getPricingPlans() {
        const res = await pool.query('SELECT * FROM pricing_plans ORDER BY id ASC');
        return res.rows.map(mapRowToCamelCase);
    },
    async createPricingPlan(plan) {
        const { planName, price, coinCost, durationDays, features, isActive } = plan;
        const res = await pool.query(
            'INSERT INTO pricing_plans (plan_name, price, coin_cost, duration_days, features, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [planName, price, coinCost, durationDays, features, isActive]
        );
        return mapRowToCamelCase(res.rows[0]);
    },
    async updatePricingPlan(id, plan) {
        const { planName, price, coinCost, durationDays, features, isActive } = plan;
        const res = await pool.query(
            'UPDATE pricing_plans SET plan_name = $1, price = $2, coin_cost = $3, duration_days = $4, features = $5, is_active = $6 WHERE id = $7 RETURNING *',
            [planName, price, coinCost, durationDays, features, isActive, id]
        );
        return mapRowToCamelCase(res.rows[0]);
    },
    async deletePricingPlan(id) {
        await pool.query('DELETE FROM pricing_plans WHERE id = $1', [id]);
    },

    // --- Transactions ---
    async getAllTransactions() {
        const res = await pool.query(`
            SELECT t.*, u.name as user_name, a.name as admin_name
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            LEFT JOIN users a ON t.admin_id = a.id
            ORDER BY t.timestamp DESC
        `);
        return res.rows.map(mapRowToCamelCase);
    },

    async getTransactionsByUserId(userId) {
        const res = await pool.query(`
            SELECT t.*, a.name as admin_name
            FROM transactions t
            LEFT JOIN users a ON t.admin_id = a.id
            WHERE t.user_id = $1
            ORDER BY t.timestamp DESC
        `, [userId]);
        return res.rows.map(mapRowToCamelCase);
    },
};