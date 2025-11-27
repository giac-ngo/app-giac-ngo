// server/routes/spaceTypesRoutes.js
import { Router } from 'express';
import { spaceTypesController } from '../controllers/spaceTypesController.js';
import { checkPermission } from '../middleware/authMiddleware.js';

const router = Router();

const protectSpaceTypeRoutes = checkPermission('spaces');

router.get('/', protectSpaceTypeRoutes, spaceTypesController.getSpaceTypes);
router.post('/', protectSpaceTypeRoutes, spaceTypesController.createSpaceType);
router.put('/:id', protectSpaceTypeRoutes, spaceTypesController.updateSpaceType);
router.delete('/:id', protectSpaceTypeRoutes, spaceTypesController.deleteSpaceType);

export default router;