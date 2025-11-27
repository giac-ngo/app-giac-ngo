// server/models/spaceType.model.js
import { pool, mapRowToCamelCase } from '../db.js';

export const spaceTypeModel = {
    async findAll() {
        const res = await pool.query('SELECT * FROM space_types ORDER BY name ASC');
        return res.rows.map(mapRowToCamelCase);
    },

    async create(data) {
        const { name, nameEn, icon } = data;
        const res = await pool.query(
            'INSERT INTO space_types (name, name_en, icon) VALUES ($1, $2, $3) RETURNING *',
            [name, nameEn, icon]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async update(id, data) {
        const { name, nameEn, icon } = data;
        const res = await pool.query(
            'UPDATE space_types SET name = $1, name_en = $2, icon = $3 WHERE id = $4 RETURNING *',
            [name, nameEn, icon, id]
        );
        return mapRowToCamelCase(res.rows[0]);
    },

    async delete(id) {
        const usageCheck = await pool.query('SELECT 1 FROM spaces WHERE type_id = $1 LIMIT 1', [id]);
        if (usageCheck.rows.length > 0) {
            throw new Error('Cannot delete this type because it is in use by one or more spaces.');
        }
        await pool.query('DELETE FROM space_types WHERE id = $1', [id]);
    }
};