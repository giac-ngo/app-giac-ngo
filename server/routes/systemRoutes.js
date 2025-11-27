// server/routes/systemRoutes.js
import { Router } from 'express';
import { systemController, upload } from '../controllers/systemController.js';
import { checkPermission, isAuthenticated } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/system-config', systemController.getSystemConfig);
router.put('/system-config', checkPermission('settings'), systemController.updateSystemConfig);
router.post('/upload', isAuthenticated, upload.single('file'), systemController.uploadFiles);
router.get('/models/:provider', isAuthenticated, systemController.getAvailableModels);

// Dashboard
router.get('/dashboard/stats', checkPermission('dashboard'), systemController.getDashboardStats);

// TTS - This is now also handled in documentController to be more feature-specific
router.post('/tts/generate', isAuthenticated, systemController.generateTtsAudio);

// A new translation route for document AI features
router.post('/translate', isAuthenticated, systemController.translateText);

export default router;