import { Router } from 'express';
import { spaceTypesController } from '../controllers/spaceTypesController.js';
import { checkPermission, isAuthenticated } from '../middleware/authMiddleware.js';

const router = Router();

const protectSpaceTypeRoutes = checkPermission('spaces');

router.get('/', isAuthenticated, spaceTypesController.getSpaceTypes);
router.post('/', protectSpaceTypeRoutes, spaceTypesController.createSpaceType);
router.put('/:id', protectSpaceTypeRoutes, spaceTypesController.updateSpaceType);
router.delete('/:id', protectSpaceTypeRoutes, spaceTypesController.deleteSpaceType);

export default router;