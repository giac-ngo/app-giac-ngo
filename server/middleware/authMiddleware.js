// server/middleware/authMiddleware.js
import { userModel } from '../models/user.model.js';

const mapAndSanitizeUser = (user) => {
    if (!user) return null;
    const { password, resetToken, resetTokenExpires, ...sanitizedUser } = user;
    return sanitizedUser;
};


export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const user = await userModel.findByApiToken(token);
        if (user) {
            req.user = mapAndSanitizeUser(user);
        } else {
            req.user = null;
        }
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        req.user = null;
        next();
    }
};

export const isAuthenticated = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
    }
    next();
};

export const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required.' });
        }
        if (!req.user.permissions || !req.user.permissions.includes(permission)) {
            return res.status(403).json({ message: 'Forbidden: You do not have the required permission.' });
        }
        next();
    };
};

export const checkSelfOrPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required.' });
        }

        const isSelf = req.params.id && String(req.user.id) === String(req.params.id);
        const hasAdminPermission = req.user.permissions && req.user.permissions.includes(permission);

        if (isSelf || hasAdminPermission) {
            return next();
        }

        console.warn(`Access denied for user ${req.user.id} to resource ${req.params.id}. IsSelf: ${isSelf}, HasPermission: ${hasAdminPermission}`);
        return res.status(403).json({ message: 'Forbidden: You do not have permission for this resource.' });
    };
};

// Helper functions for space-based access control
export const getUserManagedSpaceIds = async (userId) => {
    const { pool } = await import('../db.js');
    const result = await pool.query('SELECT id FROM spaces WHERE user_id = $1', [userId]);
    return result.rows.map(row => row.id);
};

export const isAdmin = (user) => {
    return user && user.permissions && user.permissions.includes('roles');
};

export const canAccessSpace = async (user, spaceId) => {
    if (isAdmin(user)) return true;
    const userSpaceIds = await getUserManagedSpaceIds(user.id);
    return userSpaceIds.includes(parseInt(spaceId));
};

