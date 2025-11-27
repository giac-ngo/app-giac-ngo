// server/routes/spacesRoutes.js
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { spacesController } from '../controllers/spacesController.js';
import { checkPermission, isAuthenticated } from '../middleware/authMiddleware.js';
import { aiConfigController } from '../controllers/aiConfigController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.join(__filename, '..'));
const uploadsDir = path.join(__dirname, 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'space-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter, 
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = Router();

router.get('/', spacesController.getAllSpaces);
// FIX: Add a specific route for fetching by numeric ID to resolve ambiguity with the slug route.
router.get('/:id(\\d+)', spacesController.getSpaceById);
router.get('/:slug', spacesController.getSpaceBySlug);
router.post('/', checkPermission('spaces'), upload.single('image'), spacesController.createSpace);
router.put('/:id', checkPermission('spaces'), upload.single('image'), spacesController.updateSpace);
router.delete('/:id', checkPermission('spaces'), spacesController.deleteSpace);

// Route to handle views on a space (public)
router.post('/:id/view', spacesController.incrementViews);

// Route to handle likes on a space (requires user to be logged in)
router.post('/:id/like', isAuthenticated, spacesController.likeSpace);

// Route to handle offerings (donations) to a space
router.post('/:id/offer', isAuthenticated, spacesController.makeOffering);

// Route for getting dharma talks for a specific space
router.get('/:id/dharma-talks', spacesController.getDharmaTalksBySpaceId);

// Route for getting documents for a specific space
router.get('/:id/documents', spacesController.getDocumentsBySpaceId);

// Route for getting AI configs for a specific space
router.get('/:id/ai-configs', aiConfigController.getAiConfigsBySpaceId);

export default router;