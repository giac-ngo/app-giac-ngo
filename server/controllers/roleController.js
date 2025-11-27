// server/controllers/roleController.js
import { roleModel } from '../models/role.model.js';

export const roleController = {
    async getAllRoles(req, res) {
        try {
            const roles = await roleModel.findAll();
            res.json(roles);
        } catch (error) {
            res.status(500).json({ message: 'Không thể tải danh sách quyền.' });
        }
    },

    async createRole(req, res) {
        try {
            const newRole = await roleModel.create(req.body);
            res.status(201).json(newRole);
        } catch (error) {
            res.status(500).json({ message: `Lỗi khi tạo quyền mới: ${error.message}` });
        }
    },

    async updateRole(req, res) {
        try {
            const updatedRole = await roleModel.update(req.params.id, req.body);
            res.json(updatedRole);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi cập nhật quyền.' });
        }
    },

    async deleteRole(req, res) {
        try {
            await roleModel.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi xóa quyền.' });
        }
    },
};