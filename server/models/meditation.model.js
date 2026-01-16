// server/models/meditation.model.js
import { pool, mapRowToCamelCase } from '../db.js';

export const meditationModel = {
    async create(data) {
        const { spaceId, title, titleEn, description, descriptionEn, audioUrl, audioUrlEn, duration } = data;
        const res = await pool.query(
            `INSERT INTO meditation_sessions 
            (space_id, title, title_en, description, description_en, audio_url, audio_url_en, duration) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`,
            [spaceId, title, titleEn, description, descriptionEn, audioUrl, audioUrlEn, duration]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async update(id, data) {
        const { spaceId, title, titleEn, description, descriptionEn, audioUrl, audioUrlEn, duration } = data;

        // Dynamic update query
        const fields = [];
        const values = [];
        let index = 1;

        if (title !== undefined) { fields.push(`title = $${index++}`); values.push(title); }
        if (titleEn !== undefined) { fields.push(`title_en = $${index++}`); values.push(titleEn); }
        if (description !== undefined) { fields.push(`description = $${index++}`); values.push(description); }
        if (descriptionEn !== undefined) { fields.push(`description_en = $${index++}`); values.push(descriptionEn); }
        if (audioUrl !== undefined) { fields.push(`audio_url = $${index++}`); values.push(audioUrl); }
        if (audioUrlEn !== undefined) { fields.push(`audio_url_en = $${index++}`); values.push(audioUrlEn); }
        if (duration !== undefined) { fields.push(`duration = $${index++}`); values.push(duration); }

        if (fields.length === 0) return null;

        values.push(id);
        const query = `UPDATE meditation_sessions SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${index} RETURNING *`;

        const res = await pool.query(query, values);
        return mapRowToCamelCase(res.rows[0]);
    },

    async delete(id) {
        const res = await pool.query('DELETE FROM meditation_sessions WHERE id = $1 RETURNING *', [id]);
        return mapRowToCamelCase(res.rows[0]);
    },

    async findBySpaceId(spaceId) {
        const res = await pool.query('SELECT * FROM meditation_sessions WHERE space_id = $1', [spaceId]);
        return mapRowToCamelCase(res.rows[0]);
    },

    async findAll() {
        const res = await pool.query(`
            SELECT m.*, s.name as space_name 
            FROM meditation_sessions m 
            LEFT JOIN spaces s ON m.space_id = s.id 
            ORDER BY m.created_at DESC
        `);
        return res.rows.map(mapRowToCamelCase);
    }
};
