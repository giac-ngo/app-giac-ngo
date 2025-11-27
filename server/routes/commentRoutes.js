// server/routes/commentRoutes.js
import { Router } from 'express';
import { commentController } from '../controllers/commentController.js';
import { checkPermission, isAuthenticated } from '../middleware/authMiddleware.js';

const router = Router();

// Public endpoint for posting comments
router.post('/comments', isAuthenticated, commentController.postComment);

// Admin endpoints for managing comments
const protectCommentRoutes = checkPermission('comments');
router.get('/admin/comments', protectCommentRoutes, commentController.getComments);
router.put('/admin/comments/:id/status', protectCommentRoutes, commentController.updateCommentStatus);
router.delete('/admin/comments/:id', protectCommentRoutes, commentController.deleteComment);

export default router;
