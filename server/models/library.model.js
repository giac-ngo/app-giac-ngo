// server/models/library.model.js
import { pool, mapRowToCamelCase } from '../db.js';

export const libraryModel = {
    async getSidebarData() {
        const res = await pool.query(`
            SELECT
                dt.name AS type_name,
                da.name AS author_name
            FROM
                document_types dt
            CROSS JOIN
                document_authors da
            WHERE
                dt.name IN ('Kệ', 'Câu Chuyện')
            ORDER BY
                dt.name, da.name;
        `);
        return res.rows;
    },

    async getFilters(spaceId, currentFilters = {}) {
        const { typeId, topicsPage = 1, topicsLimit = 15 } = currentFilters;

        const baseParams = [];
        let baseWhereClause = '';

        if (spaceId != null && spaceId !== 'global') {
            baseWhereClause = `WHERE (space_id = $1 OR space_id IS NULL)`;
            baseParams.push(spaceId);
        } else if (spaceId === 'global') {
            baseWhereClause = `WHERE space_id IS NULL`;
        }
        
        if (typeId) {
             const topicsParams = [...baseParams];
             let topicsWhereClause = baseWhereClause;
             topicsWhereClause += (topicsWhereClause ? ' AND' : 'WHERE') + ` type_id = $${topicsParams.length + 1}`;
             topicsParams.push(typeId);

             const topicsQuery = `
                SELECT id, name, name_en
                FROM document_topics
                ${topicsWhereClause}
                ORDER BY number_index ASC
                LIMIT $${topicsParams.length + 1} OFFSET $${topicsParams.length + 2};
            `;
            
            const offset = (topicsPage - 1) * topicsLimit;
            topicsParams.push(topicsLimit, offset);

            const topicsRes = await pool.query(topicsQuery, topicsParams);
            return {
                topics: topicsRes.rows.map(mapRowToCamelCase),
            };
        }
        
        const authorsQuery = `
            SELECT id, name, name_en
            FROM document_authors
            ${baseWhereClause}
            ORDER BY name;
        `;
        
        const typesQuery = `
            SELECT id, name, name_en 
            FROM document_types 
            WHERE name IN ('Kệ', 'Câu Chuyện') 
            ORDER BY id
        `;

        const [typesRes, authorsRes] = await Promise.all([
            pool.query(typesQuery),
            pool.query(authorsQuery, baseParams),
        ]);

        return {
            types: typesRes.rows.map(mapRowToCamelCase),
            authors: authorsRes.rows.map(mapRowToCamelCase),
            topics: [], // Topics are fetched separately when a type is selected.
        };
    },

    async getDocumentWithNeighbors(documentId) {
        await pool.query('UPDATE documents SET views = views + 1 WHERE id = $1', [documentId]);
        
        const res = await pool.query(`
            WITH ranked_docs AS (
                SELECT 
                    id,
                    type_id,
                    created_at,
                    LAG(id, 1) OVER (PARTITION BY type_id ORDER BY created_at) as prev_id,
                    LEAD(id, 1) OVER (PARTITION BY type_id ORDER BY created_at) as next_id,
                    LAG(title, 1) OVER (PARTITION BY type_id ORDER BY created_at) as prev_title,
                    LAG(title_en, 1) OVER (PARTITION BY type_id ORDER BY created_at) as prev_title_en,
                    LEAD(title, 1) OVER (PARTITION BY type_id ORDER BY created_at) as next_title,
                    LEAD(title_en, 1) OVER (PARTITION BY type_id ORDER BY created_at) as next_title_en
                FROM documents
            )
            SELECT
                d.*,
                da.name as author,
                dt.name as type,
                d_topics.name as topic,
                rd.prev_id,
                rd.next_id,
                rd.prev_title,
                rd.prev_title_en,
                rd.next_title,
                rd.next_title_en
            FROM documents d
            LEFT JOIN document_authors da ON d.author_id = da.id
            LEFT JOIN document_types dt ON d.type_id = dt.id
            LEFT JOIN document_topics d_topics ON d.topic_id = d_topics.id
            LEFT JOIN ranked_docs rd ON d.id = rd.id
            WHERE d.id = $1
        `, [documentId]);
        
        return mapRowToCamelCase(res.rows[0]);
    },

    async getTopics(spaceId, page = 1, limit = 15) {
        const offset = (page - 1) * limit;
        
        const params = [];
        let whereClause = '';
        let paramIndex = 1;

        if (spaceId != null && spaceId !== 'global') {
            whereClause = `WHERE (space_id = $${paramIndex++} OR space_id IS NULL)`;
            params.push(spaceId);
        } else if (spaceId === 'global') {
            whereClause = `WHERE space_id IS NULL`;
        }

        const query = `
            SELECT id, name, name_en FROM document_topics
            ${whereClause}
            ORDER BY number_index ASC
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;
        params.push(limit, offset);

        const res = await pool.query(query, params);
        return res.rows.map(mapRowToCamelCase);
    },
};