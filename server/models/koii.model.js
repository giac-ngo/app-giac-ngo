// server/models/koii.model.js
import { pool, mapRowToCamelCase } from '../db.js';

export const koiiModel = {
    async findLatest(aiConfigId) {
        const res = await pool.query('SELECT * FROM koii_tasks WHERE ai_config_id = $1 ORDER BY created_at DESC LIMIT 1', [aiConfigId]);
        return mapRowToCamelCase(res.rows[0]);
    },

    async create(aiConfigId) {
        const res = await pool.query('INSERT INTO koii_tasks (ai_config_id, status) VALUES ($1, $2) RETURNING *', [aiConfigId, 'pending']);
        return mapRowToCamelCase(res.rows[0]);
    },
    
    async updateStatusByAiId(aiConfigId, status, errorMessage = null) {
        const res = await pool.query(
            'UPDATE koii_tasks SET status = $1, error_message = $2, updated_at = NOW() WHERE id = (SELECT id FROM koii_tasks WHERE ai_config_id = $3 ORDER BY created_at DESC LIMIT 1) RETURNING *',
            [status, errorMessage, aiConfigId]
        );
        return mapRowToCamelCase(res.rows[0]);
    },
};