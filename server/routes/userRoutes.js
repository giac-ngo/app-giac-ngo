// server/routes/userRoutes.js
import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { checkPermission, checkSelfOrPermission, isAuthenticated } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', isAuthenticated, userController.getAllUsers);
router.get('/space-owners', checkPermission('ai'), userController.getSpaceOwners);
router.get('/my-space-owner-data', isAuthenticated, userController.getMySpaceOwnerData);

router.post('/', checkPermission('users'), userController.createUser);
router.put('/:id', checkSelfOrPermission('users'), userController.updateUser);
router.delete('/:id', checkSelfOrPermission('users'), userController.deleteUser);
router.post('/:id/regenerate-token', checkSelfOrPermission('users'), userController.regenerateApiToken);

router.post('/change-password', isAuthenticated, userController.changePassword);

export default router;