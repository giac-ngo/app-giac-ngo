// server/models/dharmaTalk.model.js
import { pool, mapRowToCamelCase } from '../db.js';

export const dharmaTalkModel = {
    async create(data) {
        const { spaceId, title, titleEn, subtitle, speaker, url, duration, date, tags, tagsEn, status, statusEn } = data;
        const res = await pool.query(
            'INSERT INTO dharma_talks (space_id, title, title_en, subtitle, speaker, url, duration, date, tags, tags_en, status, status_en) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
            [spaceId, title, titleEn, subtitle, speaker, url, duration, date, tags, tagsEn, status, statusEn]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async update(id, data) {
        const { spaceId, title, titleEn, subtitle, speaker, url, duration, date, tags, tagsEn, status, statusEn } = data;
        const res = await pool.query(
            `UPDATE dharma_talks SET
                space_id = $1, title = $2, title_en = $3, subtitle = $4, speaker = $5, url = $6, duration = $7, date = $8, tags = $9, tags_en = $10, status = $11, status_en = $12, updated_at = NOW()
             WHERE id = $13 RETURNING *`,
            [spaceId, title, titleEn, subtitle, speaker, url, duration, date, tags, tagsEn, status, statusEn, id]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async delete(id) {
        const res = await pool.query('DELETE FROM dharma_talks WHERE id = $1 RETURNING *', [id]);
        return mapRowToCamelCase(res.rows[0]);
    },
    
    async incrementLikes(id) {
        const res = await pool.query('UPDATE dharma_talks SET likes = likes + 1 WHERE id = $1 RETURNING likes', [id]);
        return res.rows[0];
    },
};