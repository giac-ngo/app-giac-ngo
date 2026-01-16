// server/controllers/systemController.js
import { systemModel } from '../models/system.model.js';
import { gptService } from '../services/gptService.js';
import { geminiService } from '../services/geminiService.js';
import { userModel } from '../models/user.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { getUserManagedSpaceIds, isAdmin } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const uploadsDir = path.join(projectRoot, 'uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { spaceId, context = 'general' } = req.body;
        // Sanitize to prevent path traversal
        const safeContext = String(context).replace(/[^a-zA-Z0-9_-]/g, '_');
        let dir;

        if (spaceId && spaceId !== 'global' && spaceId !== 'system') {
            const safeSpaceId = String(spaceId).replace(/[^a-zA-Z0-9_-]/g, '_');
            dir = path.join(uploadsDir, `space-${safeSpaceId}`, safeContext);
        } else {
            // For system-level or non-space-specific files, place them in a subfolder within uploads
            dir = path.join(uploadsDir, safeContext);
        }

        try {
            fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        } catch (err) {
            console.error("Error creating upload directory:", err);
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Sanitize to prevent path traversal and other issues
        const safeOriginalName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `file-${uniqueSuffix}-${safeOriginalName}`);
    }
});

const trainingFileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type.'), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: trainingFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export const systemController = {
    async getSystemConfig(req, res) {
        try {
            const config = await systemModel.getConfig();
            if (!config) {
                return res.status(404).json({ message: 'System configuration not found.' });
            }
            res.json(config);
        } catch (error) {
            res.status(500).json({ message: 'Không thể tải cấu hình hệ thống.' });
        }
    },

    async updateSystemConfig(req, res) {
        try {
            const updatedConfig = await systemModel.updateConfig(req.body);
            res.json(updatedConfig);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi cập nhật cấu hình hệ thống.' });
        }
    },

    async getDashboardStats(req, res) {
        try {
            let spaceIds = null;
            if (req.user && !isAdmin(req.user)) {
                spaceIds = await getUserManagedSpaceIds(req.user.id);
            }
            const stats = await systemModel.getDashboardStats(spaceIds);
            res.json(stats);
        } catch (error) {
            console.error("Dashboard Status Error:", error);
            res.status(500).json({ message: 'Không thể tải dữ liệu dashboard.' });
        }
    },

    uploadFiles(req, res) {
        if (!req.file) {
            return res.status(400).send('No file was uploaded.');
        }
        // Construct the relative path from the 'uploads' directory
        const relativePath = path.relative(uploadsDir, req.file.path).replace(/\\/g, '/');
        const filePaths = [`/uploads/${relativePath}`];
        res.json({ filePaths });
    },

    async getAvailableModels(req, res) {
        const { provider } = req.params;
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }
        try {
            const userIdNum = parseInt(Array.isArray(userId) ? userId[0] : userId, 10);
            const user = await userModel.findById(userIdNum);

            if (provider === 'gpt') {
                const apiKey = user?.apiKeys?.gpt || process.env.GPT_API_KEY || process.env.VITE_GPT_API_KEY;
                if (!apiKey) return res.status(400).json({ message: `Vui lòng thêm API key cá nhân cho ${provider.toUpperCase()} trong Cài đặt.` });
                res.json(await gptService.listModels(apiKey));
            } else if (provider === 'gemini') {
                res.json(['gemini-2.5-flash', 'gemini-2.5-pro']);
            }
            else if (provider === 'vertex') {
                res.json(['projects/343195597322/locations/us-central1/endpoints/6040161629629317120']);
            } else if (provider === 'grok') {
                res.json(['grok-1-mock']);
            } else {
                res.status(400).json({ message: `Provider '${provider}' is not supported.` });
            }
        } catch (error) {
            res.status(500).json({ message: `Failed to fetch models from ${provider}: ${error.message}` });
        }
    },

    async generateTtsAudio(req, res) {
        const { text, provider, model, voice, lang, userId } = req.body;
        if (!text || !provider || !model || !voice || !lang || !userId) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        try {
            const user = await userModel.findById(userId);
            const systemConfig = await systemModel.getConfig();
            const apiKey = user?.apiKeys?.[provider] || systemConfig?.systemKeys?.[provider] || process.env[`${provider.toUpperCase()}_API_KEY`] || process.env[`VITE_${provider.toUpperCase()}_API_KEY`];


            if (!apiKey) {
                return res.status(400).json({ message: `API Key for ${provider} not configured.` });
            }

            let audioContent = '';
            if (provider === 'gemini') {
                audioContent = await geminiService.generateTts(text, apiKey, model, voice);
            } else if (provider === 'gpt') {
                audioContent = await gptService.generateTts(text, apiKey, model, voice);
            } else {
                return res.status(400).json({ message: 'Unsupported TTS provider.' });
            }

            res.json({ audioContent });
        } catch (error) {
            res.status(500).json({ message: `TTS generation failed: ${error.message}` });
        }
    },

    async translateText(req, res) {
        const { provider, model, text, targetLanguage, userId, contextPrompt } = req.body;
        if (!provider || !model || !text || !targetLanguage || !userId) {
            return res.status(400).json({ message: 'Missing required fields for translation.' });
        }

        try {
            const user = await userModel.findById(userId);
            const systemConfig = await systemModel.getConfig();
            const apiKey = user?.apiKeys?.[provider] || systemConfig?.systemKeys?.[provider] || process.env[`${provider.toUpperCase()}_API_KEY`] || process.env[`VITE_${provider.toUpperCase()}_API_KEY`];


            if (!apiKey) {
                return res.status(400).json({ message: `API Key for ${provider} not configured.` });
            }

            let translatedText = '';
            const service = provider === 'gemini' ? geminiService : gptService;

            if (!service || typeof service.translateText !== 'function') {
                return res.status(400).json({ message: `Unsupported translation provider: ${provider}` });
            }

            translatedText = await service.translateText(text, targetLanguage, apiKey, model, contextPrompt);

            res.json({ translatedText });
        } catch (error) {
            res.status(500).json({ message: `Translation failed: ${error.message}` });
        }
    },
};