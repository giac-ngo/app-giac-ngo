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
        const { email, password, name, avatarUrl, isAdmin, roleIds, template } = userData;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            if (!email || !password || !name) {
                throw new Error('Email, password, and name are required.');
            }
            const lowerEmail = email.toLowerCase();
            
            const N = 8192, r = 8, p = 1, keylen = 64; // Reduced N for lower memory usage
            const salt = crypto.randomBytes(8).toString('hex');
            const derivedKey = await new Promise((resolve, reject) => {
                crypto.scrypt(password, salt, keylen, { cost: N, blockSize: r, parallelization: p }, (err, derivedKey) => {
                    if (err) reject(err);
                    resolve(derivedKey);
                });
            });
            const hashedPassword = `scrypt:${N}:${r}:${p}$${salt}$${derivedKey.toString('hex')}`;

            const res = await client.query(
                'INSERT INTO users (email, password, name, avatar_url, is_admin, merits, is_active, template) VALUES ($1, $2, $3, $4, $5, 0, true, $6) RETURNING *',
                [lowerEmail, hashedPassword, name, avatarUrl || `https://i.pravatar.cc/150?u=${lowerEmail}`, !!isAdmin, template]
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
        const { roleIds, password, permissions, ...fieldsToUpdate } = userData; // Exclude permissions
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
    
            if (password) {
                const N = 8192, r = 8, p = 1, keylen = 64; // Reduced N for lower memory usage
                const salt = crypto.randomBytes(8).toString('hex');
                const derivedKey = await new Promise((resolve, reject) => {
                    crypto.scrypt(password, salt, keylen, { cost: N, blockSize: r, parallelization: p }, (err, key) => {
                        if (err) reject(err);
                        resolve(key);
                    });
                });
                fieldsToUpdate.password = `scrypt:${N}:${r}:${p}$${salt}$${derivedKey.toString('hex')}`;
            } else {
                delete fieldsToUpdate.password;
            }
            delete fieldsToUpdate.id; // Never update the ID
    
            if (Object.keys(fieldsToUpdate).length > 0) {
                const setClauses = Object.keys(fieldsToUpdate).map((key, i) => {
                    const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                    return `${dbKey} = $${i + 1}`;
                }).join(', ');
                
                const values = Object.values(fieldsToUpdate);
    
                await client.query(
                    `UPDATE users SET ${setClauses} WHERE id = $${values.length + 1}`,
                    [...values, id]
                );
            }
            
            if (roleIds !== undefined) {
                 await this.updateRolesForUser(id, roleIds, client);
            }
            
            const res = await client.query('SELECT * FROM users WHERE id = $1', [id]);
            
            await client.query('COMMIT');
            
            if (res.rows.length === 0) throw new Error('User not found after update.');
            const updatedUser = mapRowToCamelCase(res.rows[0]);
            return enrichUserWithPermissions(updatedUser);
    
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
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

    // --- Merit & Subscription Management ---
    async purchaseSubscription(userId, planId) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const planRes = await client.query('SELECT * FROM pricing_plans WHERE id = $1', [planId]);
            if (planRes.rows.length === 0) throw new Error('Không tìm thấy gói.');
            const plan = mapRowToCamelCase(planRes.rows[0]);

            const userRes = await client.query('SELECT merits FROM users WHERE id = $1', [userId]);
            const userMerits = userRes.rows[0].merits;

            if (userMerits !== null && userMerits < plan.meritCost) {
                throw new Error('Không đủ merit để mua gói này.');
            }
            
            // Deduct merits if not unlimited
            let updatedUserRes;
            if (userMerits !== null) {
                updatedUserRes = await client.query(
                    'UPDATE users SET merits = merits - $1 WHERE id = $2 RETURNING *',
                    [plan.meritCost, userId]
                );
                // Log the transaction
                await client.query(
                    'INSERT INTO transactions (user_id, merits, type) VALUES ($1, $2, $3)',
                    [userId, -plan.meritCost, 'subscription']
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

    async addMeritsToUser(userId, merits, adminId, type = 'manual') {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const res = await client.query(
                'UPDATE users SET merits = COALESCE(merits, 0) + $1 WHERE id = $2 RETURNING *',
                [merits, userId]
            );
            await client.query(
                'INSERT INTO transactions (user_id, merits, admin_id, type) VALUES ($1, $2, $3, $4)',
                [userId, merits, adminId, type]
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
    
    async deductMeritFromUser(userId) {
        const userRes = await pool.query('SELECT merits FROM users WHERE id = $1', [userId]);
        const userMerits = userRes.rows[0].merits;
        if (userMerits === null || userMerits > 0) {
             const res = await pool.query(
                'UPDATE users SET merits = CASE WHEN merits IS NULL THEN NULL ELSE merits - 1 END WHERE id = $1 RETURNING *',
                [userId]
            );
            return enrichUserWithPermissions(mapRowToCamelCase(res.rows[0]));
        }
        return null; // Should not happen due to prior checks, but good practice
    },

    // --- AI Config Management ---
    async getVisibleAiConfigsForUser(user) {
        let query = 'SELECT * FROM ai_configs';
        const params = [];

        if (user && user.id) {
            params.push(user.id);
            const hasActiveSub = user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date();

            if (hasActiveSub) {
                // Subscribed users see all public AIs and their own AIs.
                query += ` WHERE (is_public = true OR owner_id = $${params.length})`;
            } else {
                // Non-subscribed users see their own AIs, AND public AIs that don't require a subscription.
                query += ` WHERE (owner_id = $${params.length} OR (is_public = true AND requires_subscription = false))`;
            }
        } else {
            // Guest can see public, trial-allowed, non-subscription AIs
            query += ' WHERE is_public = true AND is_trial_allowed = true AND requires_subscription = false';
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
        const { name, nameEn, description, descriptionEn, avatarUrl, modelType, modelName, trainingContent, suggestedQuestions, suggestedQuestionsEn, tags, isPublic, ownerId, isTrialAllowed, requiresSubscription } = configData;
        const res = await pool.query(
            `INSERT INTO ai_configs (name, name_en, description, description_en, avatar_url, model_type, model_name, training_content, suggested_questions, suggested_questions_en, tags, is_public, owner_id, is_trial_allowed, requires_subscription) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
            [name, nameEn, description, descriptionEn, avatarUrl, modelType, modelName, trainingContent, suggestedQuestions, suggestedQuestionsEn, tags, isPublic, ownerId, isTrialAllowed, requiresSubscription]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async updateAiConfig(id, configData) {
        const { name, nameEn, description, descriptionEn, avatarUrl, modelType, modelName, trainingContent, suggestedQuestions, suggestedQuestionsEn, tags, isPublic, isTrialAllowed, requiresSubscription } = configData;
        const res = await pool.query(
            `UPDATE ai_configs SET 
                name = $1, name_en = $2, description = $3, description_en = $4, avatar_url = $5, model_type = $6, model_name = $7, 
                training_content = $8, suggested_questions = $9, suggested_questions_en = $10, tags = $11, is_public = $12, 
                is_trial_allowed = $13, requires_subscription = $14
             WHERE id = $15 RETURNING *`,
            [name, nameEn, description, descriptionEn, avatarUrl, modelType, modelName, trainingContent, suggestedQuestions, suggestedQuestionsEn, tags, isPublic, isTrialAllowed, requiresSubscription, id]
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
    async getTrainingDataByAiIdForChat(aiId) {
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
        const res = await pool.query('SELECT * FROM pricing_plans ORDER BY merit_cost ASC');
        return res.rows.map(mapRowToCamelCase);
    },
    async createPricingPlan(plan) {
        const { planName, price, meritCost, durationDays, features, isActive, planNameEn, priceEn, featuresEn } = plan;
        const res = await pool.query(
            'INSERT INTO pricing_plans (plan_name, price, merit_cost, duration_days, features, is_active, plan_name_en, price_en, features_en) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [planName, price, meritCost, durationDays, features, isActive, planNameEn, priceEn, featuresEn]
        );
        return mapRowToCamelCase(res.rows[0]);
    },
    async updatePricingPlan(id, plan) {
        const { planName, price, meritCost, durationDays, features, isActive, planNameEn, priceEn, featuresEn } = plan;
        const res = await pool.query(
            'UPDATE pricing_plans SET plan_name = $1, price = $2, merit_cost = $3, duration_days = $4, features = $5, is_active = $6, plan_name_en = $7, price_en = $8, features_en = $9 WHERE id = $10 RETURNING *',
            [planName, price, meritCost, durationDays, features, isActive, planNameEn, priceEn, featuresEn, id]
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