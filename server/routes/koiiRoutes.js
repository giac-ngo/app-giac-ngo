// server/routes/koiiRoutes.js
import { Router } from 'express';
import { koiiController } from '../controllers/koiiController.js';
import { checkPermission } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/submit-task', checkPermission('ai'), koiiController.submitTask);
router.get('/task-status/:aiConfigId', checkPermission('ai'), koiiController.getTaskStatus);

export default router;
