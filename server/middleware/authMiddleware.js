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
        
        const isSelf = req.params.id && req.user.id === parseInt(req.params.id, 10);
        const hasAdminPermission = req.user.permissions && req.user.permissions.includes(permission);
        
        if (isSelf || hasAdminPermission) {
            return next();
        }
        
        return res.status(403).json({ message: 'Forbidden: You do not have permission for this resource.' });
    };
};
