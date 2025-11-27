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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.join(__filename, '..'));
const uploadsDir = path.join(__dirname, 'uploads');

const trainingDataStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

export const trainingDataController = {
    upload: multer({ storage: trainingDataStorage }),

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
        try {
            const aiConfig = await aiConfigModel.findById(aiId);
            if (!aiConfig) return res.status(404).json({ message: 'AI Config not found.' });

            const owner = await userModel.findById(aiConfig.ownerId);
            let newSourceData = { aiConfigId: aiId, type };

            if (type === 'file') {
                if (!req.file) return res.status(400).json({ message: 'File is required.' });
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

            const createdSource = await trainingDataModel.create(newSourceData);

            if (type === 'file') {
                const apiKey = owner?.apiKeys?.[aiConfig.modelType];
                if (apiKey) {
                    (async () => {
                        try {
                            const text = await fileParserService.extractText(createdSource.fileUrl, createdSource.fileName);
                            if (!text?.trim()) return;
                            
                            const service = aiConfig.modelType === 'gemini' ? geminiService : gptService;
                            const summary = await service.summarizeText(text, apiKey);
                            
                            if (summary) {
                                await trainingDataModel.updateSummary(createdSource.id, summary);
                            }
                        } catch (e) { console.error(`Failed to summarize file for source ${createdSource.id}:`, e); }
                    })();
                }
            }
            res.status(201).json(createdSource);
        } catch (error) {
            if (req.file) try { await fs.unlink(req.file.path); } catch(e) {}
            res.status(500).json({ message: 'Failed to create training data source.' });
        }
    },
    
    async generateSummaryForDataSource(req, res) {
        const sourceId = parseInt(req.params.id, 10);
        try {
            const source = (await trainingDataModel.findByAiId(0)).find(s => s.id === sourceId) // A bit hacky way to find a single source by ID
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
            if (!text?.trim()) return res.status(400).json({ message: 'File is empty.' });
            
            const service = aiConfig.modelType === 'gemini' ? geminiService : gptService;
            const summary = await service.summarizeText(text, apiKey);
            if (!summary) throw new Error('Failed to generate summary.');

            const updatedSource = await trainingDataModel.updateSummary(source.id, summary);
            res.json(updatedSource);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Failed to generate summary.' });
        }
    },

    async deleteTrainingDataSource(req, res) {
        try {
            const sourceId = parseInt(req.params.id, 10);
            const source = await trainingDataModel.delete(sourceId); // Get source info before deleting
            if (!source) return res.status(404).json({ message: 'Training data source not found.' });

            const aiConfig = await aiConfigModel.findById(source.ai_config_id);
            if (aiConfig) {
                const owner = await userModel.findById(aiConfig.ownerId);
                if (owner?.apiKeys?.[aiConfig.modelType]) {
                    weaviateService.deleteDataBySourceId(aiConfig.modelType, source.id, source.type, owner.apiKeys[aiConfig.modelType])
                        .catch(err => console.error(`Weaviate cleanup failed:`, err));
                }
            }

            if (source.type === 'file' && source.file_url) {
                try { await fs.unlink(path.join(__dirname, source.file_url)); } catch (e) {}
            }
            
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete training data source.' });
        }
    },
    
    async deleteTrainingQaDataSource(req, res) {
        const { aiConfigId, question, answer } = req.body;
        try {
            const deletedSource = await trainingDataModel.deleteByContent(aiConfigId, question, answer);
            if (deletedSource) {
                 const aiConfig = await aiConfigModel.findById(deletedSource.ai_config_id);
                 if (aiConfig) {
                    const owner = await userModel.findById(aiConfig.ownerId);
                    if (owner?.apiKeys?.[aiConfig.modelType]) {
                        weaviateService.deleteDataBySourceId(aiConfig.modelType, deletedSource.id, 'qa', owner.apiKeys[aiConfig.modelType])
                            .catch(err => console.error(`Weaviate cleanup failed:`, err));
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