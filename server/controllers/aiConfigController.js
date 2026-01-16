// server/controllers/aiConfigController.js
import { aiConfigModel } from '../models/aiConfig.model.js';
import { userModel } from '../models/user.model.js';
import weaviateService from '../services/weaviateService.js';
import { pool, mapRowToCamelCase } from '../db.js';
import { billingModel } from '../models/billing.model.js';

const mapAndSanitizeUser = (user) => {
    if (!user) return null;
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
};

export const aiConfigController = {
    async getVisibleAiConfigs(req, res) {
        const { userId } = req.body;
        try {
            let dbUser = null;
            if (userId) {
                dbUser = await userModel.findById(userId);
            }
            const configs = await aiConfigModel.findVisibleForUser(dbUser);
            res.json(configs);
        } catch (error) {
            console.error("Lỗi tải danh sách AI:", error);
            res.status(500).json({ message: 'Không thể tải danh sách AI.' });
        }
    },

    async getManageableAiConfigs(req, res) {
        try {
            // The isAuthenticated middleware already verified the user and attached it to req.user.
            const configs = await aiConfigModel.findManageableForUser(req.user);
            res.json(configs);
        } catch (error) {
            console.error("Lỗi tải danh sách AI có thể quản lý:", error);
            res.status(500).json({ message: 'Không thể tải danh sách AI để quản lý.' });
        }
    },

    async getAiConfigsBySpaceId(req, res) {
        try {
            const spaceId = parseInt(req.params.id, 10);
            if (isNaN(spaceId)) {
                return res.status(400).json({ message: 'Invalid Space ID.' });
            }
            const configs = await aiConfigModel.findBySpaceId(spaceId);
            res.json(configs);
        } catch (error) {
            console.error("Lỗi tải danh sách AI cho không gian:", error);
            res.status(500).json({ message: 'Không thể tải danh sách AI cho không gian này.' });
        }
    },

    async createAiConfig(req, res) {
        try {
            const data = { ...req.body };

            // Non-admins (Content Managers) cannot create public AIs directly.
            if (req.user && !req.user.permissions.includes('roles')) {
                data.isPublic = false;

                // Also verify they own the space they're assigning to.
                const spaceRes = await pool.query('SELECT user_id FROM spaces WHERE id = $1', [data.spaceId]);
                if (spaceRes.rows.length === 0 || spaceRes.rows[0].user_id !== req.user.id) {
                    return res.status(403).json({ message: 'You can only create AIs for spaces you own.' });
                }
            }

            const newConfig = await aiConfigModel.create(data);
            const fullNewConfig = await aiConfigModel.findById(newConfig.id);
            res.status(201).json(fullNewConfig);
        } catch (error) {
            console.error("Lỗi tạo AI:", error);
            res.status(500).json({ message: error.message || 'Lỗi khi tạo AI mới.' });
        }
    },

    async updateAiConfig(req, res) {
        try {
            const aiId = parseInt(req.params.id, 10);
            const aiConfig = await aiConfigModel.findById(aiId);
            if (!aiConfig) {
                return res.status(404).json({ message: 'AI not found.' });
            }

            const isSuperAdmin = req.user.permissions.includes('roles');
            const isOwner = req.user.id === aiConfig.ownerId;

            if (!isSuperAdmin && !isOwner) {
                return res.status(403).json({ message: 'Forbidden: You do not have permission to edit this AI.' });
            }

            const payload = { ...req.body };

            // Only super admins can update isPublic. Remove it from payload for non-admins.
            if (!isSuperAdmin) {
                delete payload.isPublic;
            }

            // Content managers must assign to a space they own.
            if (!isSuperAdmin && payload.spaceId) {
                const spaceRes = await pool.query('SELECT user_id FROM spaces WHERE id = $1', [payload.spaceId]);
                if (spaceRes.rows.length === 0 || spaceRes.rows[0].user_id !== req.user.id) {
                    return res.status(403).json({ message: 'You can only assign AIs to spaces you own.' });
                }
            }


            const updatedConfig = await aiConfigModel.update(req.params.id, payload);
            const fullUpdatedConfig = await aiConfigModel.findById(updatedConfig.id);
            res.json(fullUpdatedConfig);
        } catch (error) {
            console.error("Error updating AI config:", error);
            res.status(500).json({ message: error.message || 'Lỗi khi cập nhật AI.' });
        }
    },

    async deleteAiConfig(req, res) {
        try {
            const aiId = parseInt(req.params.id, 10);
            const aiConfig = await aiConfigModel.findById(aiId);
            if (!aiConfig) {
                return res.status(404).json({ message: 'AI config not found.' });
            }

            // Check permissions
            const isSuperAdmin = req.user.permissions.includes('roles');
            const isOwner = req.user.id === aiConfig.ownerId;

            if (!isSuperAdmin && !isOwner) {
                // If not owner, check if user owns the space the AI belongs to
                if (aiConfig.spaceId) {
                    const spaceRes = await pool.query('SELECT user_id FROM spaces WHERE id = $1', [aiConfig.spaceId]);
                    if (spaceRes.rows.length === 0 || spaceRes.rows[0].user_id !== req.user.id) {
                        return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this AI.' });
                    }
                } else {
                    return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this AI.' });
                }
            }

            const owner = await userModel.findById(aiConfig.ownerId);
            if (owner && owner.apiKeys) {
                if (owner.apiKeys.gpt) {
                    weaviateService.deleteDataByAiConfigId('gpt', aiId, owner.apiKeys.gpt).catch(err => console.error(`Failed to cleanup Weaviate GPT data for deleted AI ${aiId}:`, err));
                }
                if (owner.apiKeys.gemini) {
                    weaviateService.deleteDataByAiConfigId('gemini', aiId, owner.apiKeys.gemini).catch(err => console.error(`Failed to cleanup Weaviate Gemini data for deleted AI ${aiId}:`, err));
                }
            } else {
                console.error(`Owner or API keys not found for AI config ${aiId}, cannot clean up Weaviate data.`);
            }

            await aiConfigModel.delete(aiId);
            res.status(204).send();
        } catch (error) {
            console.error("Error deleting AI:", error);
            res.status(500).json({ message: 'Lỗi khi xóa AI.' });
        }
    },

    async purchaseAi(req, res) {
        const aiId = parseInt(req.params.id, 10);
        const { userId } = req.body;

        if (isNaN(aiId) || !userId) {
            return res.status(400).json({ message: 'Valid AI ID and User ID are required.' });
        }

        try {
            const result = await billingModel.purchaseAi(userId, aiId);
            res.json({ updatedUser: mapAndSanitizeUser(result.updatedUser) });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async claimFreeAi(req, res) {
        const aiId = parseInt(req.params.id, 10);
        const { userId } = req.body;

        if (isNaN(aiId) || !userId) {
            return res.status(400).json({ message: 'Valid AI ID and User ID are required.' });
        }

        try {
            const result = await billingModel.claimFreeAi(userId, aiId);
            res.json({ updatedUser: mapAndSanitizeUser(result.updatedUser) });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getAiAccessList(req, res) {
        try {
            const aiId = parseInt(req.params.id, 10);
            if (isNaN(aiId)) return res.status(400).json({ message: 'Invalid AI ID.' });
            const users = await aiConfigModel.getAccessList(aiId);
            res.json(users.map(mapAndSanitizeUser));
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch access list.' });
        }
    },

    async updateAiAccessList(req, res) {
        try {
            const aiId = parseInt(req.params.id, 10);
            const { emails } = req.body;
            if (isNaN(aiId) || !Array.isArray(emails)) {
                return res.status(400).json({ message: 'Invalid AI ID or emails list.' });
            }

            const userIds = await userModel.findUserIdsByEmails(emails);
            await aiConfigModel.setAccessList(aiId, userIds);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Failed to update access list.' });
        }
    }
};