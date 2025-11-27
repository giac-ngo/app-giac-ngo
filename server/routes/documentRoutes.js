// server/routes/documentRoutes.js
import { Router } from 'express';
import { documentController } from '../controllers/documentController.js';
import { checkPermission } from '../middleware/authMiddleware.js';

const router = Router();

// Document AI Features (Translate, Extract)
router.post('/extract-text', documentController.extractUpload.single('file'), documentController.extractTextFromFile);
router.get('/config', documentController.getDocumentConfig);
router.put('/config', checkPermission('files'), documentController.updateDocumentConfig);


// Document CRUD
router.get('/', documentController.getDocuments);
router.post('/', checkPermission('files'), documentController.createDocument);
router.put('/:id', checkPermission('files'), documentController.updateDocument);
router.delete('/:id', checkPermission('files'), documentController.deleteDocument);
router.post('/:id/like', documentController.likeDocument);


// --- Document Categories ---
router.get('/authors', documentController.getDocumentAuthors);
router.post('/authors', documentController.createDocumentAuthor);
router.put('/authors/:id', documentController.updateDocumentAuthor);
router.delete('/authors/:id', documentController.deleteDocumentAuthor);

router.get('/types', documentController.getDocumentTypes);
router.post('/types', documentController.createDocumentType);
router.put('/types/:id', documentController.updateDocumentType);
router.delete('/types/:id', documentController.deleteDocumentType);

router.get('/topics', documentController.getDocumentTopics);
router.post('/topics', documentController.createDocumentTopic);
router.put('/topics/:id', documentController.updateDocumentTopic);
router.delete('/topics/:id', documentController.deleteDocumentTopic);

// Tags
router.get('/tags', documentController.getAllTags);


export default router;