
// server/models/trainingData.model.js
import { pool, mapRowToCamelCase } from '../db.js';

export const trainingDataModel = {
    async findByAiId(aiId) {
        const res = await pool.query(`
            SELECT 
                id, ai_config_id, type, question, answer, thought, file_url, file_name, summary, 
                COALESCE(indexed_providers, '{}') as indexed_providers, 
                created_at, last_exported_at,
                NULL AS document_id, NULL AS document_name
            FROM training_data_sources 
            WHERE ai_config_id = $1
            
            UNION ALL
            
            SELECT 
                -acd.document_id AS id,
                acd.ai_config_id,
                'document' AS type,
                NULL AS question, NULL AS answer, NULL as thought, NULL as file_url, NULL as file_name,
                d.summary,
                ARRAY['gpt', 'gemini'] AS indexed_providers, -- Assuming documents are conceptually indexed for all for UI simplicity, or handle separately
                d.created_at,
                NULL as last_exported_at,
                d.id AS document_id,
                d.title AS document_name
            FROM ai_config_documents acd
            JOIN documents d ON acd.document_id = d.id
            WHERE acd.ai_config_id = $1
            
            ORDER BY created_at DESC
        `, [aiId]);
        return res.rows.map(mapRowToCamelCase);
    },

    async findByAiIdForChat(aiId) {
        const res = await pool.query(`
            SELECT type, question, answer, file_name, file_url, summary
            FROM training_data_sources
            WHERE ai_config_id = $1
            
            UNION ALL
            
            SELECT 
                'document' AS type,
                NULL AS question,
                d.content AS answer,
                d.title AS file_name,
                NULL as file_url,
                d.summary
            FROM ai_config_documents acd
            JOIN documents d ON acd.document_id = d.id
            WHERE acd.ai_config_id = $1
        `, [aiId]);
        return res.rows.map(mapRowToCamelCase);
    },

    async create(data) {
        const { aiConfigId, type, question, answer, thought, fileName, fileUrl } = data;
        const res = await pool.query(
            'INSERT INTO training_data_sources (ai_config_id, type, question, answer, thought, file_name, file_url, indexed_providers) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [aiConfigId, type, question, answer, thought, fileName, fileUrl, []] // Initialize indexed_providers as empty array
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async updateSummary(id, summary) {
        const res = await pool.query(
            'UPDATE training_data_sources SET summary = $1 WHERE id = $2 RETURNING *',
            [summary, id]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async addIndexedProvider(sourceId, provider) {
        // Appends provider to the array if it's not already there. 
        // COALESCE(indexed_providers, '{}') ensures we append to an empty array instead of NULL.
        await pool.query(`
            UPDATE training_data_sources 
            SET indexed_providers = array_append(COALESCE(indexed_providers, '{}'), $1)
            WHERE id = $2 AND NOT ($1 = ANY(COALESCE(indexed_providers, '{}')))
        `, [provider, sourceId]);
    },

    async delete(id) {
        const res = await pool.query('DELETE FROM training_data_sources WHERE id = $1 RETURNING *', [id]);
        return mapRowToCamelCase(res.rows[0]);
    },

    async deleteByContent(aiConfigId, question, answer) {
        const res = await pool.query(
            'DELETE FROM training_data_sources WHERE ai_config_id = $1 AND question = $2 AND answer = $3 RETURNING *',
            [aiConfigId, question, answer]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async findAllQaData(userId = null) {
        let query = `
            SELECT 
                tds.*, 
                ac.name as ai_name 
            FROM training_data_sources tds
            JOIN ai_configs ac ON tds.ai_config_id = ac.id
            LEFT JOIN spaces s ON ac.space_id = s.id
            WHERE tds.type = 'qa'
        `;

        const params = [];

        // Filter by owner if userId is provided
        if (userId) {
            query += ` AND s.user_id = $1`;
            params.push(userId);
        }

        query += ` ORDER BY ac.name, tds.created_at`;

        const res = await pool.query(query, params);
        return res.rows.map(mapRowToCamelCase);
    },

    async markAsExported(sourceIds) {
        if (!sourceIds || sourceIds.length === 0) return;
        const res = await pool.query(
            'UPDATE training_data_sources SET last_exported_at = NOW() WHERE id = ANY($1::int[]) RETURNING id',
            [sourceIds]
        );
        return res.rows;
    },
};
