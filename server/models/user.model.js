// server/models/user.model.js
import { pool, mapRowToCamelCase } from '../db.js';
import crypto from 'crypto';
import { cryptoService } from '../services/cryptoService.js';

// Helper function to enrich user with roles and permissions
export const enrichUserWithPermissions = async (user) => {
    if (!user) return null;

    if (user.apiKeys) {
        const decryptedKeys = {};
        for (const key in user.apiKeys) {
            if (user.apiKeys[key]) { // Only decrypt non-empty keys
                decryptedKeys[key] = cryptoService.decrypt(user.apiKeys[key]);
            } else {
                decryptedKeys[key] = '';
            }
        }
        user.apiKeys = decryptedKeys;
    }

    const [rolesRes, ownedAisRes, grantedAisRes] = await Promise.all([
        pool.query(`
            SELECT r.* FROM roles r
            JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = $1
        `, [user.id]),
        pool.query('SELECT ai_config_id, requests_remaining FROM user_owned_ais WHERE user_id = $1', [user.id]),
        pool.query('SELECT ai_config_id FROM ai_user_access WHERE user_id = $1', [user.id])
    ]);

    const roles = rolesRes.rows.map(mapRowToCamelCase);
    const roleIds = roles.map(r => r.id);
    const permissions = new Set(roles.flatMap(r => r.permissions || []));
    const ownedAis = ownedAisRes.rows.map(r => ({
        aiConfigId: r.ai_config_id,
        requestsRemaining: parseInt(r.requests_remaining, 10) || 0
    }));
    const grantedAiConfigIds = grantedAisRes.rows.map(r => r.ai_config_id);

    return { ...user, roleIds, permissions: Array.from(permissions), ownedAis, grantedAiConfigIds };
}

const updateRolesForUser = async (userId, roleIds, client = pool) => {
    await client.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
    if (roleIds && roleIds.length > 0) {
        const values = roleIds.map(roleId => `(${userId}, ${roleId})`).join(',');
        await client.query(`INSERT INTO user_roles (user_id, role_id) VALUES ${values}`);
    }
};

export const userModel = {
    async findByEmail(email) {
        const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
        const user = res.rows[0] ? mapRowToCamelCase(res.rows[0]) : null;
        if (!user) return null;
        return enrichUserWithPermissions(user);
    },

    async findById(id) {
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        const user = res.rows[0] ? mapRowToCamelCase(res.rows[0]) : null;
        if (!user) return null;
        return enrichUserWithPermissions(user);
    },

    async findByApiToken(token) {
        const res = await pool.query('SELECT * FROM users WHERE api_token = $1', [token]);
        const user = res.rows[0] ? mapRowToCamelCase(res.rows[0]) : null;
        if (!user || !user.isActive) return null;
        return enrichUserWithPermissions(user);
    },

    async findByResetToken(token) {
        const res = await pool.query('SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()', [token]);
        const user = res.rows[0] ? mapRowToCamelCase(res.rows[0]) : null;
        if (!user) return null;
        return enrichUserWithPermissions(user);
    },

    async findUserIdsByEmails(emails) {
        if (!emails || emails.length === 0) return [];
        const res = await pool.query('SELECT id FROM users WHERE email = ANY($1::text[])', [emails]);
        return res.rows.map(r => r.id);
    },

    async findAll(filters = {}) {
        const { limit = 15, page = 1, search = '' } = filters;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM users';
        const params = [];
        let paramIndex = 1;

        if (search) {
            query += ` WHERE name ILIKE $${paramIndex++} OR email ILIKE $${paramIndex++}`;
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ` ORDER BY id ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(limit, offset);

        const res = await pool.query(query, params);
        const users = res.rows.map(mapRowToCamelCase);
        return Promise.all(users.map(enrichUserWithPermissions));
    },

    async findSpaceOwners() {
        const res = await pool.query(`
            SELECT DISTINCT u.* 
            FROM users u
            JOIN spaces s ON u.id = s.user_id
            ORDER BY u.name ASC
        `);
        const users = res.rows.map(mapRowToCamelCase);
        return Promise.all(users.map(enrichUserWithPermissions));
    },

    async create(userData) {
        let { email, password, name, avatarUrl, roleIds, template, apiKeys } = userData;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            if (!email || !password || !name) {
                throw new Error('Email, password, and name are required.');
            }
            const lowerEmail = email.toLowerCase();

            const N = 8192, r = 8, p = 1, keylen = 64;
            const salt = crypto.randomBytes(8).toString('hex');
            const derivedKey = await new Promise((resolve, reject) => {
                crypto.scrypt(password, salt, keylen, { N, r, p }, (err, derivedKey) => {
                    if (err) reject(err);
                    resolve(derivedKey);
                });
            });
            const hashedPassword = `scrypt:${N}:${r}:${p}$${salt}$${derivedKey.toString('hex')}`;
            const apiToken = crypto.randomBytes(24).toString('hex');

            let encryptedKeys = null;
            if (apiKeys) {
                encryptedKeys = {};
                for (const key in apiKeys) {
                    if (apiKeys[key]) {
                        encryptedKeys[key] = cryptoService.encrypt(apiKeys[key]);
                    }
                }
            }

            const res = await client.query(
                'INSERT INTO users (email, password, name, avatar_url, merits, is_active, template, api_token, api_keys) VALUES ($1, $2, $3, $4, 0, true, $5, $6, $7) RETURNING *',
                [lowerEmail, hashedPassword, name, avatarUrl || `https://i.pravatar.cc/150?u=${lowerEmail}`, template, apiToken, encryptedKeys]
            );
            const newUser = mapRowToCamelCase(res.rows[0]);

            if (roleIds && roleIds.length > 0) {
                await updateRolesForUser(newUser.id, roleIds, client);
            }

            await client.query('COMMIT');
            return enrichUserWithPermissions(newUser);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async update(id, userData) {
        const { roleIds, password, ...fieldsToUpdate } = userData;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            if (fieldsToUpdate.subscriptionPlanId !== undefined) {
                const currentUserRes = await client.query('SELECT subscription_plan_id FROM users WHERE id = $1', [id]);
                const currentPlanId = currentUserRes.rows[0]?.subscription_plan_id;
                if (fieldsToUpdate.subscriptionPlanId != currentPlanId) {
                    if (fieldsToUpdate.subscriptionPlanId == null) {
                        fieldsToUpdate.requestsRemaining = 0;
                    } else {
                        const planRes = await client.query('SELECT request_limit FROM pricing_plans WHERE id = $1', [fieldsToUpdate.subscriptionPlanId]);
                        if (planRes.rows[0]) {
                            fieldsToUpdate.requestsRemaining = planRes.rows[0].request_limit;
                        } else {
                            throw new Error(`Pricing plan with ID ${fieldsToUpdate.subscriptionPlanId} not found.`);
                        }
                    }
                }
            }

            if (password) {
                const N = 8192, r = 8, p = 1, keylen = 64;
                const salt = crypto.randomBytes(8).toString('hex');
                const derivedKey = await new Promise((resolve, reject) => {
                    crypto.scrypt(password, salt, keylen, { N, r, p }, (err, key) => {
                        if (err) reject(err);
                        resolve(key);
                    });
                });
                fieldsToUpdate.password = `scrypt:${N}:${r}:${p}$${salt}$${derivedKey.toString('hex')}`;
            }

            if (fieldsToUpdate.apiKeys) {
                const encryptedKeys = {};
                for (const key in fieldsToUpdate.apiKeys) {
                    if (fieldsToUpdate.apiKeys[key]) {
                        encryptedKeys[key] = cryptoService.encrypt(fieldsToUpdate.apiKeys[key]);
                    } else {
                        encryptedKeys[key] = '';
                    }
                }
                fieldsToUpdate.apiKeys = encryptedKeys;
            }

            delete fieldsToUpdate.id;
            delete fieldsToUpdate.permissions;
            delete fieldsToUpdate.isAdmin;
            delete fieldsToUpdate.grantedAiConfigIds; // This is a derived field, do not save it
            delete fieldsToUpdate.ownedAis; // This is a derived field, do not save it

            if (Object.keys(fieldsToUpdate).length > 0) {
                const setClauses = Object.keys(fieldsToUpdate).map((key, i) => {
                    const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                    return `${dbKey} = $${i + 1}`;
                }).join(', ');
                const values = Object.values(fieldsToUpdate);
                await client.query(`UPDATE users SET ${setClauses} WHERE id = $${values.length + 1}`, [...values, id]);
            }

            if (roleIds !== undefined) {
                await updateRolesForUser(id, roleIds, client);
            }

            const res = await client.query('SELECT * FROM users WHERE id = $1', [id]);
            await client.query('COMMIT');

            if (res.rows.length === 0) throw new Error('User not found after update.');
            const updatedUser = mapRowToCamelCase(res.rows[0]);
            return enrichUserWithPermissions(updatedUser);

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async delete(id) {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
    },

    async regenerateApiToken(userId) {
        const apiToken = crypto.randomBytes(24).toString('hex');
        const res = await pool.query('UPDATE users SET api_token = $1 WHERE id = $2 RETURNING *', [apiToken, userId]);
        if (res.rows.length === 0) throw new Error('User not found.');
        return enrichUserWithPermissions(mapRowToCamelCase(res.rows[0]));
    },

    async saveResetToken(userId, token) {
        const expires = new Date(Date.now() + 3600000); // 1 hour expiry
        await pool.query('UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3', [token, expires, userId]);
    },

    async deductRequest(userId) {
        const res = await pool.query(
            'UPDATE users SET requests_remaining = requests_remaining - 1 WHERE id = $1 AND requests_remaining > 0 RETURNING *',
            [userId]
        );

        if (res.rows.length > 0) {
            return enrichUserWithPermissions(mapRowToCamelCase(res.rows[0]));
        } else {
            return this.findById(userId);
        }
    },
};