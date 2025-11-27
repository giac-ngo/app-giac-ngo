// server/routes/contactRoutes.js
import { Router } from 'express';
import { contactController } from '../controllers/contactController.js';

const router = Router();

// Public contact form endpoint
router.post('/contact', contactController.sendContactForm);

export default router;
