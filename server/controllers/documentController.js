
// server/controllers/documentController.js
import { documentModel } from '../models/document.model.js';
import { ocrService } from '../services/ocrService.js';
import { geminiService } from '../services/geminiService.js';
import { gptService } from '../services/gptService.js';
import { userModel } from '../models/user.model.js';
import { systemModel } from '../models/system.model.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { pool } from '../db.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

const _deleteCategory = async (res, modelFunction, id) => {
    try {
        await modelFunction(id);
        res.status(204).send();
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const _createCategory = async (req, res, tableName, additionalData = {}) => {
    try {
        const { name, nameEn, spaceId } = req.body;
        // Permission check
        if (!req.user.permissions.includes('roles') && spaceId) {
            const spaceRes = await pool.query('SELECT user_id FROM spaces WHERE id = $1', [spaceId]);
            if (spaceRes.rows.length === 0 || spaceRes.rows[0].user_id !== req.user.id) {
                return res.status(403).json({ message: 'You can only create items for spaces you own.' });
            }
        }
        const payload = { name, nameEn, spaceId: spaceId || null, ...additionalData };
        const item = await documentModel._createCategory(tableName, payload);
        res.status(201).json(item);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const _updateCategory = async (req, res, tableName) => {
    try {
        const { name, nameEn, spaceId, typeId, authorId } = req.body;
        const dataToUpdate = {};
        if (name !== undefined) dataToUpdate.name = name;
        if (nameEn !== undefined) dataToUpdate.nameEn = nameEn;
        if (spaceId !== undefined) dataToUpdate.spaceId = spaceId || null;

        if (tableName === 'document_topics') {
            if (typeId !== undefined) dataToUpdate.typeId = typeId || null;
            if (authorId !== undefined) dataToUpdate.authorId = authorId || null;
        }

        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ message: 'No fields to update provided.' });
        }

        // Permission check...
        if (!req.user.permissions.includes('roles')) {
            const itemRes = await pool.query(`SELECT space_id FROM ${tableName} WHERE id = $1`, [req.params.id]);
            if (itemRes.rows.length > 0) {
                const currentSpaceId = itemRes.rows[0].space_id;
                if (currentSpaceId) { // Check ownership of current item
                    const spaceRes = await pool.query('SELECT user_id FROM spaces WHERE id = $1', [currentSpaceId]);
                    if (spaceRes.rows.length === 0 || spaceRes.rows[0].user_id !== req.user.id) {
                        return res.status(403).json({ message: 'You do not have permission to edit this item.' });
                    }
                }
                if (spaceId) { // Check ownership of target space
                    const targetSpaceRes = await pool.query('SELECT user_id FROM spaces WHERE id = $1', [spaceId]);
                    if (targetSpaceRes.rows.length === 0 || targetSpaceRes.rows[0].user_id !== req.user.id) {
                        return res.status(403).json({ message: 'You can only assign items to spaces you own.' });
                    }
                }
            }
        }

        const updatedItem = await documentModel._updateCategory(tableName, req.params.id, dataToUpdate);
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const documentController = {
    extractUpload: multer({ storage: multer.memoryStorage() }),

    // Document AI Features
    async extractTextFromFile(req, res) {
        const { provider, model, userId } = req.body;
        const file = req.file;

        if (!provider || !model || !userId || !file) {
            return res.status(400).json({ message: 'Missing required fields: provider, model, userId, and file.' });
        }
        try {
            const user = await userModel.findById(parseInt(userId, 10));
            const systemConfig = await systemModel.getConfig();
            const apiKey = user?.apiKeys?.[provider] || systemConfig?.systemKeys?.[provider];
            const htmlContent = await ocrService.extractAndFormat(file, provider, model, apiKey);
            res.json({ htmlContent });
        } catch (error) {
            res.status(500).json({ message: error.message || 'Failed to extract text from file.' });
        }
    },

    async getDocumentConfig(req, res) {
        try {
            const config = await documentModel.getConfig();
            res.json(config);
        } catch (error) {
            res.status(500).json({ message: 'Failed to get document config.' });
        }
    },

    async updateDocumentConfig(req, res) {
        try {
            const config = await documentModel.updateConfig(req.body);
            res.json(config);
        } catch (error) {
            res.status(500).json({ message: 'Failed to update document config.' });
        }
    },

    // Document CRUD
    async getDocuments(req, res) {
        try {
            const { title, authorId, typeId, topicId, tagId, spaceId, page = '1', limit = '10' } = req.query;
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);

            // Import helper functions
            const { getUserManagedSpaceIds, isAdmin } = await import('../middleware/authMiddleware.js');

            // Determine which spaces the user can access
            let spaceIds = null;
            if (!isAdmin(req.user)) {
                // Regular user: only see documents from their managed spaces
                const managedIds = await getUserManagedSpaceIds(req.user.id);
                if (managedIds.length === 0) {
                    return res.json({ data: [], total: 0 });
                }

                if (spaceId) {
                    const requestedId = parseInt(spaceId, 10);
                    if (managedIds.includes(requestedId)) {
                        spaceIds = [requestedId];
                    } else {
                        return res.status(403).json({ message: "Forbidden: You do not own this space." });
                    }
                } else {
                    spaceIds = managedIds;
                }
            } else if (spaceId) {
                // Admin with space filter: filter by specific space
                spaceIds = [parseInt(spaceId, 10)];
            }
            // Admin without filter: spaceIds remains null (see all)

            const filters = {
                title: title || undefined,
                authorId: authorId ? parseInt(authorId, 10) : undefined,
                typeId: typeId ? parseInt(typeId, 10) : undefined,
                topicId: topicId ? parseInt(topicId, 10) : undefined,
                tagId: tagId ? parseInt(tagId, 10) : undefined,
                spaceIds: spaceIds, // Pass array of space IDs or null
                limit: limitNum,
                offset: (pageNum - 1) * limitNum,
            };
            res.json(await documentModel.find(filters));
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch documents.' });
        }
    },

    async createDocument(req, res) {
        try {
            const { spaceId } = req.body;
            if (!req.user.permissions.includes('roles') && spaceId) {
                const spaceRes = await pool.query('SELECT user_id FROM spaces WHERE id = $1', [spaceId]);
                if (spaceRes.rows.length === 0 || spaceRes.rows[0].user_id !== req.user.id) {
                    return res.status(403).json({ message: 'You can only create documents for spaces you own.' });
                }
            }

            const { tags, ...docData } = req.body;
            const newDoc = await documentModel.create(docData, tags || []);
            res.status(201).json(newDoc);
        } catch (error) {
            res.status(500).json({ message: `Failed to create document: ${error.message}` });
        }
    },

    async updateDocument(req, res) {
        try {
            const id = parseInt(req.params.id, 10);

            if (!req.user.permissions.includes('roles')) {
                const docRes = await pool.query('SELECT s.user_id FROM documents d JOIN spaces s ON d.space_id = s.id WHERE d.id = $1', [id]);
                if (docRes.rows.length > 0 && docRes.rows[0].user_id !== req.user.id) {
                    return res.status(403).json({ message: 'You can only edit documents from spaces you own.' });
                }
            }

            const { tags, ...docData } = req.body;

            if (docData.spaceId) {
                docData.spaceId = docData.spaceId === 'null' ? null : parseInt(docData.spaceId, 10);
            }

            const updatedDoc = await documentModel.update(id, docData, tags);
            res.json(updatedDoc);
        } catch (error) {
            res.status(500).json({ message: `Failed to update document: ${error.message}` });
        }
    },

    async deleteDocument(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (!req.user.permissions.includes('roles')) {
                const docRes = await pool.query('SELECT s.user_id FROM documents d JOIN spaces s ON d.space_id = s.id WHERE d.id = $1', [id]);
                if (docRes.rows.length > 0 && docRes.rows[0].user_id !== req.user.id) {
                    return res.status(403).json({ message: 'You can only delete documents from spaces you own.' });
                }
            }

            const doc = await documentModel.findById(id);
            if (doc) {
                const unlinkQuietly = async (filePath) => {
                    if (filePath) try { await fs.unlink(path.join(projectRoot, filePath)); } catch (e) { console.error(`Failed to delete file: ${e.message}`); }
                };
                await unlinkQuietly(doc.thumbnailUrl);
                await unlinkQuietly(doc.audioUrl);
                await unlinkQuietly(doc.audioUrlEn);
            }
            await documentModel.delete(id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete document.' });
        }
    },

    async likeDocument(req, res) {
        try {
            res.json(await documentModel.incrementLikes(parseInt(req.params.id, 10)));
        } catch (error) {
            res.status(500).json({ message: 'Failed to like document.' });
        }
    },

    // Linking
    async linkDocumentsToAi(req, res) {
        const aiConfigId = parseInt(req.params.id, 10);
        const { documentIds } = req.body;
        if (isNaN(aiConfigId) || !Array.isArray(documentIds)) {
            return res.status(400).json({ message: 'Valid aiConfigId and documentIds array are required.' });
        }
        try {
            await documentModel.linkToAi(aiConfigId, documentIds);
            res.status(201).json({ success: true });
        } catch (error) {
            res.status(500).json({ message: 'Failed to link documents.' });
        }
    },

    async unlinkDocumentFromAi(req, res) {
        const aiConfigId = parseInt(req.params.id, 10);
        const documentId = parseInt(req.params.docId, 10);
        if (isNaN(aiConfigId) || isNaN(documentId)) {
            return res.status(400).json({ message: 'Valid aiConfigId and documentId are required.' });
        }
        try {
            await documentModel.unlinkFromAi(aiConfigId, documentId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Failed to unlink document.' });
        }
    },

    // Tags & Categories
    async getAllTags(req, res) { res.json(await documentModel.findAllTags()); },

    async getDocumentAuthors(req, res) {
        try {
            const { getUserManagedSpaceIds, isAdmin } = await import('../middleware/authMiddleware.js');
            let spaceFilter = req.query.spaceId;

            if (req.user && !isAdmin(req.user)) {
                const managedIds = await getUserManagedSpaceIds(req.user.id);
                if (managedIds.length === 0) return res.json([]);

                if (spaceFilter) {
                    if (!managedIds.includes(parseInt(spaceFilter, 10))) {
                        return res.status(403).json({ message: "Forbidden: You do not own this space." });
                    }
                } else {
                    spaceFilter = managedIds;
                }
            }
            res.json(await documentModel._findCategory('document_authors', spaceFilter));
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    async createDocumentAuthor(req, res) { await _createCategory(req, res, 'document_authors'); },
    async updateDocumentAuthor(req, res) { await _updateCategory(req, res, 'document_authors'); },
    async deleteDocumentAuthor(req, res) { await _deleteCategory(res, documentModel._deleteCategory.bind(null, 'document_authors'), req.params.id); },

    async getDocumentTypes(req, res) {
        try {
            const { getUserManagedSpaceIds, isAdmin } = await import('../middleware/authMiddleware.js');
            let spaceFilter = req.query.spaceId;

            if (req.user && !isAdmin(req.user)) {
                const managedIds = await getUserManagedSpaceIds(req.user.id);
                if (managedIds.length === 0) return res.json([]);

                if (spaceFilter) {
                    if (!managedIds.includes(parseInt(spaceFilter, 10))) {
                        return res.status(403).json({ message: "Forbidden: You do not own this space." });
                    }
                } else {
                    spaceFilter = managedIds;
                }
            }
            res.json(await documentModel._findCategory('document_types', spaceFilter));
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    async createDocumentType(req, res) { await _createCategory(req, res, 'document_types'); },
    async updateDocumentType(req, res) { await _updateCategory(req, res, 'document_types'); },
    async deleteDocumentType(req, res) { await _deleteCategory(res, documentModel._deleteCategory.bind(null, 'document_types'), req.params.id); },

    async getDocumentTopics(req, res) {
        try {
            const { getUserManagedSpaceIds, isAdmin } = await import('../middleware/authMiddleware.js');
            let spaceFilter = req.query.spaceId;

            if (req.user && !isAdmin(req.user)) {
                const managedIds = await getUserManagedSpaceIds(req.user.id);
                if (managedIds.length === 0) return res.json([]);

                if (spaceFilter) {
                    if (!managedIds.includes(parseInt(spaceFilter, 10))) {
                        return res.status(403).json({ message: "Forbidden: You do not own this space." });
                    }
                } else {
                    spaceFilter = managedIds;
                }
            }
            res.json(await documentModel._findCategory('document_topics', spaceFilter));
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    async createDocumentTopic(req, res) {
        const { typeId, authorId } = req.body;
        if (typeId === undefined || authorId === undefined) {
            return res.status(400).json({ message: 'typeId and authorId are required for topics.' });
        }
        await _createCategory(req, res, 'document_topics', { typeId, authorId });
    },
    async updateDocumentTopic(req, res) { await _updateCategory(req, res, 'document_topics'); },
    async deleteDocumentTopic(req, res) { await _deleteCategory(res, documentModel._deleteCategory.bind(null, 'document_topics'), req.params.id); },
};
