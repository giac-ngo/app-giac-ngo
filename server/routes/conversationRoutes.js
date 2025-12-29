// server/routes/conversationRoutes.js
import { Router } from 'express';
import { conversationController } from '../controllers/conversationController.js';
import { chatController } from '../controllers/chatController.js';
import { checkPermission } from '../middleware/authMiddleware.js';

const router = Router();

// Streaming and context estimation are part of the 'chat' process
router.post('/chat/stream', chatController.sendMessageStream);
router.post('/chat/estimate-context', chatController.estimateContext);

// Standard conversation CRUD
router.get('/', conversationController.getConversations);
router.post('/', conversationController.createConversation);
router.get('/all', checkPermission('conversations'), conversationController.getAllConversations);
router.delete('/:id', conversationController.deleteConversation);
router.put('/:id', conversationController.updateConversationMessages);
router.put('/:id/rename', conversationController.renameConversation);
router.put('/:id/train-status', conversationController.updateConversationTrainingStatus);
router.post('/:conversationId/messages/:messageId/feedback', conversationController.setMessageFeedback);

export default router;