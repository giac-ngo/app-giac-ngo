// server/routes/trainingDataRoutes.js
import { Router } from 'express';
import { trainingDataController } from '../controllers/trainingDataController.js';
import { checkPermission } from '../middleware/authMiddleware.js';

const router = Router();
const protectTrainingRoutes = checkPermission('ai');

router.delete('/:id', protectTrainingRoutes, trainingDataController.deleteTrainingDataSource);
router.post('/:id/summarize', protectTrainingRoutes, trainingDataController.generateSummaryForDataSource);
router.delete('/qa', protectTrainingRoutes, trainingDataController.deleteTrainingQaDataSource);
router.get('/qa/all', checkPermission('finetune'), trainingDataController.getAllQaTrainingData);
router.post('/qa/export', checkPermission('finetune'), trainingDataController.exportQaDataForFinetune);

export default router;
