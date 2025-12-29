// server/controllers/dharmaTalksController.js
import { dharmaTalkModel } from '../models/dharmaTalk.model.js';
import { spaceModel } from '../models/space.model.js';
import { pool } from '../db.js';


const parseAndProcessTalkData = (req) => {
    const data = { ...req.body };
    const files = req.files;
    const spaceIdSubDir = data.spaceId || 'global';

    if (files) {
        if (files.avatarFile) {
            data.speakerAvatarUrl = `/uploads/${spaceIdSubDir}/dharmatalks/${files.avatarFile[0].filename}`;
        }
        if (files.audioFile) {
            data.url = `/uploads/${spaceIdSubDir}/dharmatalks/${files.audioFile[0].filename}`;
        }
    }

    // FIX: Properly handle empty strings for array fields to prevent DB errors.
    // An empty string from FormData should be converted to an empty array for PostgreSQL.
    if (typeof data.tags === 'string') {
        data.tags = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    }
    if (typeof data.tagsEn === 'string') {
        data.tagsEn = data.tagsEn ? data.tagsEn.split(',').map(t => t.trim()).filter(Boolean) : [];
    }

    // Handle numeric fields that might be strings, converting empty values to null
    ['spaceId', 'duration', 'notifications', 'views', 'likes'].forEach(field => {
        if (data[field] === '' || data[field] === null || data[field] === undefined) {
            data[field] = null;
        } else {
            const num = Number(data[field]);
            data[field] = isNaN(num) ? null : num;
        }
    });

    // Handle floating point numbers
    if (data.rating === '' || data.rating === null || data.rating === undefined) {
        data.rating = null;
    } else {
        const num = parseFloat(data.rating);
        data.rating = isNaN(num) ? null : num;
    }
    
    // Handle empty date string
    if (data.date === '' || data.date === 'null') {
        data.date = null;
    }
    
    return data;
}


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
            const talkData = parseAndProcessTalkData(req);
            const { spaceId } = talkData;
            
            if (!req.user.permissions.includes('roles') && spaceId) {
                const spaceRes = await pool.query('SELECT user_id FROM spaces WHERE id = $1', [spaceId]);
                if (spaceRes.rows.length === 0 || spaceRes.rows[0].user_id !== req.user.id) {
                    return res.status(403).json({ message: 'You can only create talks for spaces you own.' });
                }
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
            const talkData = parseAndProcessTalkData(req);

            if (!req.user.permissions.includes('roles')) {
                const talkRes = await pool.query('SELECT s.user_id FROM dharma_talks dt JOIN spaces s ON dt.space_id = s.id WHERE dt.id = $1', [id]);
                if (talkRes.rows.length > 0 && talkRes.rows[0].user_id !== req.user.id) {
                    return res.status(403).json({ message: 'You can only edit talks from spaces you own.' });
                }
            }
            
            const updatedTalk = await dharmaTalkModel.update(id, talkData);
            if (!updatedTalk) {
                return res.status(404).json({ message: 'Dharma talk not found.' });
            }
            res.json(updatedTalk);
        } catch (error) {
            console.error('Error updating dharma talk:', error);
            res.status(500).json({ message: `Failed to update dharma talk: ${error.message}` });
        }
    },

    async deleteDharmaTalk(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            
            if (!req.user.permissions.includes('roles')) {
                const talkRes = await pool.query('SELECT s.user_id FROM dharma_talks dt JOIN spaces s ON dt.space_id = s.id WHERE dt.id = $1', [id]);
                if (talkRes.rows.length > 0 && talkRes.rows[0].user_id !== req.user.id) {
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