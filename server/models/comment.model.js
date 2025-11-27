// server/models/comment.model.js
import { pool, mapRowToCamelCase } from '../db.js';

export const commentModel = {
    async findApproved(commentType, sourceId) {
        const res = await pool.query(
            `SELECT c.*, u.name as user_name, u.avatar_url as user_avatar_url 
             FROM comments c 
             JOIN users u ON c.user_id = u.id 
             WHERE c.comment_type = $1 AND c.source_id = $2 AND c.status = 'approved' AND c.parent_id IS NULL
             ORDER BY c.created_at ASC`,
            [commentType, sourceId]
        );
        return res.rows.map(mapRowToCamelCase);
    },

    async create(userId, commentType, sourceId, sourceTitle, content, parentId = null) {
        const res = await pool.query(
            'INSERT INTO comments (user_id, comment_type, source_id, source_title, content, parent_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [userId, commentType, sourceId, sourceTitle, content, parentId, 'pending']
        );
        const newComment = mapRowToCamelCase(res.rows[0]);
        const userRes = await pool.query('SELECT name, avatar_url FROM users WHERE id = $1', [userId]);
        return {
            ...newComment,
            userName: userRes.rows[0]?.name,
            userAvatarUrl: userRes.rows[0]?.avatar_url
        };
    },
    
    async findAll(filters = {}) {
        const { status, type } = filters;
        let query = `
            SELECT c.*, u.name as user_name
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
        `;
        const params = [];
        const whereClauses = [];
        let paramIndex = 1;

        if (status) {
            whereClauses.push(`c.status = $${paramIndex++}`);
            params.push(status);
        }
        if (type) {
            whereClauses.push(`c.comment_type = $${paramIndex++}`);
            params.push(type);
        }
        
        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        
        query += ' ORDER BY c.created_at DESC';

        const res = await pool.query(query, params);
        return res.rows.map(mapRowToCamelCase);
    },

    async updateStatus(commentId, status) {
        const res = await pool.query(
            'UPDATE comments SET status = $1 WHERE id = $2 RETURNING *',
            [status, commentId]
        );
        const updatedComment = mapRowToCamelCase(res.rows[0]);
        const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [updatedComment.userId]);
        return { ...updatedComment, userName: userRes.rows[0]?.name };
    },

    async delete(commentId) {
        await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
    },
};