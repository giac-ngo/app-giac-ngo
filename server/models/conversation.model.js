// server/models/conversation.model.js
import { pool, mapRowToCamelCase } from '../db.js';

export const conversationModel = {
    async findAllByUserId(userId) {
        const res = await pool.query('SELECT * FROM conversations WHERE user_id = $1 ORDER BY start_time DESC', [userId]);
        return res.rows.map(mapRowToCamelCase);
    },

    async findPaginatedForUserAndAi({ userId, aiConfigId, limit, offset }) {
        const countQuery = 'SELECT COUNT(*) FROM conversations WHERE user_id = $1 AND ai_config_id = $2';
        const dataQuery = `
            SELECT * FROM conversations 
            WHERE user_id = $1 AND ai_config_id = $2
            ORDER BY start_time DESC
            LIMIT $3 OFFSET $4
        `;
        const [countRes, dataRes] = await Promise.all([
            pool.query(countQuery, [userId, aiConfigId]),
            pool.query(dataQuery, [userId, aiConfigId, limit, offset])
        ]);

        const total = parseInt(countRes.rows[0].count, 10);
        const data = dataRes.rows.map(mapRowToCamelCase);
        
        return { data, total };
    },

    async findTrainedByAiId(aiId) {
        const res = await pool.query(
            'SELECT * FROM conversations WHERE ai_config_id = $1 AND is_trained = true ORDER BY start_time ASC',
            [aiId]
        );
        return res.rows.map(mapRowToCamelCase);
    },
    
    async findTestByAiId(aiId, userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const res = await pool.query(
            'SELECT * FROM conversations WHERE ai_config_id = $1 AND user_id = $2 AND is_test_chat = true ORDER BY start_time DESC LIMIT $3 OFFSET $4',
            [aiId, userId, limit, offset]
        );
        return res.rows.map(mapRowToCamelCase);
    },
    
    async findLatestByAiId(aiId, userId) {
        const res = await pool.query(
            'SELECT * FROM conversations WHERE ai_config_id = $1 AND user_id = $2 ORDER BY start_time DESC LIMIT 1',
            [aiId, userId]
        );
        return res.rows[0] ? mapRowToCamelCase(res.rows[0]) : null;
    },

    async findAll() {
        const res = await pool.query(`
            SELECT c.*, a.name as ai_name 
            FROM conversations c
            LEFT JOIN ai_configs a ON c.ai_config_id = a.id
            ORDER BY c.start_time DESC
        `);
        return res.rows.map(mapRowToCamelCase);
    },

    async create(convoData) {
        const { userId, userName, aiConfigId, messages, isTestChat } = convoData;
        const res = await pool.query(
            'INSERT INTO conversations (user_id, user_name, ai_config_id, messages, is_test_chat) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, userName, aiConfigId, JSON.stringify(messages), isTestChat || false]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async update(id, messages) {
        const res = await pool.query(
            'UPDATE conversations SET messages = $1 WHERE id = $2 RETURNING *',
            [JSON.stringify(messages), id]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async delete(id) {
        await pool.query('DELETE FROM conversations WHERE id = $1', [id]);
    },
    
    async rename(id, newTitle) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const convoRes = await client.query('SELECT messages FROM conversations WHERE id = $1', [id]);
            if (convoRes.rows.length === 0) throw new Error('Conversation not found.');
            
            const messages = convoRes.rows[0].messages;
            if (messages && messages.length > 0) {
                messages[0].text = newTitle;
            } else {
                 throw new Error('Cannot rename an empty conversation.');
            }
            const updatedRes = await client.query('UPDATE conversations SET messages = $1 WHERE id = $2 RETURNING *', [JSON.stringify(messages), id]);
            await client.query('COMMIT');
            return mapRowToCamelCase(updatedRes.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },
    
    async updateTrainingStatus(id, isTrained) {
         const res = await pool.query(
            'UPDATE conversations SET is_trained = $1 WHERE id = $2 RETURNING *',
            [isTrained, id]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async findTestMessagesByAiId(aiId, userId, page, limit) {
        const offset = (page - 1) * limit;
        const query = `
            SELECT 
                msg->>'id' as id, 
                msg->>'text' as text, 
                msg->>'sender' as sender, 
                (msg->'timestamp')::bigint as timestamp, 
                msg->>'imageUrl' as image_url,
                msg->'fileAttachment' as file_attachment,
                msg->>'thought' as thought,
                msg->>'feedback' as feedback
            FROM conversations c, jsonb_array_elements(c.messages) AS msg
            WHERE c.ai_config_id = $1
              AND c.user_id = $2
              AND c.is_test_chat = true
            ORDER BY (msg->'timestamp')::bigint DESC
            LIMIT $3
            OFFSET $4;
        `;
        const res = await pool.query(query, [aiId, userId, limit, offset]);
        return res.rows.map(row => {
            const mapped = mapRowToCamelCase(row);
            if (typeof mapped.fileAttachment === 'string') {
                try {
                    mapped.fileAttachment = JSON.parse(mapped.fileAttachment);
                } catch (e) {
                    mapped.fileAttachment = null;
                }
            }
            if (mapped.timestamp && typeof mapped.timestamp === 'string') {
                mapped.timestamp = parseInt(mapped.timestamp, 10);
            }
            return mapped;
        });
    },
};