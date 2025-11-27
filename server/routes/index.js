// server/routes/index.js
import 'dotenv/config';

// Force development mode if not explicitly set to production to prevent server crash
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_ENV = 'development';
}

import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import authRoutes from './authRoutes.js';
import aiConfigRoutes from './aiConfigRoutes.js';
import conversationRoutes from './conversationRoutes.js';
import documentRoutes from './documentRoutes.js';
import userRoutes from './userRoutes.js';
import roleRoutes from './roleRoutes.js';
import billingRoutes from './billingRoutes.js';
import systemRoutes from './systemRoutes.js';
import koiiRoutes from './koiiRoutes.js';
import trainingDataRoutes from './trainingDataRoutes.js';
import libraryRoutes from './libraryRoutes.js';
import commentRoutes from './commentRoutes.js';
import spacesRoutes from './spacesRoutes.js';
import dharmaTalksRoutes from './dharmaTalksRoutes.js';
import spaceTypesRoutes from './spaceTypesRoutes.js';

const router = Router();

// This middleware will run for all /api routes, attempting to authenticate the user
router.use(authenticateToken);

router.use(authRoutes);
router.use('/ai-configs', aiConfigRoutes);
router.use('/conversations', conversationRoutes);
router.use('/documents', documentRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use(billingRoutes);
router.use(systemRoutes);
router.use('/koii', koiiRoutes);
router.use('/training-data', trainingDataRoutes);
router.use('/library', libraryRoutes);
router.use(commentRoutes);
router.use('/spaces', spacesRoutes);
router.use('/space-types', spaceTypesRoutes);
router.use('/dharma-talks', dharmaTalksRoutes);


// The '/translate' route is correctly handled in systemRoutes.js
// router.post('/translate', systemController.translateText); // This line was causing the error.

export default router;