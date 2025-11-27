// server/routes/aiConfigRoutes.js
import { Router } from 'express';
import { aiConfigController } from '../controllers/aiConfigController.js';
import { documentController } from '../controllers/documentController.js';
import { trainingDataController } from '../controllers/trainingDataController.js';
import { conversationController } from '../controllers/conversationController.js';
import { checkPermission, isAuthenticated } from '../middleware/authMiddleware.js';


const router = Router();

router.post('/', aiConfigController.getVisibleAiConfigs);
router.post('/manageable', isAuthenticated, aiConfigController.getManageableAiConfigs);
router.post('/create', checkPermission('ai'), aiConfigController.createAiConfig);

router.get('/:id/trained-conversations', isAuthenticated, conversationController.getTrainedConversationsByAiId);
router.post('/:id/test-conversations', isAuthenticated, conversationController.getTestConversationsByAiId);
router.post('/:id/latest-conversation', isAuthenticated, conversationController.getLatestConversationByAiId);

// AI <-> Document Linking
router.post('/:id/documents', checkPermission('ai'), documentController.linkDocumentsToAi);
router.delete('/:id/documents/:docId', checkPermission('ai'), documentController.unlinkDocumentFromAi);

// AI <-> Training Data
router.get('/:id/training-data', checkPermission('ai'), trainingDataController.getTrainingDataForAI);
router.post('/:id/training-data', checkPermission('ai'), trainingDataController.upload.single('file'), trainingDataController.createTrainingDataSourceForAI);


router.put('/:id', checkPermission('ai'), aiConfigController.updateAiConfig);
router.delete('/:id', checkPermission('ai'), aiConfigController.deleteAiConfig);

// AI Purchasing
router.post('/:id/purchase', isAuthenticated, aiConfigController.purchaseAi);
router.post('/:id/claim', isAuthenticated, aiConfigController.claimFreeAi);

// AI Contact-for-Access User Management
router.get('/:id/access', checkPermission('ai'), aiConfigController.getAiAccessList);
router.post('/:id/access', checkPermission('ai'), aiConfigController.updateAiAccessList);


export default router;