// server/models/system.model.js
import { pool, mapRowToCamelCase } from '../db.js';
import { cryptoService } from '../services/cryptoService.js';

export const systemModel = {
    async getConfig() {
        const res = await pool.query('SELECT * FROM system_config LIMIT 1');
        const config = mapRowToCamelCase(res.rows[0]);

        if (config && config.systemKeys) {
            const decryptedKeys = {};
            for (const key in config.systemKeys) {
                if (config.systemKeys[key]) {
                    decryptedKeys[key] = cryptoService.decrypt(config.systemKeys[key]);
                } else {
                    decryptedKeys[key] = '';
                }
            }
            config.systemKeys = decryptedKeys;
        }

        return config;
    },

    async updateConfig(config) {
        const { guestMessageLimit, template, templateSettings, systemKeys } = config;

        let encryptedKeys = null;
        if (systemKeys) {
            encryptedKeys = {};
            for (const key in systemKeys) {
                if (systemKeys[key]) {
                    encryptedKeys[key] = cryptoService.encrypt(systemKeys[key]);
                } else {
                    encryptedKeys[key] = '';
                }
            }
        }

        const res = await pool.query(
            'UPDATE system_config SET guest_message_limit = $1, template = $2, template_settings = $3, system_keys = $4 WHERE id = 1 RETURNING *',
            [guestMessageLimit, template, templateSettings, encryptedKeys]
        );

        // After updating, return the decrypted version for immediate use on the client
        const updatedConfig = mapRowToCamelCase(res.rows[0]);
        if (updatedConfig && updatedConfig.systemKeys) {
            const decryptedKeys = {};
            for (const key in updatedConfig.systemKeys) {
                if (updatedConfig.systemKeys[key]) {
                    decryptedKeys[key] = cryptoService.decrypt(updatedConfig.systemKeys[key]);
                } else {
                    decryptedKeys[key] = '';
                }
            }
            updatedConfig.systemKeys = decryptedKeys;
        }

        return updatedConfig;
    },

    async getDashboardStats(spaceIds = null) {
        const client = await pool.connect();
        try {
            const hasFilter = Array.isArray(spaceIds) && spaceIds.length > 0;
            const params = hasFilter ? [spaceIds] : [];
            const whereClause = hasFilter ? 'WHERE space_id = ANY($1)' : '';
            const whereClauseId = hasFilter ? 'WHERE id = ANY($1)' : '';
            const whereClauseAi = hasFilter ? 'WHERE a.space_id = ANY($1)' : '';

            // For users, if filtering by space, count distinct members in those spaces.
            // If admin (no filter), count all users in system.
            const userQuery = hasFilter
                ? 'SELECT COUNT(DISTINCT user_id) AS total_users FROM space_members WHERE space_id = ANY($1)'
                : 'SELECT COUNT(*) AS total_users FROM users';

            // For AI Configs, Documents, Dharma Talks: direct space_id check
            const aiQuery = `SELECT COUNT(*) AS total_ai_configs FROM ai_configs ${whereClause}`;
            const docQuery = `SELECT COUNT(*) AS total_documents FROM documents ${whereClause}`;
            const dharmaQuery = `SELECT COUNT(*) AS total_dharma_talks FROM dharma_talks ${whereClause}`;

            // For Spaces: filter by ID
            const spaceQuery = `SELECT COUNT(*) AS total_spaces FROM spaces ${whereClauseId}`;

            // For Conversations: Join with AI Configs to check space
            // If no filter, simple count. If filter, join.
            const convQuery = hasFilter
                ? 'SELECT COUNT(c.id) AS total_conversations FROM conversations c JOIN ai_configs a ON c.ai_config_id = a.id WHERE a.space_id = ANY($1)'
                : 'SELECT COUNT(*) AS total_conversations FROM conversations';

            const interactingUsersQuery = hasFilter
                ? 'SELECT COUNT(DISTINCT c.user_id) AS interacting_users FROM conversations c JOIN ai_configs a ON c.ai_config_id = a.id WHERE c.user_id IS NOT NULL AND a.space_id = ANY($1)'
                : 'SELECT COUNT(DISTINCT user_id) AS interacting_users FROM conversations WHERE user_id IS NOT NULL';

            // Complex Queries with potential params
            const feedbackQuery = `
                    WITH feedback_per_convo AS (
                        SELECT 
                            conv.id as conversation_id,
                            SUM(CASE WHEN (msg->>'feedback') = 'liked' THEN 1 ELSE 0 END)::int as likes,
                            SUM(CASE WHEN (msg->>'feedback') = 'disliked' THEN 1 ELSE 0 END)::int as dislikes
                        FROM conversations AS conv
                        CROSS JOIN LATERAL jsonb_array_elements(conv.messages) AS msg
                        WHERE msg->>'sender' = 'ai'
                        GROUP BY conv.id
                    ),
                    ai_stats AS (
                        SELECT 
                            c.ai_config_id, 
                            COUNT(c.id) as conversation_count,
                            SUM(fpc.likes)::int as total_likes,
                            SUM(fpc.dislikes)::int as total_dislikes
                        FROM conversations c
                        LEFT JOIN feedback_per_convo fpc ON c.id = fpc.conversation_id
                        GROUP BY c.ai_config_id
                    )
                    SELECT
                        a.id, a.name, a.avatar_url,
                        COALESCE(s.conversation_count, 0)::bigint as conversation_count,
                        COALESCE(s.total_likes, 0)::int as total_likes,
                        COALESCE(s.total_dislikes, 0)::int as total_dislikes
                    FROM ai_configs a
                    LEFT JOIN ai_stats s ON a.id = s.ai_config_id
                    ${whereClauseAi ? 'WHERE a.space_id = ANY($1)' : ''}
                    ORDER BY conversation_count DESC, a.name ASC
                    LIMIT 5;
                `;

            const recentConvQuery = `
                    SELECT c.id, c.user_name, c.start_time, a.name AS ai_name 
                    FROM conversations c
                    JOIN ai_configs a ON c.ai_config_id = a.id
                    ${whereClauseAi ? 'WHERE a.space_id = ANY($1)' : ''}
                    ORDER BY c.start_time DESC 
                    LIMIT 5;
                `;

            const topDocsQuery = `
                    SELECT id, title, title_en, thumbnail_url, views, likes 
                    FROM documents 
                    ${whereClause}
                    ORDER BY views DESC, likes DESC 
                    LIMIT 5
                `;

            const topSpacesQuery = `
                    SELECT id, name, name_en, slug, image_url, members_count, views, likes 
                    FROM spaces 
                    ${whereClauseId}
                    ORDER BY members_count DESC, views DESC 
                    LIMIT 5
                `;

            const topDharmaQuery = `
                    SELECT id, title, title_en, speaker, views, likes 
                    FROM dharma_talks 
                    ${whereClause}
                    ORDER BY views DESC, likes DESC 
                    LIMIT 5
                `;


            const statsPromises = [
                client.query(userQuery, params),
                client.query(aiQuery, params),
                client.query(convQuery, params),
                client.query(interactingUsersQuery, params),
                client.query(feedbackQuery, params),
                client.query(recentConvQuery, params),
                client.query(docQuery, params),
                client.query(spaceQuery, params),
                client.query(dharmaQuery, params),
                client.query(topDocsQuery, params),
                client.query(topSpacesQuery, params),
                client.query(topDharmaQuery, params),
            ];

            const [
                totalUsersRes,
                totalAiConfigsRes,
                totalConversationsRes,
                interactingUsersRes,
                topAIsRes,
                recentConversationsRes,
                totalDocumentsRes,
                totalSpacesRes,
                totalDharmaTalksRes,
                topDocumentsRes,
                topSpacesRes,
                topDharmaTalksRes
            ] = await Promise.all(statsPromises);

            return {
                totalUsers: parseInt(totalUsersRes.rows[0].total_users, 10),
                totalAiConfigs: parseInt(totalAiConfigsRes.rows[0].total_ai_configs, 10),
                totalConversations: parseInt(totalConversationsRes.rows[0].total_conversations, 10),
                interactingUsers: parseInt(interactingUsersRes.rows[0].interacting_users, 10),
                topAIs: topAIsRes.rows.map(mapRowToCamelCase),
                recentConversations: recentConversationsRes.rows.map(mapRowToCamelCase),
                totalDocuments: parseInt(totalDocumentsRes.rows[0].total_documents, 10),
                totalSpaces: parseInt(totalSpacesRes.rows[0].total_spaces, 10),
                totalDharmaTalks: parseInt(totalDharmaTalksRes.rows[0].total_dharma_talks, 10),
                topDocuments: topDocumentsRes.rows.map(mapRowToCamelCase),
                topSpaces: topSpacesRes.rows.map(mapRowToCamelCase),
                topDharmaTalks: topDharmaTalksRes.rows.map(mapRowToCamelCase),
            };

        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            throw error;
        } finally {
            client.release();
        }
    },
};