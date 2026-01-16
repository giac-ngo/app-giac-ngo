// server/controllers/libraryController.js
import { libraryModel } from '../models/library.model.js';
import { documentModel } from '../models/document.model.js';
import { commentModel } from '../models/comment.model.js';
import { pool } from '../db.js';


export const libraryController = {
    async getSidebarData(req, res) {
        try {
            const data = await libraryModel.getSidebarData();
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch library sidebar data.' });
        }
    },

    async getLibraryFilters(req, res) {
        try {
            const { spaceId, spaceSlug, typeId, authorId, topicsPage, topicsLimit } = req.query;

            let finalSpaceId;

            // If spaceSlug is provided, resolve it to spaceId
            if (spaceSlug) {
                const spaceResult = await pool.query('SELECT id FROM spaces WHERE slug = $1', [spaceSlug]);
                if (spaceResult.rows.length > 0) {
                    finalSpaceId = spaceResult.rows[0].id;
                } else {
                    finalSpaceId = null;
                }
            } else if (spaceId === 'global') {
                finalSpaceId = 'global';
            } else if (spaceId) {
                const parsedId = parseInt(spaceId, 10);
                finalSpaceId = isNaN(parsedId) ? null : parsedId;
            } else {
                finalSpaceId = null;
            }

            const modelFilters = {
                typeId: typeId ? parseInt(typeId, 10) : undefined,
                authorId: authorId ? parseInt(authorId, 10) : undefined,
                topicsPage: topicsPage ? parseInt(topicsPage, 10) : 1,
                topicsLimit: topicsLimit ? parseInt(topicsLimit, 10) : 15,
            };

            const filters = await libraryModel.getFilters(finalSpaceId, {
                ...modelFilters
            });
            res.json(filters);

        } catch (error) {
            console.error("Error fetching library filters:", error);
            res.status(500).json({ message: 'Failed to fetch library filters.' });
        }
    },

    async getLibraryDocuments(req, res) {
        try {
            const { search, typeId, authorId, topicId, page = 1, limit = 6, spaceId, spaceSlug } = req.query;

            let finalSpaceId;

            // If spaceSlug is provided, resolve it to spaceId
            if (spaceSlug) {
                const spaceResult = await pool.query('SELECT id FROM spaces WHERE slug = $1', [spaceSlug]);
                if (spaceResult.rows.length > 0) {
                    finalSpaceId = spaceResult.rows[0].id;
                } else {
                    finalSpaceId = null;
                }
            } else if (spaceId === 'null' || spaceId === 'undefined' || spaceId === undefined) {
                finalSpaceId = null;
            } else {
                const parsedId = parseInt(spaceId, 10);
                finalSpaceId = isNaN(parsedId) ? undefined : parsedId;
            }

            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);

            const result = await documentModel.find({
                title: search || undefined,
                typeId: typeId ? parseInt(typeId, 10) : undefined,
                authorId: authorId ? parseInt(authorId, 10) : undefined,
                topicId: topicId ? parseInt(topicId, 10) : undefined,
                limit: limitNum,
                offset: (pageNum - 1) * limitNum,
                spaceId: finalSpaceId
            });
            res.json(result); // Returns { data, total }
        } catch (error) {
            console.error("Error fetching library documents:", error);
            res.status(500).json({ message: 'Failed to fetch library documents.' });
        }
    },

    async getDocumentDetail(req, res) {
        const documentId = parseInt(req.params.id, 10);
        if (isNaN(documentId)) {
            return res.status(400).json({ message: 'Invalid document ID.' });
        }
        try {
            const doc = await libraryModel.getDocumentWithNeighbors(documentId);
            if (!doc) {
                return res.status(404).json({ message: 'Document not found.' });
            }
            const comments = await commentModel.findApproved('document', String(documentId));
            res.json({ ...doc, comments });
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch document details.' });
        }
    },

    async getRecommendedDocuments(req, res) {
        try {
            // Get top 3 viewed "Kệ" and "Câu Chuyện"
            const { data: topKe } = await documentModel.find({ isLibrary: true, typeName: 'Kệ', limit: 3, sortBy: 'views', sortOrder: 'DESC' });
            const { data: topTruyen } = await documentModel.find({ isLibrary: true, typeName: 'Câu Chuyện', limit: 3, sortBy: 'views', sortOrder: 'DESC' });
            res.json({ topKe, topTruyen });
        } catch (error) {
            console.error("Error fetching recommended documents:", error);
            res.status(500).json({ message: 'Failed to fetch recommended documents.' });
        }
    },

    async getLibraryTopics(req, res) {
        try {
            const { spaceId, page, limit } = req.query;

            let finalSpaceId;
            if (spaceId === 'global') {
                finalSpaceId = 'global';
            } else if (spaceId) {
                const parsedId = parseInt(spaceId, 10);
                finalSpaceId = isNaN(parsedId) ? null : parsedId;
            } else {
                finalSpaceId = null;
            }

            const pageNum = page ? parseInt(page, 10) : 1;
            const limitNum = limit ? parseInt(limit, 10) : 15;

            const topics = await libraryModel.getTopics(finalSpaceId, pageNum, limitNum);
            res.json(topics);
        } catch (error) {
            console.error("Error fetching library topics:", error);
            res.status(500).json({ message: 'Failed to fetch library topics.' });
        }
    },
};