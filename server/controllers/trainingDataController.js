
// server/controllers/trainingDataController.js
import { trainingDataModel } from '../models/trainingData.model.js';
import { aiConfigModel } from '../models/aiConfig.model.js';
import { userModel } from '../models/user.model.js';
import { fileParserService } from '../services/fileParserService.js';
import { geminiService } from '../services/geminiService.js';
import { gptService } from '../services/gptService.js';
import weaviateService from '../services/weaviateService.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { pool } from '../db.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Fix path: Go up two levels from controllers to reach project root, then into uploads
const projectRoot = path.resolve(__dirname, '..', '..');
const uploadsDir = path.join(projectRoot, 'uploads');

// Ensure uploads directory exists
(async () => {
    try {
        await fs.mkdir(uploadsDir, { recursive: true });
    } catch (e) {
        console.error("Could not create uploads directory:", e);
    }
})();

const trainingDataStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        // Sanitize filename to prevent issues
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + safeName);
    },
});

export const trainingDataController = {
    upload: multer({ 
        storage: trainingDataStorage,
        limits: { fileSize: 50 * 1024 * 1024 } // Limit to 50MB
    }),

    async getTrainingDataForAI(req, res) {
        try {
            const aiId = parseInt(req.params.id, 10);
            if (isNaN(aiId)) return res.status(400).json({ message: 'Invalid AI ID.' });
            
            const data = await trainingDataModel.findByAiId(aiId);
            res.setHeader('Cache-Control', 'no-store');
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch training data.' });
        }
    },
    
    async createTrainingDataSourceForAI(req, res) {
        const aiId = parseInt(req.params.id, 10);
        const { type, question, answer, thought } = req.body;
        
        // Path to clean up in case of error (if file was uploaded)
        let uploadedFilePath = req.file ? req.file.path : null;

        try {
            const aiConfig = await aiConfigModel.findById(aiId);
            if (!aiConfig) {
                 if (uploadedFilePath) await fs.unlink(uploadedFilePath).catch(() => {});
                 return res.status(404).json({ message: 'AI Config not found.' });
            }

            const owner = await userModel.findById(aiConfig.ownerId);
            let newSourceData = { aiConfigId: aiId, type };

            if (type === 'file') {
                if (!req.file) return res.status(400).json({ message: 'File is required.' });

                // Treat ALL uploaded files as 'file' type sources, 
                // regardless of extension (Excel, JSONL, PDF, etc.)
                newSourceData.fileUrl = `/uploads/${req.file.filename}`;
                newSourceData.fileName = req.file.originalname;

            } else if (type === 'qa') {
                if (!question || !answer) return res.status(400).json({ message: 'Question and Answer are required.' });
                newSourceData.question = question;
                newSourceData.answer = answer;
                newSourceData.thought = thought;
            } else {
                return res.status(400).json({ message: 'Invalid training data type.' });
            }

            // Create DB Entry
            const createdSource = await trainingDataModel.create(newSourceData);

            // Respond to client IMMEDIATELY to prevent timeout
            res.status(201).json(createdSource);

            // Process content extraction and summarization in background
            if (type === 'file') {
                const apiKey = owner?.apiKeys?.[aiConfig.modelType];
                // We proceed even without apiKey to at least extract text for Weaviate if needed later
                (async () => {
                    try {
                        // Extract text from file (supports PDF, DOCX, TXT, XLSX, CSV, JSONL)
                        const text = await fileParserService.extractText(createdSource.fileUrl, createdSource.fileName);
                        
                        if (text?.trim() && apiKey) {
                            const service = aiConfig.modelType === 'gemini' ? geminiService : gptService;
                            const summary = await service.summarizeText(text, apiKey);
                            if (summary) {
                                await trainingDataModel.updateSummary(createdSource.id, summary);
                            }
                        }
                    } catch (e) { 
                        console.error(`Background processing failed for source ${createdSource.id}:`, e); 
                    }
                })();
            }

        } catch (error) {
            console.error("Error in createTrainingDataSourceForAI:", error);
            if (uploadedFilePath) {
                try { await fs.unlink(uploadedFilePath); } catch(e) {}
            }
            if (!res.headersSent) {
                res.status(500).json({ message: 'Failed to create training data source: ' + error.message });
            }
        }
    },
    
    async generateSummaryForDataSource(req, res) {
        const sourceId = parseInt(req.params.id, 10);
        try {
            // Find specific source without getting all data
            const queryRes = await pool.query('SELECT * FROM training_data_sources WHERE id = $1', [sourceId]);
            const source = queryRes.rows[0] ? mapRowToCamelCase(queryRes.rows[0]) : null;

            if (!source || source.type !== 'file') {
                return res.status(404).json({ message: 'File training data source not found.' });
            }
            if (source.summary) return res.json(source);

            const aiConfig = await aiConfigModel.findById(source.aiConfigId);
            if (!aiConfig) return res.status(404).json({ message: 'Associated AI config not found.' });
            
            const owner = await userModel.findById(aiConfig.ownerId);
            const apiKey = owner?.apiKeys?.[aiConfig.modelType];
            if (!apiKey) return res.status(400).json({ message: `Owner's API key not set.` });
            
            const text = await fileParserService.extractText(source.fileUrl, source.fileName);
            if (!text?.trim()) return res.status(400).json({ message: 'File is empty or text could not be extracted.' });
            
            const service = aiConfig.modelType === 'gemini' ? geminiService : gptService;
            const summary = await service.summarizeText(text, apiKey);
            if (!summary) throw new Error('Failed to generate summary from AI provider.');

            const updatedSource = await trainingDataModel.updateSummary(source.id, summary);
            res.json(updatedSource);
        } catch (error) {
            console.error("Summary generation error:", error);
            res.status(500).json({ message: error.message || 'Failed to generate summary.' });
        }
    },

    async deleteTrainingDataSource(req, res) {
        try {
            const sourceId = parseInt(req.params.id, 10);
            // Get source info before deleting to know which providers indexed it
            const sourceToDelete = await trainingDataModel.delete(sourceId); 
            
            if (!sourceToDelete) return res.status(404).json({ message: 'Training data source not found.' });

            // Clean up Weaviate for ALL providers that have indexed this file
            const aiConfig = await aiConfigModel.findById(sourceToDelete.aiConfigId);
            if (aiConfig) {
                const owner = await userModel.findById(aiConfig.ownerId);
                
                // Iterate through all providers (gpt, gemini, etc.) that have this file indexed
                if (sourceToDelete.indexedProviders && Array.isArray(sourceToDelete.indexedProviders)) {
                    for (const provider of sourceToDelete.indexedProviders) {
                        const providerKey = owner?.apiKeys?.[provider];
                        // We try to delete even if key is missing (service might handle it or just log error)
                        // Ideally we need key to init client with headers
                        if (providerKey) {
                             await weaviateService.deleteDataBySourceId(provider, sourceToDelete.id, sourceToDelete.type, providerKey)
                                .catch(err => console.error(`Weaviate cleanup failed for provider ${provider}:`, err.message));
                        }
                    }
                }
            }

            // Clean up physical file
            if (sourceToDelete.type === 'file' && sourceToDelete.fileUrl) {
                // Construct absolute path using project root
                // fileUrl is like "/uploads/..."
                const absolutePath = path.join(projectRoot, sourceToDelete.fileUrl);
                try { 
                    await fs.unlink(absolutePath); 
                } catch (e) {
                    console.warn(`Failed to delete file from disk: ${absolutePath}`, e.message);
                }
            }
            
            res.status(204).send();
        } catch (error) {
            console.error('Delete error:', error);
            res.status(500).json({ message: 'Failed to delete training data source.' });
        }
    },
    
    async deleteTrainingQaDataSource(req, res) {
        const { aiConfigId, question, answer } = req.body;
        try {
            const deletedSource = await trainingDataModel.deleteByContent(aiConfigId, question, answer);
            if (deletedSource) {
                 const aiConfig = await aiConfigModel.findById(deletedSource.aiConfigId);
                 if (aiConfig) {
                    const owner = await userModel.findById(aiConfig.ownerId);
                    
                    // Same logic: iterate through all indexed providers
                    if (deletedSource.indexedProviders && Array.isArray(deletedSource.indexedProviders)) {
                        for (const provider of deletedSource.indexedProviders) {
                            const providerKey = owner?.apiKeys?.[provider];
                            if (providerKey) {
                                await weaviateService.deleteDataBySourceId(provider, deletedSource.id, 'qa', providerKey)
                                    .catch(err => console.error(`Weaviate cleanup failed for provider ${provider}:`, err.message));
                            }
                        }
                    }
                }
            }
            res.status(200).json({ message: 'Training data source deleted.' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete training data.' });
        }
    },

    async getAllQaTrainingData(req, res) {
        try {
            res.json(await trainingDataModel.findAllQaData());
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch QA training data.' });
        }
    },
    
    async exportQaDataForFinetune(req, res) {
        try {
            const { sourcesToExport } = req.body;
            if (!Array.isArray(sourcesToExport) || sourcesToExport.length === 0) {
                return res.status(400).json({ message: 'No sources provided for export.' });
            }
            
            const jsonlLines = sourcesToExport.map(source => {
                let assistantContent = source.answer;
                if (source.thought) {
                    assistantContent = `<thought>${source.thought}</thought>\n${source.answer}`;
                }
                return JSON.stringify({
                    messages: [
                        { role: 'user', content: source.question },
                        { role: 'assistant', content: assistantContent }
                    ]
                });
            });

            await trainingDataModel.markAsExported(sourcesToExport.map(s => s.id));
            
            const fileName = `finetune_data_${new Date().toISOString().split('T')[0]}.jsonl`;
            res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
            res.setHeader('Content-type', 'application/jsonl');
            res.send(jsonlLines.join('\n'));
        } catch (error) {
            res.status(500).json({ message: 'Failed to export QA training data.' });
        }
    }
};
