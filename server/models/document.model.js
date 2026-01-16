// server/models/document.model.js
import { pool, mapRowToCamelCase } from '../db.js';

export const updateTagsForDocument = async (documentId, tags, client = pool) => {
    await client.query('DELETE FROM document_tags WHERE document_id = $1', [documentId]);
    if (tags && tags.length > 0) {
        const tagIds = [];
        for (const tagName of tags) {
            let res = await client.query('SELECT id FROM tags WHERE name = $1', [tagName]);
            if (res.rows.length === 0) {
                res = await client.query('INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id', [tagName]);
            }
            tagIds.push(res.rows[0].id);
        }
        const values = tagIds.map(tagId => `(${documentId}, ${tagId})`).join(',');
        await client.query(`INSERT INTO document_tags (document_id, tag_id) VALUES ${values}`);
    }
};

export const documentModel = {
    // --- Document CRUD ---
    async find(filters) {
        const { title, authorId, typeId, topicId, tagId, isLibrary, typeName, authorName, topicName, limit, offset, sortBy, sortOrder, spaceId, spaceIds } = filters || {};

        const selectClause = `
            SELECT 
                d.*, 
                s.name as space_name,
                s.slug as space_slug,
                da.name AS author,
                da.name_en AS author_en,
                dt.name AS type,
                dt.name_en AS type_en,
                d_topics.name as topic,
                d_topics.name_en AS topic_en,
                (
                    SELECT COALESCE(json_agg(t.name ORDER BY t.name), '[]')
                    FROM document_tags d_tags
                    JOIN tags t ON d_tags.tag_id = t.id
                    WHERE d_tags.document_id = d.id
                ) as tags
        `;
        const fromClause = `
            FROM documents d
            LEFT JOIN spaces s ON d.space_id = s.id
            LEFT JOIN document_authors da ON d.author_id = da.id
            LEFT JOIN document_types dt ON d.type_id = dt.id
            LEFT JOIN document_topics d_topics ON d.topic_id = d_topics.id
        `;

        const params = [];
        const whereClauses = [];
        let paramIndex = 1;

        // Removed hardcoded type filter to allow all document types in library view
        // if (isLibrary) { whereClauses.push(`dt.name IN ('Kệ', 'Câu Chuyện')`); }
        if (title) { whereClauses.push(`(d.title ILIKE $${paramIndex} OR d.title_en ILIKE $${paramIndex})`); params.push(`%${title}%`); paramIndex++; }
        if (authorId) { whereClauses.push(`d.author_id = $${paramIndex++}`); params.push(authorId); }
        if (typeId) { whereClauses.push(`d.type_id = $${paramIndex++}`); params.push(typeId); }
        if (topicId) { whereClauses.push(`d.topic_id = $${paramIndex++}`); params.push(topicId); }
        if (spaceId !== undefined) {
            if (spaceId === 'global' || spaceId === null) {
                whereClauses.push(`d.space_id IS NULL`);
            } else if (spaceId !== '') {
                whereClauses.push(`d.space_id = $${paramIndex++}`);
                params.push(spaceId);
            }
        }
        if (spaceIds && spaceIds.length > 0) {
            whereClauses.push(`d.space_id = ANY($${paramIndex++})`);
            params.push(spaceIds);
        }
        if (typeName) { whereClauses.push(`dt.name = $${paramIndex++}`); params.push(typeName); }
        if (authorName) { whereClauses.push(`da.name = $${paramIndex++}`); params.push(authorName); }
        if (topicName && topicName !== 'Mục Lục') { whereClauses.push(`d_topics.name = $${paramIndex++}`); params.push(topicName); }
        if (tagId) { whereClauses.push(`d.id IN (SELECT document_id FROM document_tags WHERE tag_id = $${paramIndex++})`); params.push(tagId); }
        if (filters.excludeTypeNames && filters.excludeTypeNames.length > 0) {
            whereClauses.push(`dt.name != ALL($${paramIndex++})`);
            params.push(filters.excludeTypeNames);
        }

        const whereClauseString = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : '';

        // Count query needs to join to filter correctly
        const countFromClause = `
            FROM documents d
            LEFT JOIN document_types dt ON d.type_id = dt.id
            LEFT JOIN document_authors da ON d.author_id = da.id
            LEFT JOIN document_topics d_topics ON d.topic_id = d_topics.id
        `;
        const countQuery = `SELECT COUNT(DISTINCT d.id) ${countFromClause} ${whereClauseString}`;

        let dataQuery = selectClause + fromClause + whereClauseString + ` GROUP BY d.id, s.id, da.id, dt.id, d_topics.id`;

        if (sortBy && sortOrder) {
            if (sortBy === 'views') { // Special case for homepage library, sort by multiple criteria
                dataQuery += ` ORDER BY d.views DESC, d.likes DESC, d.rating DESC`;
            } else {
                const safeSortBy = sortBy.replace(/[^a-zA-Z0-9_]/g, ''); // Basic sanitization
                const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
                dataQuery += ` ORDER BY d.${safeSortBy} ${safeSortOrder}`;
            }
        } else {
            dataQuery += ' ORDER BY d.created_at DESC';
        }

        const dataParams = [...params];
        if (limit) {
            dataQuery += ` LIMIT $${paramIndex++}`;
            dataParams.push(limit);
        }
        if (offset) {
            dataQuery += ` OFFSET $${paramIndex++}`;
            dataParams.push(offset);
        }

        const [countResult, dataResult] = await Promise.all([
            pool.query(countQuery, params),
            pool.query(dataQuery, dataParams)
        ]);

        const total = parseInt(countResult.rows[0].count, 10);
        const data = dataResult.rows.map(mapRowToCamelCase);

        return { data, total };
    },

    async findById(id) {
        const res = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
        return mapRowToCamelCase(res.rows[0]);
    },

    async create(docData, tags = []) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const { title, summary, authorId, typeId, topicId, content, thumbnailUrl, audioUrl, titleEn, summaryEn, contentEn, audioUrlEn, spaceId, rating, duration } = docData;
            const res = await client.query(
                'INSERT INTO documents (title, summary, author_id, type_id, topic_id, content, thumbnail_url, audio_url, title_en, summary_en, content_en, audio_url_en, space_id, rating, duration) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *',
                [title, summary, authorId, typeId, topicId, content, thumbnailUrl, audioUrl, titleEn, summaryEn, contentEn, audioUrlEn, spaceId, rating, duration]
            );
            const newDoc = mapRowToCamelCase(res.rows[0]);

            if (tags.length > 0) {
                await updateTagsForDocument(newDoc.id, tags, client);
            }

            await client.query('COMMIT');

            const finalDocRes = await pool.query(`
                SELECT 
                    d.*, 
                    s.name as space_name,
                    da.name AS author,
                    dt.name AS type,
                    d_topics.name as topic,
                    COALESCE(json_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags
                FROM documents d
                LEFT JOIN spaces s ON d.space_id = s.id
                LEFT JOIN document_authors da ON d.author_id = da.id
                LEFT JOIN document_types dt ON d.type_id = dt.id
                LEFT JOIN document_topics d_topics ON d.topic_id = d_topics.id
                LEFT JOIN document_tags d_tags ON d.id = d_tags.document_id
                LEFT JOIN tags t ON d_tags.tag_id = t.id
                WHERE d.id = $1
                GROUP BY d.id, s.name, da.name, dt.name, d_topics.name
            `, [newDoc.id]);

            return mapRowToCamelCase(finalDocRes.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async update(id, docData, tags) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const {
                id: docId,
                author,
                authorEn,
                type,
                typeEn,
                topic,
                topicEn,
                createdAt,
                spaceName,
                spaceSlug,
                comments,
                prevId,
                nextId,
                prevTitle,
                nextTitle,
                prevTitleEn,
                nextTitleEn,
                updatedAt,
                ...fieldsToUpdate
            } = docData;

            if (Object.keys(fieldsToUpdate).length > 0) {
                const setClauses = Object.keys(fieldsToUpdate).map((key, i) => {
                    const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                    return `${dbKey} = $${i + 1}`;
                }).join(', ');
                const values = Object.values(fieldsToUpdate);
                await client.query(`UPDATE documents SET ${setClauses} WHERE id = $${values.length + 1}`, [...values, id]);
            }

            if (tags !== undefined) {
                await updateTagsForDocument(id, tags, client);
            }

            await client.query('COMMIT');

            const finalDocRes = await pool.query(`
                 SELECT 
                    d.*, 
                    s.name as space_name,
                    da.name AS author,
                    dt.name AS type,
                    d_topics.name as topic,
                    COALESCE(json_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags
                FROM documents d
                LEFT JOIN spaces s ON d.space_id = s.id
                LEFT JOIN document_authors da ON d.author_id = da.id
                LEFT JOIN document_types dt ON d.type_id = dt.id
                LEFT JOIN document_topics d_topics ON d.topic_id = d_topics.id
                LEFT JOIN document_tags d_tags ON d.id = d_tags.document_id
                LEFT JOIN tags t ON d_tags.tag_id = t.id
                WHERE d.id = $1
                GROUP BY d.id, s.name, da.name, dt.name, d_topics.name
            `, [id]);

            if (finalDocRes.rows.length === 0) throw new Error(`Document with ID ${id} not found.`);
            return mapRowToCamelCase(finalDocRes.rows[0]);

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async delete(id) {
        await pool.query('DELETE FROM documents WHERE id = $1', [id]);
    },

    async incrementLikes(id) {
        const res = await pool.query('UPDATE documents SET likes = likes + 1 WHERE id = $1 RETURNING likes', [id]);
        return res.rows[0];
    },

    // --- Tags ---
    async findAllTags() {
        const res = await pool.query('SELECT * FROM tags ORDER BY name ASC');
        return res.rows.map(mapRowToCamelCase);
    },

    // --- Categories (Authors, Types, Topics) ---
    async _findCategory(tableName, spaceId) {
        if (tableName === 'document_topics') {
            let query = `SELECT t.*, dt.name as type_name FROM document_topics t LEFT JOIN document_types dt ON t.type_id = dt.id`;
            const params = [];
            if (spaceId) {
                if (spaceId === 'global') {
                    query += ' WHERE t.space_id IS NULL';
                } else if (Array.isArray(spaceId)) {
                    query += ' WHERE (t.space_id = ANY($1) OR t.space_id IS NULL)';
                    params.push(spaceId);
                } else {
                    query += ' WHERE (t.space_id = $1 OR t.space_id IS NULL)';
                    params.push(spaceId);
                }
            }
            query += ' ORDER BY t.name ASC';
            const res = await pool.query(query, params);
            return res.rows.map(mapRowToCamelCase);
        }
        // Original logic for authors and types
        let query = `SELECT * FROM ${tableName}`;
        const params = [];
        if (spaceId) {
            if (spaceId === 'global') {
                query += ' WHERE space_id IS NULL';
            } else if (Array.isArray(spaceId)) {
                query += ' WHERE (space_id = ANY($1) OR space_id IS NULL)';
                params.push(spaceId);
            } else {
                query += ' WHERE (space_id = $1 OR space_id IS NULL)';
                params.push(spaceId);
            }
        }
        query += ' ORDER BY name ASC';
        const res = await pool.query(query, params);
        return res.rows.map(mapRowToCamelCase);
    },
    async _createCategory(tableName, data) {
        const columns = [];
        const values = [];
        const placeholders = [];
        let i = 1;

        for (const key in data) {
            // Ensure we don't try to insert undefined values, but allow nulls
            if (data[key] !== undefined) {
                columns.push(key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`));
                values.push(data[key]);
                placeholders.push(`$${i++}`);
            }
        }

        if (columns.length === 0) {
            throw new Error("No data provided for category creation.");
        }

        const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;

        const res = await pool.query(query, values);
        return mapRowToCamelCase(res.rows[0]);
    },
    async _updateCategory(tableName, id, data) {
        const fields = Object.keys(data);
        if (fields.length === 0) {
            const res = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
            return mapRowToCamelCase(res.rows[0]);
        }

        const setClauses = fields.map((key, i) => {
            const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            return `${dbKey} = $${i + 1}`;
        }).join(', ');

        const values = fields.map(key => data[key]);
        const res = await pool.query(
            `UPDATE ${tableName} SET ${setClauses} WHERE id = $${fields.length + 1} RETURNING *`,
            [...values, id]
        );
        return mapRowToCamelCase(res.rows[0]);
    },
    async _deleteCategory(tableName, id) {
        let documentTableColumn;
        switch (tableName) {
            case 'document_authors':
                documentTableColumn = 'author_id';
                break;
            case 'document_types':
                documentTableColumn = 'type_id';
                break;
            case 'document_topics':
                documentTableColumn = 'topic_id';
                break;
            default:
                throw new Error(`Unknown category table: ${tableName}`);
        }
        const checkRes = await pool.query(`SELECT 1 FROM documents WHERE ${documentTableColumn} = $1 LIMIT 1`, [id]);
        if (checkRes.rows.length > 0) {
            throw new Error(`Cannot delete this item because it is currently used by one or more documents.`);
        }
        await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
    },

    // --- Linking ---
    async linkToAi(aiConfigId, documentIds) {
        if (!documentIds || documentIds.length === 0) return;
        const values = documentIds.map(docId => `(${aiConfigId}, ${docId})`).join(',');
        await pool.query(`INSERT INTO ai_config_documents (ai_config_id, document_id) VALUES ${values} ON CONFLICT DO NOTHING`);
        return { success: true };
    },

    async unlinkFromAi(aiConfigId, documentId) {
        await pool.query('DELETE FROM ai_config_documents WHERE ai_config_id = $1 AND document_id = $2', [aiConfigId, documentId]);
    },

    // --- Document Config ---
    async getConfig() {
        const res = await pool.query('SELECT * FROM document_config WHERE id = 1 LIMIT 1');
        return mapRowToCamelCase(res.rows[0]);
    },

    async updateConfig(config) {
        const { translationProvider, translationModel, ttsProvider, ttsModel, ttsVoice } = config;
        const query = `
            INSERT INTO document_config (id, translation_provider, translation_model, tts_provider, tts_model, tts_voice)
            VALUES (1, $1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE SET
                translation_provider = EXCLUDED.translation_provider,
                translation_model = EXCLUDED.translation_model,
                tts_provider = EXCLUDED.tts_provider,
                tts_model = EXCLUDED.tts_model,
                tts_voice = EXCLUDED.tts_voice
            RETURNING *;
        `;
        const res = await pool.query(query, [translationProvider, translationModel, ttsProvider, ttsModel, ttsVoice]);
        return mapRowToCamelCase(res.rows[0]);
    }
};