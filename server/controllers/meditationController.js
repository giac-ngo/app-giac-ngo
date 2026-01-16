// server/controllers/meditationController.js
import { meditationModel } from '../models/meditation.model.js';

export const meditationController = {
    getAllMeditations: async (req, res) => {
        try {
            const sessions = await meditationModel.findAll();
            res.json(sessions);
        } catch (error) {
            console.error('Error fetching meditations:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getMeditationBySpaceId: async (req, res) => {
        try {
            const { spaceId } = req.params;
            const session = await meditationModel.findBySpaceId(spaceId);
            // If not found, return null instead of 404 to avoid errors in frontend
            res.json(session || null);
        } catch (error) {
            console.error('Error fetching meditation:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    createMeditation: async (req, res) => {
        try {
            const { spaceId, title, titleEn, description, descriptionEn, duration } = req.body;
            const files = req.files;

            let audioUrl = '';
            let audioUrlEn = null;

            if (files && files.audioFile) {
                audioUrl = `/uploads/${spaceId}/meditation/${files.audioFile[0].filename}`;
            }
            if (files && files.audioFileEn) {
                audioUrlEn = `/uploads/${spaceId}/meditation/${files.audioFileEn[0].filename}`;
            }

            if (!audioUrl) {
                return res.status(400).json({ error: 'Vietnamese audio file is required' });
            }

            const newSession = await meditationModel.create({
                spaceId,
                title,
                titleEn,
                description,
                descriptionEn,
                audioUrl,
                audioUrlEn,
                duration
            });

            res.status(201).json(newSession);
        } catch (error) {
            console.error('Error creating meditation:', error);
            if (error.code === '23505') { // Unique violation
                return res.status(400).json({ error: 'A meditation session already exists for this space' });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateMeditation: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, titleEn, description, descriptionEn, duration } = req.body;
            const files = req.files;

            const updateData = {
                title,
                titleEn,
                description,
                descriptionEn,
                duration
            };

            const spaceId = req.body.spaceId; // Need spaceId for upload path consistency

            if (files) {
                if (files.audioFile) {
                    updateData.audioUrl = `/uploads/${spaceId}/meditation/${files.audioFile[0].filename}`;
                }
                if (files.audioFileEn) {
                    updateData.audioUrlEn = `/uploads/${spaceId}/meditation/${files.audioFileEn[0].filename}`;
                }
            }

            const updatedSession = await meditationModel.update(id, updateData);
            if (!updatedSession) {
                return res.status(404).json({ error: 'Meditation session not found' });
            }

            res.json(updatedSession);
        } catch (error) {
            console.error('Error updating meditation:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    deleteMeditation: async (req, res) => {
        try {
            const { id } = req.params;
            const deletedSession = await meditationModel.delete(id);
            if (!deletedSession) {
                return res.status(404).json({ error: 'Meditation session not found' });
            }
            res.json(deletedSession);
        } catch (error) {
            console.error('Error deleting meditation:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
