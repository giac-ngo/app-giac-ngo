// server/db.js
import pg from 'pg';
import 'dotenv/config';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper function to map database rows to camelCase object keys
const mapRowToCamelCase = (row) => {
    const newObj = {};
    for (const key in row) {
        const camelCaseKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        newObj[camelCaseKey] = row[key];
    }
    return newObj;
};

export const db = {
    pool,

    // --- User Management ---
    async getUserByEmail(email) {
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return res.rows[0] ? mapRowToCamelCase(res.rows[0]) : null;
    },

    async getUserById(id) {
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return res.rows[0] ? mapRowToCamelCase(res.rows[0]) : null;
    },

    async getAllUsers() {
        const res = await pool.query('SELECT * FROM users ORDER BY id ASC');
        return res.rows.map(mapRowToCamelCase);
    },

    async createUser(userData) {
        const { email, password, name, avatarUrl, isAdmin } = userData;
        if (!email || !password || !name) {
            throw new Error('Email, password, and name are required.');
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const res = await pool.query(
            'INSERT INTO users (email, password, name, avatar_url, is_admin, coins, is_active) VALUES ($1, $2, $3, $4, $5, 0, true) RETURNING *',
            [email, hashedPassword, name, avatarUrl || `https://i.pravatar.cc/150?u=${email}`, !!isAdmin]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async updateUser(id, userData) {
        const { name, email, avatarUrl, isAdmin, coins, apiKeys, isActive } = userData;
        const res = await pool.query(
            `UPDATE users SET 
                name = $1, email = $2, avatar_url = $3, is_admin = $4,
                coins = $5, api_keys = $6, is_active = $7
             WHERE id = $8 RETURNING *`,
            [name, email, avatarUrl, isAdmin, coins, apiKeys, isActive, id]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async deleteUser(id) {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
    },
    
    // --- Coin & Subscription Management ---
    async purchaseSubscription(userId, planId) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
    
            const planRes = await client.query('SELECT coin_cost, duration_days FROM pricing_plans WHERE id = $1', [planId]);
            if (!planRes.rows.length) throw new Error('Gói không tồn tại.');
            const { coin_cost, duration_days } = planRes.rows[0];
    
            const userRes = await client.query('SELECT coins FROM users WHERE id = $1 FOR UPDATE', [userId]);
            const currentCoins = userRes.rows[0].coins;
            if (currentCoins === null || currentCoins < coin_cost) {
                throw new Error('Không đủ coin để mua gói này.');
            }
    
            const newCoins = currentCoins - coin_cost;
            const expiryDateClause = duration_days ? `NOW() + INTERVAL '${duration_days} days'` : 'NULL';
    
            await client.query(
                `UPDATE users SET coins = $1, subscription_plan_id = $2, subscription_expires_at = ${expiryDateClause} WHERE id = $3`,
                [newCoins, planId, userId]
            );
    
            await client.query(
                `INSERT INTO transactions (user_id, admin_id, coins, type) VALUES ($1, NULL, $2, 'subscription')`,
                [userId, -coin_cost]
            );
    
            const updatedUserRes = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
    
            await client.query('COMMIT');
            return mapRowToCamelCase(updatedUserRes.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Lỗi khi mua gói thuê bao:", error);
            throw error;
        } finally {
            client.release();
        }
    },

    async checkSubscriptionStatus(userId) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const userRes = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [userId]);
            if (!userRes.rows.length) {
                await client.query('COMMIT'); 
                return null;
            }
            const user = mapRowToCamelCase(userRes.rows[0]);
    
            if (user.subscriptionPlanId && user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date()) {
                // Subscription expired, try to renew
                const planRes = await client.query('SELECT coin_cost, duration_days FROM pricing_plans WHERE id = $1', [user.subscriptionPlanId]);
                if (planRes.rows.length) {
                    const { coin_cost, duration_days } = planRes.rows[0];
                    if (user.coins !== null && user.coins >= coin_cost) {
                        // Can renew
                        const newCoins = user.coins - coin_cost;
                        const newExpiryDateClause = duration_days ? `NOW() + INTERVAL '${duration_days} days'` : 'NULL';
                        await client.query(
                            `UPDATE users SET coins = $1, subscription_expires_at = ${newExpiryDateClause} WHERE id = $2`,
                            [newCoins, userId]
                        );
                        await client.query(
                            `INSERT INTO transactions (user_id, coins, type) VALUES ($1, $2, 'subscription')`,
                            [userId, -coin_cost]
                        );
                    } else {
                        // Cannot renew, clear subscription
                        await client.query('UPDATE users SET subscription_plan_id = NULL, subscription_expires_at = NULL WHERE id = $1', [userId]);
                    }
                } else {
                     // Plan doesn't exist anymore, clear subscription
                     await client.query('UPDATE users SET subscription_plan_id = NULL, subscription_expires_at = NULL WHERE id = $1', [userId]);
                }
            }
            await client.query('COMMIT');
            const finalUser = await this.getUserById(userId);
            return finalUser;

        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Lỗi khi kiểm tra trạng thái gói:", error);
            // Do not rethrow, to avoid blocking login/other flows
            return this.getUserById(userId); // Return user state before error
        } finally {
            client.release();
        }
    },
    
    async addCoinsToUser(userId, coins, adminId, type = 'manual') {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const userRes = await client.query('SELECT coins FROM users WHERE id = $1', [userId]);
            const currentCoins = userRes.rows[0].coins;
            let updatedCoins = (currentCoins === null) ? null : currentCoins + coins;
            const updateUserRes = await client.query('UPDATE users SET coins = $1 WHERE id = $2 RETURNING *', [updatedCoins, userId]);
            // FIX: Use the 'type' parameter to correctly log the transaction type.
            await client.query('INSERT INTO transactions (user_id, admin_id, coins, type) VALUES ($1, $2, $3, $4)', [userId, adminId, coins, type]);
            await client.query('COMMIT');
            return mapRowToCamelCase(updateUserRes.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },
    
    async deductCoinFromUser(userId) {
        // We only perform the update if the user has a finite, positive number of coins.
        const updateRes = await pool.query(
            'UPDATE users SET coins = coins - 1 WHERE id = $1 AND coins IS NOT NULL AND coins > 0 RETURNING coins',
            [userId]
        );
    
        // If the update happened, return the new coin count.
        if (updateRes.rows.length > 0) {
            return mapRowToCamelCase(updateRes.rows[0]);
        }
    
        // If no update happened (e.g., admin with null coins, or user with 0 coins),
        // we fetch the current coin count and return that, so the client always gets a valid number.
        const userRes = await pool.query('SELECT coins FROM users WHERE id = $1', [userId]);
        return userRes.rows[0] ? mapRowToCamelCase(userRes.rows[0]) : null;
    },
    
    async getAllTransactions() {
        const res = await pool.query(`
            SELECT t.*, u.name as user_name, a.name as admin_name
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.id
            LEFT JOIN users a ON t.admin_id = a.id
            ORDER BY t.timestamp DESC
        `);
        return res.rows.map(mapRowToCamelCase);
    },

    // --- System Config ---
    async getSystemConfig() {
        const res = await pool.query('SELECT * FROM system_config LIMIT 1');
        return res.rows[0] ? mapRowToCamelCase(res.rows[0]) : null;
    },

    async updateSystemConfig(config) {
        const { guestMessageLimit, systemKeys, template, templateSettings } = config;
        const res = await pool.query(
            `UPDATE system_config SET 
                guest_message_limit = $1, 
                system_keys = $2,
                template = $3,
                template_settings = $4
             WHERE id = 1 RETURNING *`,
            [guestMessageLimit, systemKeys, template, templateSettings]
        );
        return mapRowToCamelCase(res.rows[0]);
    },
    
    // --- AI Config Management ---
    async getVisibleAiConfigsForUser(user) {
        let query;
        if (!user) { // Guest user
            query = 'SELECT * FROM ai_configs WHERE is_public = true AND is_trial_allowed = false AND requires_subscription = false ORDER BY id ASC';
        } else {
            const hasActiveSub = user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date();
            if (hasActiveSub) {
                 const planRes = await this.pool.query('SELECT coin_cost FROM pricing_plans WHERE id = $1', [user.subscriptionPlanId]);
                 const isTrial = planRes.rows.length > 0 && planRes.rows[0].coin_cost === 0;
    
                 if (isTrial) {
                     query = 'SELECT * FROM ai_configs WHERE is_public = true AND is_trial_allowed = true ORDER BY id ASC';
                 } else { // Paid subscription
                     query = 'SELECT * FROM ai_configs WHERE is_public = true ORDER BY id ASC';
                 }
            } else { // Logged in user, no active subscription
                 query = 'SELECT * FROM ai_configs WHERE is_public = true AND is_trial_allowed = false AND requires_subscription = false ORDER BY id ASC';
            }
        }
        const res = await this.pool.query(query);
        return res.rows.map(mapRowToCamelCase);
    },

    async getAllAiConfigs() {
        const res = await pool.query('SELECT * FROM ai_configs ORDER BY id ASC');
        return res.rows.map(mapRowToCamelCase);
    },

    async createAiConfig(config) {
        const { name, description, avatarUrl, modelType, modelName, trainingContent, suggestedQuestions, isPublic, ownerId, trainingFileUrls, additionalTrainingContent, isTrialAllowed, requiresSubscription } = config;
        const res = await pool.query(
            `INSERT INTO ai_configs (name, description, avatar_url, model_type, model_name, training_content, suggested_questions, is_public, owner_id, training_file_urls, additional_training_content, is_trial_allowed, requires_subscription) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
            [name, description || '', avatarUrl, modelType, modelName, trainingContent, suggestedQuestions || [], !!isPublic, ownerId, trainingFileUrls || [], additionalTrainingContent || '', !!isTrialAllowed, !!requiresSubscription]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async updateAiConfig(id, config) {
        const { name, description, avatarUrl, modelType, modelName, trainingContent, suggestedQuestions, isPublic, trainingFileUrls, additionalTrainingContent, isTrialAllowed, requiresSubscription } = config;
        const res = await pool.query(
            `UPDATE ai_configs SET 
                name = $1, description = $2, avatar_url = $3, model_type = $4, model_name = $5, training_content = $6, 
                suggested_questions = $7, is_public = $8, training_file_urls = $9, additional_training_content = $10,
                is_trial_allowed = $12, requires_subscription = $13
             WHERE id = $11 RETURNING *`,
            [name, description || '', avatarUrl, modelType, modelName, trainingContent, suggestedQuestions || [], !!isPublic, trainingFileUrls || [], additionalTrainingContent || '', id, !!isTrialAllowed, !!requiresSubscription]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async deleteAiConfig(id) {
        await pool.query('DELETE FROM ai_configs WHERE id = $1', [id]);
    },
    
    async addTrainingContentToAi(aiId, content) {
        const res = await pool.query(
            `UPDATE ai_configs SET 
                additional_training_content = COALESCE(additional_training_content, '') || E'\\n\\n' || $1 
             WHERE id = $2 RETURNING *`,
            [content, aiId]
        );
        return mapRowToCamelCase(res.rows[0]);
    },
    
    // --- Conversation Management ---
    async createConversation(convData) {
        const { userId, userName, aiConfigId, messages } = convData;
        const res = await pool.query(
            'INSERT INTO conversations (user_id, user_name, ai_config_id, messages) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, userName, aiConfigId, JSON.stringify(messages)]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async updateConversation(id, messages) {
        await pool.query('UPDATE conversations SET messages = $1 WHERE id = $2', [JSON.stringify(messages), id]);
    },
    
    async getConversationsByUserId(userId) {
        const res = await pool.query('SELECT * FROM conversations WHERE user_id = $1 ORDER BY start_time DESC', [userId]);
        return res.rows.map(mapRowToCamelCase);
    },

    async getAllConversations() {
        const res = await pool.query('SELECT * FROM conversations ORDER BY start_time DESC');
        return res.rows.map(mapRowToCamelCase);
    },

    async deleteConversation(id) {
        await pool.query('DELETE FROM conversations WHERE id = $1', [id]);
    },

    // --- Pricing Plan Management ---
    async getPricingPlans() {
        const res = await pool.query('SELECT * FROM pricing_plans ORDER BY coin_cost ASC');
        return res.rows.map(mapRowToCamelCase);
    },

    async createPricingPlan(planData) {
        const { planName, price, coinCost, durationDays, features, isActive } = planData;
        const res = await pool.query(
            'INSERT INTO pricing_plans (plan_name, price, coin_cost, duration_days, features, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [planName, price, coinCost, durationDays, features, isActive]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async updatePricingPlan(id, planData) {
        const { planName, price, coinCost, durationDays, features, isActive } = planData;
        const res = await pool.query(
            'UPDATE pricing_plans SET plan_name = $1, price = $2, coin_cost = $3, duration_days = $4, features = $5, is_active = $6 WHERE id = $7 RETURNING *',
            [planName, price, coinCost, durationDays, features, isActive, id]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async deletePricingPlan(id) {
        await pool.query('DELETE FROM pricing_plans WHERE id = $1', [id]);
    },
};
