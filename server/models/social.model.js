// server/models/social.model.js
import { pool, mapRowToCamelCase } from '../db.js';

export const socialModel = {
    async getFeedPosts() {
        const res = await pool.query('SELECT * FROM social_feed_posts ORDER BY created_at DESC');
        return res.rows.map(mapRowToCamelCase);
    },
};