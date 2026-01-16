// server/routes/meditationRoutes.js
import { Router } from 'express';
import { meditationController } from '../controllers/meditationController.js';
import { checkPermission } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.join(__filename, '..', '..')); // Go up to project root
const uploadsDir = path.join(__dirname, 'uploads');

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const spaceId = req.body.spaceId || 'global';
        const finalDir = path.join(uploadsDir, String(spaceId), 'meditation');

        try {
            await fs.mkdir(finalDir, { recursive: true });
            cb(null, finalDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB limit for audio
});

const fieldsUpload = upload.fields([
    { name: 'audioFile', maxCount: 1 },
    { name: 'audioFileEn', maxCount: 1 }
]);

const router = Router();

// Public route to get meditation by space
router.get('/space/:spaceId', meditationController.getMeditationBySpaceId);

// Admin routes
const protectMeditationRoutes = checkPermission('meditation');

router.get('/', protectMeditationRoutes, meditationController.getAllMeditations);
router.post('/', protectMeditationRoutes, fieldsUpload, meditationController.createMeditation);
router.put('/:id', protectMeditationRoutes, fieldsUpload, meditationController.updateMeditation);
router.delete('/:id', protectMeditationRoutes, meditationController.deleteMeditation);

export default router;
