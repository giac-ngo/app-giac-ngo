// server/controllers/spaceTypesController.js
import { spaceTypeModel } from '../models/spaceType.model.js';

export const spaceTypesController = {
    async getSpaceTypes(req, res) {
        try {
            const types = await spaceTypeModel.findAll();
            res.json(types);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch space types.' });
        }
    },
    async createSpaceType(req, res) {
        try {
            const newType = await spaceTypeModel.create(req.body);
            res.status(201).json(newType);
        } catch (error) {
            res.status(500).json({ message: `Failed to create space type: ${error.message}` });
        }
    },
    async updateSpaceType(req, res) {
        try {
            const updatedType = await spaceTypeModel.update(req.params.id, req.body);
            res.json(updatedType);
        } catch (error) {
            res.status(500).json({ message: `Failed to update space type: ${error.message}` });
        }
    },
    async deleteSpaceType(req, res) {
        try {
            await spaceTypeModel.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ message: `Failed to delete space type: ${error.message}` });
        }
    }
};