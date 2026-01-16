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
        const { typeId, authorId, topicsPage = 1, topicsLimit = 15 } = currentFilters;

        const baseParams = [];
        let baseWhereClauses = [];

        if (spaceId != null && spaceId !== 'global') {
            baseWhereClauses.push(`(space_id = $1 OR space_id IS NULL)`);
            baseParams.push(spaceId);
        } else {
            // Default to global only if no space is specified
            baseWhereClauses.push(`space_id IS NULL`);
        }

        if (currentFilters.excludeTypeNames && currentFilters.excludeTypeNames.length > 0) {
            baseWhereClauses.push(`name != ALL($${baseParams.length + 1})`);
            baseParams.push(currentFilters.excludeTypeNames);
        }

        const baseWhereClause = baseWhereClauses.length > 0 ? `WHERE ${baseWhereClauses.join(' AND ')}` : '';

        const authorsQuery = `
            SELECT id, name, name_en
            FROM document_authors
            ${baseWhereClause}
            ORDER BY name;
        `;

        const typesQuery = `
            SELECT id, name, name_en 
            FROM document_types 
            ${baseWhereClause}
            ORDER BY id
        `;

        const [typesRes, authorsRes] = await Promise.all([
            pool.query(typesQuery, baseParams),
            pool.query(authorsQuery, baseParams),
        ]);

        let topics = [];
        // Only fetch topics if both author and type are selected
        if (typeId && authorId) {
            const topicsParams = [typeId, authorId];
            let paramIndex = 3;
            let topicsWhereClauses = [`type_id = $1`, `author_id = $2`];

            // Reuse space filtering logic for topics
            if (spaceId != null && spaceId !== 'global') {
                topicsWhereClauses.push(`(space_id = $${paramIndex++} OR space_id IS NULL)`);
                topicsParams.push(spaceId);
            } else if (spaceId === 'global') {
                topicsWhereClauses.push(`space_id IS NULL`);
            }

            const topicsQuery = `
                SELECT id, name, name_en
                FROM document_topics
                WHERE ${topicsWhereClauses.join(' AND ')}
                ORDER BY number_index ASC
                LIMIT $${paramIndex++} OFFSET $${paramIndex++};
            `;

            const offset = (topicsPage - 1) * topicsLimit;
            topicsParams.push(topicsLimit, offset);

            const topicsRes = await pool.query(topicsQuery, topicsParams);
            topics = topicsRes.rows.map(mapRowToCamelCase);
        }


        return {
            types: typesRes.rows.map(mapRowToCamelCase),
            authors: authorsRes.rows.map(mapRowToCamelCase),
            topics,
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
                da.name_en as author_en,
                dt.name as type,
                dt.name_en as type_en,
                d_topics.name as topic,
                d_topics.name_en as topic_en,
                s.slug as space_slug,
                s.name as space_name,
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
            LEFT JOIN spaces s ON d.space_id = s.id
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
        } else {
            whereClause = `WHERE space_id IS NULL`;
        }

        const query = `
            SELECT id, name, name_en FROM document_topics
            ${whereClause}
            ORDER BY name ASC
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;
        params.push(limit, offset);

        const res = await pool.query(query, params);
        return res.rows.map(mapRowToCamelCase);
    },
};