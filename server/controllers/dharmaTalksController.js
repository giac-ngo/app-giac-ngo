// server/controllers/dharmaTalksController.js
import { dharmaTalkModel } from '../models/dharmaTalk.model.js';
import { spaceModel } from '../models/space.model.js';
import { pool } from '../db.js';

export const dharmaTalksController = {
    async getAllDharmaTalks(req, res) {
        try {
            const talks = await spaceModel.findAllDharmaTalks();
            res.json(talks);
        } catch (error) {
            console.error('Error fetching all dharma talks:', error);
            res.status(500).json({ message: 'Failed to fetch all dharma talks.' });
        }
    },

    async createDharmaTalk(req, res) {
        try {
            const { spaceId } = req.body;
            // Super admin can assign to any space.
            if (!req.user.permissions.includes('roles')) {
                // Content Manager must assign to a space they own.
                const spaceRes = await pool.query('SELECT user_id FROM spaces WHERE id = $1', [spaceId]);
                if (spaceRes.rows.length === 0 || spaceRes.rows[0].user_id !== req.user.id) {
                    return res.status(403).json({ message: 'You can only create talks for spaces you own.' });
                }
            }
            
            const talkData = { ...req.body };
            if (talkData.tags && typeof talkData.tags === 'string') {
                talkData.tags = talkData.tags.split(',').map(t => t.trim()).filter(Boolean);
            }
            if (talkData.tagsEn && typeof talkData.tagsEn === 'string') {
                talkData.tagsEn = talkData.tagsEn.split(',').map(t => t.trim()).filter(Boolean);
            }

            const newTalk = await dharmaTalkModel.create(talkData);
            res.status(201).json(newTalk);
        } catch (error) {
            console.error('Error creating dharma talk:', error);
            res.status(500).json({ message: 'Failed to create dharma talk.' });
        }
    },

    async updateDharmaTalk(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            
            if (!req.user.permissions.includes('roles')) {
                // Check if the content manager owns the space of the talk they are trying to edit.
                const talkRes = await pool.query('SELECT s.user_id FROM dharma_talks dt JOIN spaces s ON dt.space_id = s.id WHERE dt.id = $1', [id]);
                if (talkRes.rows.length === 0 || talkRes.rows[0].user_id !== req.user.id) {
                    return res.status(403).json({ message: 'You can only edit talks from spaces you own.' });
                }
            }
            
            const talkData = { ...req.body };
            if (talkData.tags && typeof talkData.tags === 'string') {
                talkData.tags = talkData.tags.split(',').map(t => t.trim()).filter(Boolean);
            }
            if (talkData.tagsEn && typeof talkData.tagsEn === 'string') {
                talkData.tagsEn = talkData.tagsEn.split(',').map(t => t.trim()).filter(Boolean);
            }

            const updatedTalk = await dharmaTalkModel.update(id, talkData);
            if (!updatedTalk) {
                return res.status(404).json({ message: 'Dharma talk not found.' });
            }
            res.json(updatedTalk);
        } catch (error) {
            console.error('Error updating dharma talk:', error);
            res.status(500).json({ message: 'Failed to update dharma talk.' });
        }
    },

    async deleteDharmaTalk(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            
            if (!req.user.permissions.includes('roles')) {
                const talkRes = await pool.query('SELECT s.user_id FROM dharma_talks dt JOIN spaces s ON dt.space_id = s.id WHERE dt.id = $1', [id]);
                if (talkRes.rows.length === 0 || talkRes.rows[0].user_id !== req.user.id) {
                    return res.status(403).json({ message: 'You can only delete talks from spaces you own.' });
                }
            }

            const deleted = await dharmaTalkModel.delete(id);
            if (!deleted) {
                return res.status(404).json({ message: 'Dharma talk not found.' });
            }
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting dharma talk:', error);
            res.status(500).json({ message: 'Failed to delete dharma talk.' });
        }
    },

    async likeDharmaTalk(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID.' });
            const result = await dharmaTalkModel.incrementLikes(id);
            res.json(result);
        } catch (error) {
            console.error('Error liking dharma talk:', error);
            res.status(500).json({ message: 'Failed to like dharma talk.' });
        }
    }
};