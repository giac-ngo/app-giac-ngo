// server/models/role.model.js
import { pool, mapRowToCamelCase } from '../db.js';

export const roleModel = {
    async findAll() {
        const res = await pool.query('SELECT * FROM roles ORDER BY name ASC');
        return res.rows.map(mapRowToCamelCase);
    },

    async create(roleData) {
        const { name, permissions } = roleData;
        const res = await pool.query('INSERT INTO roles (name, permissions) VALUES ($1, $2) RETURNING *', [name, permissions]);
        return mapRowToCamelCase(res.rows[0]);
    },

    async update(id, roleData) {
        const { name, permissions } = roleData;
        const res = await pool.query('UPDATE roles SET name = $1, permissions = $2 WHERE id = $3 RETURNING *', [name, permissions, id]);
        return mapRowToCamelCase(res.rows[0]);
    },

    async delete(id) {
        await pool.query('DELETE FROM roles WHERE id = $1', [id]);
    },
};