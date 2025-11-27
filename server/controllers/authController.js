
// server/controllers/authController.js
import { userModel } from '../models/user.model.js';
import { mailService } from '../services/mailService.js';
import { verifyPassword } from '../db.js';
import crypto from 'crypto';

const mapAndSanitizeUser = (user) => {
    if (!user) return null;
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
};

export const authController = {
    async login(req, res) {
        const { email, password } = req.body;
        try {
            let user = await userModel.findByEmail(email);
            if (!user || !user.isActive) {
                return res.status(401).json({ message: 'Tài khoản không hợp lệ hoặc đã bị vô hiệu hóa.' });
            }
            const isMatch = await verifyPassword(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
            }

            if (!user.apiToken) {
                console.log(`User ${user.email} logged in without an API token. Generating one now.`);
                user = await userModel.regenerateApiToken(user.id);
            }

            res.json(mapAndSanitizeUser(user));
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
        }
    },

    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ message: 'Tên, email, và mật khẩu là bắt buộc.' });
            }
            const existingUser = await userModel.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({ message: 'Email đã được sử dụng.' });
            }
            const newUserPayload = {
                name, email, password,
                isActive: true, merits: 100,
                avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
                roleIds: [3], // Default 'User' role
                template: 'giacngo'
            };
            const newUser = await userModel.create(newUserPayload);
            res.status(201).json(mapAndSanitizeUser(newUser));
        } catch (error) {
            console.error("Lỗi đăng ký:", error);
            res.status(500).json({ message: `Lỗi khi tạo người dùng: ${error.message}` });
        }
    },

    async forgotPassword(req, res) {
        try {
            const { email, language } = req.body;
            const user = await userModel.findByEmail(email);
            if (user) {
                const token = crypto.randomBytes(32).toString('hex');
                await userModel.saveResetToken(user.id, token);
                await mailService.sendPasswordResetEmail(user.email, token, language);
            }
            res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }
    },

    async resetPassword(req, res) {
        try {
            const { token, password } = req.body;
            if (!token || !password) {
                return res.status(400).json({ message: 'Token and new password are required.' });
            }
            const user = await userModel.findByResetToken(token);
            if (!user) {
                return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
            }
            await userModel.update(user.id, { 
                password,
                resetToken: null,
                resetTokenExpires: null
            });
            res.status(200).json({ message: 'Password has been reset successfully.' });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ message: 'An error occurred while resetting the password.' });
        }
    },

    googleCallback: (oauth2Client) => async (req, res) => {
        const { code } = req.query;
        try {
            const { tokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);
            const ticket = await oauth2Client.verifyIdToken({
                idToken: tokens.id_token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            const { email, name, picture } = payload;

            let user = await userModel.findByEmail(email);
            if (!user) {
                const randomPassword = crypto.randomBytes(20).toString('hex');
                user = await userModel.create({
                    name, email, password: randomPassword,
                    avatarUrl: picture, isActive: true, merits: 100,
                    roleIds: [3], template: 'giacngo'
                });
            }
            
            if (!user.isActive) {
                return res.redirect('/#/login?error=account_disabled');
            }

            const sanitizedUser = mapAndSanitizeUser(user);
            const userJson = JSON.stringify(sanitizedUser);
            const base64User = Buffer.from(userJson).toString('base64');
            res.redirect(`/#/auth/callback?user=${base64User}`);
        } catch (error) {
            console.error('Google auth callback error:', error);
            res.redirect('/#/login?error=auth_failed');
        }
    }
};
