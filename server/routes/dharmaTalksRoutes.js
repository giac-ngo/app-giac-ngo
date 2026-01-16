// server/routes/dharmaTalksRoutes.js
import { Router } from 'express';
import { dharmaTalksController } from '../controllers/dharmaTalksController.js';
import { checkPermission, isAuthenticated } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.join(__filename, '..', '..')); // Go up to project root
const uploadsDir = path.join(__dirname, 'uploads');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // The spaceId can be a number string, an empty string, or undefined.
    const spaceId = req.body.spaceId || 'global';
    const finalDir = path.join(uploadsDir, String(spaceId), 'dharmatalks');

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
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB limit
});

const fieldsUpload = upload.fields([
  { name: 'avatarFile', maxCount: 1 },
  { name: 'audioFile', maxCount: 1 }, // Legacy support
  { name: 'audioFileVi', maxCount: 1 },
  { name: 'audioFileEn', maxCount: 1 }
]);

const router = Router();

// Public route to get all talks
router.get('/', dharmaTalksController.getAllDharmaTalks);

// Admin routes for management
const protectDharmaRoutes = checkPermission('dharma-talks');
router.post('/', protectDharmaRoutes, fieldsUpload, dharmaTalksController.createDharmaTalk);
router.put('/:id', protectDharmaRoutes, fieldsUpload, dharmaTalksController.updateDharmaTalk);
router.delete('/:id', protectDharmaRoutes, dharmaTalksController.deleteDharmaTalk);

// Public routes for interactions
router.post('/:id/view', dharmaTalksController.incrementDharmaTalkView);
router.post('/:id/like', isAuthenticated, dharmaTalksController.likeDharmaTalk);


export default router;