// server/models/billing.model.js
import { pool, mapRowToCamelCase } from '../db.js';
import { userModel, enrichUserWithPermissions } from './user.model.js';

export const billingModel = {
    // Pricing Plans
    async findAllPlans() {
        const res = await pool.query('SELECT * FROM pricing_plans ORDER BY merit_cost ASC');
        return res.rows.map(mapRowToCamelCase);
    },
    
    async findPlanById(id) {
        const res = await pool.query('SELECT * FROM pricing_plans WHERE id = $1', [id]);
        return mapRowToCamelCase(res.rows[0]);
    },

    async createPlan(planData) {
        const { planName, planNameEn, price, priceEn, meritCost, requestLimit, aiConfigIds, features, featuresEn, isActive } = planData;
        const res = await pool.query(
            `INSERT INTO pricing_plans (plan_name, plan_name_en, price, price_en, merit_cost, request_limit, ai_config_ids, features, features_en, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [planName, planNameEn, price, priceEn, meritCost, requestLimit, aiConfigIds, features, featuresEn, isActive]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async updatePlan(id, planData) {
        const { planName, planNameEn, price, priceEn, meritCost, requestLimit, aiConfigIds, features, featuresEn, isActive } = planData;
        const res = await pool.query(
            `UPDATE pricing_plans SET
                plan_name = $1, plan_name_en = $2, price = $3, price_en = $4, merit_cost = $5, request_limit = $6,
                ai_config_ids = $7, features = $8, features_en = $9, is_active = $10
             WHERE id = $11 RETURNING *`,
            [planName, planNameEn, price, priceEn, meritCost, requestLimit, aiConfigIds, features, featuresEn, isActive, id]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async deletePlan(id) {
        await pool.query('DELETE FROM pricing_plans WHERE id = $1', [id]);
    },
    
    // Transactions
    async findAllTransactions() {
        const res = await pool.query(`
            SELECT t.*, u.name as user_name, a.name as admin_name
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            LEFT JOIN users a ON t.admin_id = a.id
            ORDER BY t.timestamp DESC
        `);
        return res.rows.map(mapRowToCamelCase);
    },

    async findTransactionsByUserId(userId) {
        const res = await pool.query(`
            SELECT t.*, a.name as admin_name
            FROM transactions t
            LEFT JOIN users a ON t.admin_id = a.id
            WHERE t.user_id = $1
            ORDER BY t.timestamp DESC
        `, [userId]);
        return res.rows.map(mapRowToCamelCase);
    },
    
    async addMerits(userId, merits, adminId, type = 'manual', stripeChargeId = null, details = null) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const res = await client.query(
                'UPDATE users SET merits = COALESCE(merits, 0) + $1 WHERE id = $2 RETURNING *',
                [merits, userId]
            );
            await client.query(
                'INSERT INTO transactions (user_id, merits, admin_id, type, stripe_charge_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
                [userId, merits, adminId, type, stripeChargeId, details]
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
    
    async purchaseSubscription(userId, planId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const plan = await this.findPlanById(planId);
            if (!plan) throw new Error('Plan not found.');

            const user = await userModel.findById(userId);
            if (!user) throw new Error('User not found.');

            if (user.merits !== null && user.merits < plan.meritCost) {
                throw new Error('Not enough merits for this plan.');
            }
            
            if (user.merits !== null) {
                await client.query( 'UPDATE users SET merits = merits - $1 WHERE id = $2', [plan.meritCost, userId]);
                await client.query('INSERT INTO transactions (user_id, merits, type) VALUES ($1, $2, $3)', [userId, -plan.meritCost, 'subscription']);
            }
            
            const finalUserRes = await client.query(
                'UPDATE users SET subscription_plan_id = $1, requests_remaining = $2 WHERE id = $3 RETURNING *',
                [planId, plan.requestLimit, userId]
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
    
    async purchaseAi(userId, aiId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const aiRes = await client.query('SELECT purchase_cost, space_id, requests_granted_on_purchase FROM ai_configs WHERE id = $1', [aiId]);
            if (aiRes.rows.length === 0) throw new Error('AI not found.');
            const { purchase_cost: cost, space_id: spaceId, requests_granted_on_purchase: requestsGranted } = aiRes.rows[0];

            if (!cost || cost <= 0) throw new Error('This AI is not for sale.');
            if (!spaceId) throw new Error('This AI is not associated with a space and cannot be purchased.');

            const ownedRes = await client.query('SELECT 1 FROM user_owned_ais WHERE user_id = $1 AND ai_config_id = $2', [userId, aiId]);
            if (ownedRes.rows.length > 0) throw new Error('You already own this AI.');

            const userRes = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [userId]);
            const user = mapRowToCamelCase(userRes.rows[0]);
            if (!user) throw new Error('User not found.');
            if (user.merits !== null && user.merits < cost) throw new Error('Insufficient merits.');

            let updatedUserRes;

            if (user.merits !== null) {
                updatedUserRes = await client.query('UPDATE users SET merits = merits - $1 WHERE id = $2 RETURNING *', [cost, userId]);
            } else {
                updatedUserRes = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
            }

            await client.query('UPDATE spaces SET merits = merits + $1, merits_sold = merits_sold + $1 WHERE id = $2', [cost, spaceId]);

            await client.query(
                'INSERT INTO transactions (user_id, merits, type, destination_space_id, details) VALUES ($1, $2, $3, $4, $5)',
                [userId, -cost, 'ai_purchase', spaceId, JSON.stringify({ aiConfigId: aiId })]
            );

            await client.query('INSERT INTO user_owned_ais (user_id, ai_config_id, requests_remaining) VALUES ($1, $2, $3)', [userId, aiId, requestsGranted]);

            await client.query('COMMIT');
            
            const updatedUser = await enrichUserWithPermissions(mapRowToCamelCase(updatedUserRes.rows[0]));
            return { updatedUser };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async claimFreeAi(userId, aiId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const aiRes = await client.query('SELECT purchase_cost, requests_granted_on_purchase FROM ai_configs WHERE id = $1', [aiId]);
            if (aiRes.rows.length === 0) throw new Error('AI not found.');
            const { purchase_cost: cost, requests_granted_on_purchase: requestsGranted } = aiRes.rows[0];

            if (cost > 0) throw new Error('This AI is not free.');

            const ownedRes = await client.query('SELECT 1 FROM user_owned_ais WHERE user_id = $1 AND ai_config_id = $2', [userId, aiId]);
            if (ownedRes.rows.length > 0) {
                 // User already owns it, this is not an error, just do nothing.
                 await client.query('COMMIT');
                 const user = await userModel.findById(userId);
                 return { updatedUser: user };
            }

            await client.query('INSERT INTO user_owned_ais (user_id, ai_config_id, requests_remaining) VALUES ($1, $2, $3)', [userId, aiId, requestsGranted || 0]);

            await client.query('COMMIT');
            const updatedUser = await userModel.findById(userId);
            return { updatedUser };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async findWithdrawalRequests() {
        const res = await pool.query(`
            SELECT wr.*, u.name as user_name
            FROM withdrawal_requests wr
            JOIN users u ON wr.user_id = u.id
            WHERE wr.status = 'pending'
            ORDER BY wr.created_at ASC
        `);
        return res.rows.map(mapRowToCamelCase);
    },

    async processWithdrawalRequest(requestId, action) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const res = await client.query(
                'UPDATE withdrawal_requests SET status = $1, updated_at = NOW() WHERE id = $2 AND status = \'pending\' RETURNING *',
                [action, requestId]
            );
            const request = mapRowToCamelCase(res.rows[0]);
            if (!request) {
                throw new Error('Request not found or already processed.');
            }

            if (action === 'approved') {
                await client.query(
                    'UPDATE users SET merits = COALESCE(merits, 0) - $1 WHERE id = $2',
                    [request.amount, request.userId]
                );
                await client.query(
                    'INSERT INTO transactions (user_id, merits, type) VALUES ($1, $2, $3)',
                    [request.userId, -request.amount, 'withdrawal']
                );
            }

            await client.query('COMMIT');
            return request;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async createWithdrawalRequest(userId, amount) {
        const res = await pool.query(
            'INSERT INTO withdrawal_requests (user_id, amount) VALUES ($1, $2) RETURNING *',
            [userId, amount]
        );
        const newRequest = mapRowToCamelCase(res.rows[0]);
        // Also get user name for consistency
        const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
        newRequest.userName = userRes.rows[0]?.name;
        return newRequest;
    },
};