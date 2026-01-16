// server/controllers/spacesController.js
import { spaceModel } from '../models/space.model.js';
import { isAdmin } from '../middleware/authMiddleware.js';

// Add a local helper function to sanitize user data before sending it to the client.
const mapAndSanitizeUser = (user) => {
    if (!user) return null;
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
};

export const spacesController = {
    async getAllSpaces(req, res) {
        try {
            const spaces = await spaceModel.findAll();

            if (req.user && !isAdmin(req.user)) {
                const mySpaces = spaces.filter(space => space.userId === req.user.id);
                return res.json(mySpaces);
            }
            res.json(spaces);
        } catch (error) {
            console.error('Error fetching spaces:', error);
            res.status(500).json({ message: 'Failed to fetch spaces.' });
        }
    },

    // FIX: Add controller method to get a space by its numeric ID.
    async getSpaceById(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid ID.' });
            }
            const space = await spaceModel.findById(id);
            if (!space) {
                return res.status(404).json({ message: 'Space not found.' });
            }
            res.json(space);
        } catch (error) {
            console.error(`Error fetching space with id ${req.params.id}:`, error);
            res.status(500).json({ message: 'Failed to fetch space.' });
        }
    },

    async getSpaceBySlug(req, res) {
        try {
            const { slug } = req.params;
            const space = await spaceModel.findBySlug(slug);
            if (!space) {
                return res.status(404).json({ message: 'Space not found.' });
            }
            res.json(space);
        } catch (error) {
            console.error(`Error fetching space with slug ${req.params.slug}:`, error);
            res.status(500).json({ message: 'Failed to fetch space.' });
        }
    },

    async createSpace(req, res) {
        try {
            const spaceData = { ...req.body };
            if (req.file) {
                spaceData.imageUrl = `/uploads/${req.file.filename}`;
            }
            // Convert string arrays from form-data
            if (spaceData.tags && typeof spaceData.tags === 'string') {
                spaceData.tags = spaceData.tags.split(',').map(t => t.trim()).filter(Boolean);
            } else if (!spaceData.tags) {
                spaceData.tags = [];
            }
            if (spaceData.tagsEn && typeof spaceData.tagsEn === 'string') {
                spaceData.tagsEn = spaceData.tagsEn.split(',').map(t => t.trim()).filter(Boolean);
            } else if (!spaceData.tagsEn) {
                spaceData.tagsEn = [];
            }
            // Convert numbers which are sent as strings from multipart/form-data
            if (spaceData.rank) spaceData.rank = parseInt(spaceData.rank, 10);
            if (spaceData.membersCount) spaceData.membersCount = parseInt(spaceData.membersCount, 10);
            if (spaceData.views) spaceData.views = parseInt(spaceData.views, 10);
            if (spaceData.likes) spaceData.likes = parseInt(spaceData.likes, 10);
            if (spaceData.rating) spaceData.rating = parseFloat(spaceData.rating);
            if (spaceData.userId) spaceData.userId = parseInt(spaceData.userId, 10);


            // Enforce ownership if not admin
            if (req.user && !isAdmin(req.user)) {
                return res.status(403).json({ message: 'Forbidden: Only admins can create spaces.' });
            }

            const newSpace = await spaceModel.create(spaceData);
            res.status(201).json(newSpace);
        } catch (error) {
            console.error('Error creating space:', error);
            res.status(500).json({ message: `Failed to create space: ${error.message}` });
        }
    },

    async updateSpace(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid ID.' });
            }

            // Check existing space for ownership
            const existingSpace = await spaceModel.findById(id);
            if (!existingSpace) {
                return res.status(404).json({ message: 'Space not found.' });
            }

            if (req.user && !isAdmin(req.user)) {
                if (existingSpace.userId !== req.user.id) {
                    return res.status(403).json({ message: 'Forbidden: You do not have permission to edit this space.' });
                }
            }

            const spaceData = { ...req.body };
            if (req.file) {
                spaceData.imageUrl = `/uploads/${req.file.filename}`;
            }
            // Convert string arrays from form-data
            if (spaceData.tags && typeof spaceData.tags === 'string') {
                spaceData.tags = spaceData.tags.split(',').map(t => t.trim()).filter(Boolean);
            }
            if (spaceData.tagsEn && typeof spaceData.tagsEn === 'string') {
                spaceData.tagsEn = spaceData.tagsEn.split(',').map(t => t.trim()).filter(Boolean);
            }
            // Convert numbers
            if (spaceData.rank) spaceData.rank = parseInt(spaceData.rank, 10);
            if (spaceData.membersCount) spaceData.membersCount = parseInt(spaceData.membersCount, 10);
            if (spaceData.views) spaceData.views = parseInt(spaceData.views, 10);
            if (spaceData.likes) spaceData.likes = parseInt(spaceData.likes, 10);
            if (spaceData.rating) spaceData.rating = parseFloat(spaceData.rating);
            if (spaceData.userId) spaceData.userId = parseInt(spaceData.userId, 10);

            // Prevent non-admin from changing ownership
            if (req.user && !isAdmin(req.user)) {
                delete spaceData.userId;
            }

            const updatedSpace = await spaceModel.update(id, spaceData);
            res.json(updatedSpace);
        } catch (error) {
            console.error('Error updating space:', error);
            res.status(500).json({ message: `Failed to save space: ${error.message}` });
        }
    },

    async deleteSpace(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid ID.' });
            }

            // Check existing space for ownership
            const existingSpace = await spaceModel.findById(id);
            if (!existingSpace) {
                return res.status(404).json({ message: 'Space not found.' });
            }

            if (req.user && !isAdmin(req.user)) {
                if (existingSpace.userId !== req.user.id) {
                    return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this space.' });
                }
            }

            await spaceModel.delete(id);
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting space:', error);
            res.status(500).json({ message: 'Failed to delete space.' });
        }
    },

    async incrementViews(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID.' });
            await spaceModel.incrementViews(id);
            res.status(204).send();
        } catch (error) {
            // This is a non-critical action, so just log the error and don't crash
            console.error('Error incrementing view count:', error);
            res.status(500).send();
        }
    },

    async getDharmaTalksBySpaceId(req, res) {
        try {
            const spaceId = parseInt(req.params.id, 10);
            if (isNaN(spaceId)) {
                return res.status(400).json({ message: 'Invalid Space ID.' });
            }
            const talks = await spaceModel.findDharmaTalksBySpaceId(spaceId);
            res.json(talks);
        } catch (error) {
            console.error('Error fetching dharma talks for space:', error);
            res.status(500).json({ message: 'Failed to fetch dharma talks for this space.' });
        }
    },

    async getDocumentsBySpaceId(req, res) {
        try {
            const spaceId = parseInt(req.params.id, 10);
            if (isNaN(spaceId)) {
                return res.status(400).json({ message: 'Invalid Space ID.' });
            }
            const docs = await spaceModel.findDocumentsBySpaceId(spaceId);
            res.json(docs);
        } catch (error) {
            console.error('Error fetching documents for space:', error);
            res.status(500).json({ message: 'Failed to fetch documents for this space.' });
        }
    },

    async makeOffering(req, res) {
        const spaceId = parseInt(req.params.id, 10);
        const { amount, userId } = req.body;

        if (isNaN(spaceId) || !amount || amount <= 0 || !userId) {
            return res.status(400).json({ message: 'Valid Space ID, amount, and User ID are required.' });
        }

        try {
            const { updatedUser } = await spaceModel.makeOffering(spaceId, userId, amount);
            res.json({ updatedUser: mapAndSanitizeUser(updatedUser) });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async likeSpace(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID.' });
            const result = await spaceModel.incrementLikes(id);
            res.json(result);
        } catch (error) {
            console.error('Error liking space:', error);
            res.status(500).json({ message: 'Failed to like space.' });
        }
    },
};