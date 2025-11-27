// server/models/aiConfig.model.js
import { pool, mapRowToCamelCase } from '../db.js';

const AI_CONFIG_DETAILS_QUERY = `
    SELECT ac.id, ac.space_id, ac.name, ac.name_en, ac.description, ac.description_en, 
           ac.avatar_url, ac.model_type, ac.model_name, ac.training_content, 
           ac.suggested_questions, ac.suggested_questions_en, ac.tags, ac.is_public, 
           ac.is_trial_allowed, ac.requires_subscription, ac.is_contact_for_access,
           ac.max_output_tokens, ac.thinking_budget, ac.purchase_cost, ac.old_purchase_cost,
           ac.is_on_sale, ac.requests_granted_on_purchase, ac.views, ac.likes, ac.rating,
           ac.created_at, ac.updated_at,
           s.user_id as owner_id
    FROM ai_configs ac
    LEFT JOIN spaces s ON ac.space_id = s.id
`;

export const aiConfigModel = {
    async findVisibleForUser(user) {
        let query = AI_CONFIG_DETAILS_QUERY;
        const params = [];
        let whereClauses = [];

        if (user && user.id) {
            // A logged-in user can see public AIs, their own AIs, and AIs they've purchased.
            const spaceRes = await pool.query('SELECT id FROM spaces WHERE user_id = $1', [user.id]);
            const userSpaceIds = spaceRes.rows.map(r => r.id);

            let userClause = 'ac.is_public = true';
            if (userSpaceIds.length > 0) {
                 const spacePlaceholders = userSpaceIds.map((_, i) => `$${params.length + i + 1}`).join(',');
                 userClause += ` OR ac.space_id IN (${spacePlaceholders})`;
                 params.push(...userSpaceIds);
            }
            whereClauses.push(`(${userClause})`);

        } else {
            // Guests only see public AIs. The card on the frontend will show the price.
            whereClauses.push("ac.is_public = true");
        }
        
        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        
        query += ' ORDER BY ac.name ASC';
        const res = await pool.query(query, params);
        return res.rows.map(mapRowToCamelCase);
    },

    async findManageableForUser(user) {
        if (!user.permissions) return [];

        if (user.permissions.includes('roles')) { // Super admin can manage all AIs
            const res = await pool.query(`${AI_CONFIG_DETAILS_QUERY} ORDER BY ac.name ASC`);
            return res.rows.map(mapRowToCamelCase);
        }
        if (user.permissions.includes('ai')) { // Content Manager can manage AIs in their own space(s)
            const spaceRes = await pool.query('SELECT id FROM spaces WHERE user_id = $1', [user.id]);
            if (spaceRes.rows.length === 0) {
                return []; // This user manages no spaces, so no AIs.
            }
            const spaceIds = spaceRes.rows.map(r => r.id);
            const res = await pool.query(`${AI_CONFIG_DETAILS_QUERY} WHERE ac.space_id = ANY($1::int[]) ORDER BY ac.name ASC`, [spaceIds]);
            return res.rows.map(mapRowToCamelCase);
        }
        return [];
    },

    async findById(id) {
        const res = await pool.query(`${AI_CONFIG_DETAILS_QUERY} WHERE ac.id = $1`, [id]);
        return mapRowToCamelCase(res.rows[0]);
    },
    
    async findBySpaceId(spaceId) {
        const res = await pool.query(`${AI_CONFIG_DETAILS_QUERY} WHERE ac.space_id = $1 ORDER BY ac.name ASC`, [spaceId]);
        return res.rows.map(mapRowToCamelCase);
    },

    async create(configData) {
        const { spaceId, name, nameEn, description, descriptionEn, avatarUrl, modelType, modelName, trainingContent, suggestedQuestions, suggestedQuestionsEn, tags, isPublic, isTrialAllowed, requiresSubscription, isContactForAccess, maxOutputTokens, thinkingBudget, views, likes, rating, purchaseCost, oldPurchaseCost, isOnSale, requestsGrantedOnPurchase } = configData;
        const query = `INSERT INTO ai_configs (space_id, name, name_en, description, description_en, avatar_url, model_type, model_name, training_content, suggested_questions, suggested_questions_en, tags, is_public, is_trial_allowed, requires_subscription, is_contact_for_access, max_output_tokens, thinking_budget, views, likes, rating, purchase_cost, old_purchase_cost, is_on_sale, requests_granted_on_purchase) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25) RETURNING *`;
        const values = [spaceId, name, nameEn, description, descriptionEn, avatarUrl, modelType, modelName, trainingContent, suggestedQuestions, suggestedQuestionsEn, tags, isPublic, isTrialAllowed, requiresSubscription, isContactForAccess, maxOutputTokens, thinkingBudget, views, likes, rating, purchaseCost, oldPurchaseCost, isOnSale, requestsGrantedOnPurchase];
        
        const res = await pool.query(query, values);
        return mapRowToCamelCase(res.rows[0]);
    },

    async update(id, configData) {
        const { ownerId, id: configId, createdAt, updatedAt, ...dataToUpdate } = configData;

        const allowedFields = {
            spaceId: 'space_id',
            name: 'name',
            nameEn: 'name_en',
            description: 'description',
            descriptionEn: 'description_en',
            avatarUrl: 'avatar_url',
            modelType: 'model_type',
            modelName: 'model_name',
            trainingContent: 'training_content',
            suggestedQuestions: 'suggested_questions',
            suggestedQuestionsEn: 'suggested_questions_en',
            tags: 'tags',
            isPublic: 'is_public',
            isTrialAllowed: 'is_trial_allowed',
            requiresSubscription: 'requires_subscription',
            isContactForAccess: 'is_contact_for_access',
            maxOutputTokens: 'max_output_tokens',
            thinkingBudget: 'thinking_budget',
            purchaseCost: 'purchase_cost',
            oldPurchaseCost: 'old_purchase_cost',
            isOnSale: 'is_on_sale',
            requestsGrantedOnPurchase: 'requests_granted_on_purchase',
            views: 'views',
            likes: 'likes', // Explicitly map 'likes'
            rating: 'rating'
        };

        const fieldsToUpdate = Object.keys(dataToUpdate).filter(key => allowedFields[key] !== undefined);

        if (fieldsToUpdate.length === 0) {
            return this.findById(id); // Nothing to update
        }

        const updateClauses = fieldsToUpdate.map((key, i) => {
            const dbKey = allowedFields[key];
            return `"${dbKey}" = $${i + 1}`;
        });
        const values = fieldsToUpdate.map(key => dataToUpdate[key]);
        
        const setClauses = updateClauses.join(', ');

        const query = `UPDATE ai_configs SET ${setClauses}, updated_at = NOW() WHERE id = $${fieldsToUpdate.length + 1} RETURNING *`;
        const finalValues = [...values, id];
        
        const res = await pool.query(query, finalValues);
        
        return mapRowToCamelCase(res.rows[0]);
    },

    async delete(id) {
        await pool.query('DELETE FROM ai_configs WHERE id = $1', [id]);
    },

    async getAccessList(aiConfigId) {
        const res = await pool.query(`
            SELECT u.id, u.name, u.email, u.avatar_url 
            FROM ai_user_access aua
            JOIN users u ON aua.user_id = u.id
            WHERE aua.ai_config_id = $1
            ORDER BY u.name
        `, [aiConfigId]);
        return res.rows.map(mapRowToCamelCase);
    },

    async setAccessList(aiConfigId, userIds) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('DELETE FROM ai_user_access WHERE ai_config_id = $1', [aiConfigId]);
            if (userIds && userIds.length > 0) {
                const values = userIds.map(userId => `(${aiConfigId}, ${userId})`).join(',');
                await client.query(`INSERT INTO ai_user_access (ai_config_id, user_id) VALUES ${values}`);
            }
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async checkUserAccess(aiConfigId, userId) {
        const res = await pool.query('SELECT 1 FROM ai_user_access WHERE ai_config_id = $1 AND user_id = $2', [aiConfigId, userId]);
        return res.rows.length > 0;
    },
    
    async getUserRequestCount(userId, aiConfigId) {
        const res = await pool.query(
            'SELECT requests_remaining FROM user_owned_ais WHERE user_id = $1 AND ai_config_id = $2',
            [userId, aiConfigId]
        );
        return res.rows[0] ? res.rows[0].requests_remaining : null;
    },
    
    async decrementUserRequestCount(userId, aiConfigId) {
        const res = await pool.query(
            `UPDATE user_owned_ais 
             SET requests_remaining = requests_remaining - 1 
             WHERE user_id = $1 AND ai_config_id = $2 AND requests_remaining > 0
             RETURNING requests_remaining`,
            [userId, aiConfigId]
        );
        return res.rows.length > 0 ? res.rows[0].requests_remaining : 0;
    }
};