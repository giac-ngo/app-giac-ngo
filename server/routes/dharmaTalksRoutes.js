// server/routes/dharmaTalksRoutes.js
import { Router } from 'express';
import { dharmaTalksController } from '../controllers/dharmaTalksController.js';
import { checkPermission, isAuthenticated } from '../middleware/authMiddleware.js';

const router = Router();

// Public route to get all talks
router.get('/', dharmaTalksController.getAllDharmaTalks);

// Admin routes for management
const protectDharmaRoutes = checkPermission('dharma-talks');
router.post('/', protectDharmaRoutes, dharmaTalksController.createDharmaTalk);
router.put('/:id', protectDharmaRoutes, dharmaTalksController.updateDharmaTalk);
router.delete('/:id', protectDharmaRoutes, dharmaTalksController.deleteDharmaTalk);

// Public route to like a talk
router.post('/:id/like', isAuthenticated, dharmaTalksController.likeDharmaTalk);


export default router;