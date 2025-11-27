// server/controllers/userController.js
import { userModel } from '../models/user.model.js';
import { verifyPassword, pool, mapRowToCamelCase } from '../db.js';

const mapAndSanitizeUser = (user) => {
    if (!user) return null;
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
};

export const userController = {
    async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 15, search = '' } = req.query;

            // Check permissions inside the controller
            if (req.user && req.user.permissions.includes('users')) {
                // Admin role: can see all users with pagination and search
                const users = await userModel.findAll({
                    page: parseInt(page, 10),
                    limit: parseInt(limit, 10),
                    search: search,
                });
                return res.json(users.map(mapAndSanitizeUser));
            } else if (req.user && (req.user.permissions.includes('spaces') || req.user.permissions.includes('ai'))) {
                // Other management roles (like Content Manager): can only see a list of space owners
                const users = await userModel.findSpaceOwners();
                return res.json(users.map(mapAndSanitizeUser));
            }
            // If user has none of these permissions, they are forbidden.
            return res.status(403).json({ message: 'Forbidden: You do not have permission to view users.' });
        } catch (error) {
            res.status(500).json({ message: 'Không thể tải danh sách người dùng.' });
        }
    },

    async getSpaceOwners(req, res) {
        try {
            const users = await userModel.findSpaceOwners();
            res.json(users.map(mapAndSanitizeUser));
        } catch (error) {
            console.error('Error fetching space owners:', error);
            res.status(500).json({ message: 'Could not fetch space owners.' });
        }
    },

    async getMySpaceOwnerData(req, res) {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required.' });
        }

        try {
            const spacesRes = await pool.query('SELECT id, name FROM spaces WHERE user_id = $1', [userId]);
            const ownedSpaces = spacesRes.rows.map(mapRowToCamelCase);
            const ownedSpaceIds = ownedSpaces.map(s => s.id);

            let revenueHistory = [];
            let totalEarnings = 0;

            if (ownedSpaceIds.length > 0) {
                const revenueRes = await pool.query(
                    `SELECT t.*, u.name as user_name 
                     FROM transactions t
                     JOIN users u ON t.user_id = u.id
                     WHERE t.destination_space_id = ANY($1::int[]) 
                     AND t.type IN ('offering', 'ai_purchase')
                     ORDER BY t.timestamp DESC`,
                    [ownedSpaceIds]
                );
                revenueHistory = revenueRes.rows.map(mapRowToCamelCase);
                totalEarnings = revenueHistory.reduce((sum, tx) => sum + Math.abs(tx.merits), 0);
            }

            const withdrawalRes = await pool.query(
                `SELECT wr.*, u.name as user_name 
                 FROM withdrawal_requests wr
                 JOIN users u ON wr.user_id = u.id
                 WHERE wr.user_id = $1 ORDER BY wr.created_at DESC`,
                [userId]
            );

            const responseData = {
                totalEarnings,
                stripeAccountId: req.user.stripeAccountId,
                ownedSpaces,
                revenueHistory: revenueHistory.map(mapRowToCamelCase),
                withdrawalHistory: withdrawalRes.rows.map(mapRowToCamelCase),
            };

            res.json(responseData);

        } catch (error) {
            console.error('Error fetching space owner data:', error);
            res.status(500).json({ message: 'Failed to fetch space owner data.' });
        }
    },

    async createUser(req, res) {
        try {
            const newUser = await userModel.create(req.body);
            res.status(201).json(mapAndSanitizeUser(newUser));
        } catch (error) {
            res.status(500).json({ message: `Lỗi khi tạo người dùng: ${error.message}` });
        }
    },

    async updateUser(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) return res.status(400).json({ message: 'User ID không hợp lệ.' });

            const isAdmin = req.user.permissions.includes('users');
            
            const payload = { ...req.body };
            if (payload.password === '') delete payload.password;

            // Prevent non-admins from escalating privileges or changing sensitive fields
            if (!isAdmin) {
                delete payload.roleIds;
                delete payload.isActive;
                delete payload.merits;
                delete payload.email;
                delete payload.password;
            }
            
            const updatedUser = await userModel.update(id, payload);
            res.json(mapAndSanitizeUser(updatedUser));
        } catch (error) {
            console.error("Lỗi khi cập nhật người dùng:", error);
            res.status(500).json({ message: 'Lỗi khi cập nhật người dùng.' });
        }
    },

    async deleteUser(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) return res.status(400).json({ message: 'User ID không hợp lệ.' });
            if (req.user.id === id) {
                return res.status(400).json({ message: 'Bạn không thể xóa chính mình.' });
            }
            await userModel.delete(id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi xóa người dùng.' });
        }
    },

    async regenerateApiToken(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) return res.status(400).json({ message: 'User ID không hợp lệ.' });
            const updatedUser = await userModel.regenerateApiToken(id);
            res.json(mapAndSanitizeUser(updatedUser));
        } catch (error) {
            res.status(500).json({ message: `Lỗi khi tạo token mới: ${error.message}` });
        }
    },
    
    async changePassword(req, res) {
        const { userId, oldPassword, newPassword } = req.body;
        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({ message: 'User ID, current password, and new password are required.' });
        }
        if (req.user.id !== userId) {
            return res.status(403).json({ message: 'Forbidden: You can only change your own password.' });
        }
        try {
            const user = await userModel.findById(userId); // Re-fetch to get password hash
            if (!user) throw new Error('User not found.');
            const isMatch = await verifyPassword(oldPassword, user.password);
            if (!isMatch) throw new Error('Incorrect current password.');
            
            await userModel.update(userId, { password: newPassword });
            res.status(200).json({ message: 'Password changed successfully.' });
        } catch (error) {
            const clientMessage = error.message === 'Incorrect current password.' ? error.message : 'An error occurred.';
            res.status(400).json({ message: clientMessage });
        }
    },
};