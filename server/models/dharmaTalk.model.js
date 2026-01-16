// server/models/dharmaTalk.model.js
import { pool, mapRowToCamelCase } from '../db.js';

export const dharmaTalkModel = {
    async create(data) {
        const { spaceId, title, titleEn, subtitle, subtitleEn, speaker, speakerAvatarUrl, url, urlEn, duration, date, tags, tagsEn, status, statusEn } = data;
        const res = await pool.query(
            'INSERT INTO dharma_talks (space_id, title, title_en, subtitle, subtitle_en, speaker, speaker_avatar_url, url, url_en, duration, date, tags, tags_en, status, status_en) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *',
            [spaceId, title, titleEn, subtitle, subtitleEn, speaker, speakerAvatarUrl, url, urlEn, duration, date, tags, tagsEn, status, statusEn]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async update(id, data) {
        const { id: talkId, createdAt, updatedAt, spaceName, ...dataToUpdate } = data;

        const allowedFields = {
            spaceId: 'space_id',
            title: 'title',
            titleEn: 'title_en',
            subtitle: 'subtitle',
            subtitleEn: 'subtitle_en',
            speaker: 'speaker',
            speakerAvatarUrl: 'speaker_avatar_url',
            url: 'url',
            urlEn: 'url_en',
            duration: 'duration',
            date: 'date',
            tags: 'tags',
            tagsEn: 'tags_en',
            status: 'status',
            statusEn: 'status_en',
            notifications: 'notifications',
            views: 'views',
            likes: 'likes',
            rating: 'rating'
        };

        const fieldsToUpdate = Object.keys(dataToUpdate).filter(key => allowedFields[key] !== undefined && dataToUpdate[key] !== undefined);

        if (fieldsToUpdate.length === 0) {
            const res = await pool.query('SELECT * FROM dharma_talks WHERE id = $1', [id]);
            return mapRowToCamelCase(res.rows[0]); // Nothing to update, return current state
        }

        const updateClauses = fieldsToUpdate.map((key, i) => {
            const dbKey = allowedFields[key];
            return `"${dbKey}" = $${i + 1}`;
        });
        const values = fieldsToUpdate.map(key => dataToUpdate[key]);

        const setClauses = updateClauses.join(', ');
        const query = `UPDATE dharma_talks SET ${setClauses}, updated_at = NOW() WHERE id = $${fieldsToUpdate.length + 1} RETURNING *`;
        const finalValues = [...values, id];

        const res = await pool.query(query, finalValues);
        return mapRowToCamelCase(res.rows[0]);
    },

    async delete(id) {
        const res = await pool.query('DELETE FROM dharma_talks WHERE id = $1 RETURNING *', [id]);
        return mapRowToCamelCase(res.rows[0]);
    },

    async incrementLikes(id) {
        const res = await pool.query('UPDATE dharma_talks SET likes = COALESCE(likes, 0) + 1 WHERE id = $1 RETURNING likes', [id]);
        return res.rows[0];
    },

    async incrementViews(id) {
        const res = await pool.query('UPDATE dharma_talks SET views = COALESCE(views, 0) + 1 WHERE id = $1 RETURNING views', [id]);
        return res.rows[0];
    },
};