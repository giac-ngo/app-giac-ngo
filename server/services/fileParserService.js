
// server/services/fileParserService.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import xlsx from 'xlsx';
import { trainingDataModel } from '../models/trainingData.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Fix path: Go up two levels from services to reach project root.
const projectRoot = path.resolve(__dirname, '..', '..');

export const fileParserService = {
    async extractText(fileUrl, originalFileName) {
        // fileUrl is typically /uploads/filename.pdf
        // Construct absolute path based on project root
        // Remove leading slash if present to avoid path.join issues
        const cleanUrl = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
        const filePath = path.join(projectRoot, cleanUrl);
        const extension = path.extname(originalFileName).toLowerCase();
        
        try {
            const dataBuffer = await fs.readFile(filePath);

            if (extension === '.pdf') {
                const data = await pdf(dataBuffer);
                return data.text;
            } else if (extension === '.docx') {
                const { value } = await mammoth.extractRawText({ buffer: dataBuffer });
                return value;
            } else if (extension === '.txt') {
                return dataBuffer.toString('utf-8');
            } else if (['.xlsx', '.xls', '.csv'].includes(extension)) {
                const workbook = xlsx.read(dataBuffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                
                // Read as objects to find headers
                const jsonData = xlsx.utils.sheet_to_json(sheet);
                if (jsonData.length === 0) return '';

                // Detect Q&A columns (Case insensitive, supports VI/EN)
                const firstRowKeys = Object.keys(jsonData[0]);
                
                const questionKey = firstRowKeys.find(k => 
                    ['question', 'câu hỏi', 'hỏi', 'q', 'input', 'prompt', 'problem', 'vấn đề'].includes(k.toLowerCase().trim())
                );
                const answerKey = firstRowKeys.find(k => 
                    ['answer', 'trả lời', 'đáp', 'a', 'output', 'response', 'completion', 'giải pháp'].includes(k.toLowerCase().trim())
                );

                if (questionKey && answerKey) {
                    // Smart Q&A Formatting for LLM
                    return jsonData.map(row => {
                        const q = row[questionKey] || '';
                        const a = row[answerKey] || '';
                        // Adding "---" separator helps chunking later
                        return `Question: ${q}\nAnswer: ${a}`;
                    }).join('\n\n---\n\n');
                } else {
                    // Fallback: Generic table formatting
                    // Use header:1 to get array of arrays
                    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
                    return rows.map(row => {
                        return row.filter(cell => cell !== null && cell !== undefined).join(' | ');
                    }).join('\n');
                }

            } else if (extension === '.jsonl') {
                // Return file content as is
                return dataBuffer.toString('utf-8');
            }
        } catch (error) {
            console.error(`Error parsing file ${originalFileName} at ${filePath}:`, error);
            // Don't throw, just return empty string to allow process to continue
            return ''; 
        }
        return '';
    },

    async prepareAdditionalTrainingText(aiConfig) {
        if (!aiConfig || typeof aiConfig.id !== 'number') {
            return '';
        }

        const dataSources = await trainingDataModel.findByAiIdForChat(aiConfig.id);
        if (!dataSources || dataSources.length === 0) {
            return '';
        }
        
        const texts = [];
        for (const source of dataSources) {
            try {
                if (source.type === 'qa' && source.question && source.answer) {
                    texts.push(`Question: ${source.question}\nAnswer: ${source.answer}`);
                } else if (source.type === 'file' && source.fileUrl) {
                    // For uploaded files, prioritize summary. If not available, parse the full content.
                    // Note: RAG usually handles large files via vector search. 
                    // This function puts text directly into context window (good for summaries or small files).
                    const content = source.summary || await this.extractText(source.fileUrl, source.fileName);
                    if (content) {
                        texts.push(`--- Content from file: ${source.fileName} ---\n${content}`);
                    }
                } else if (source.type === 'document') {
                     // For linked library documents, prioritize summary, then full content.
                    const content = source.summary || source.answer; 
                     if (content) {
                        texts.push(`--- Content from document: ${source.fileName} ---\n${content}`);
                    }
                }
            } catch (error) {
                console.error(`Error processing training data source for AI ${aiConfig.id}:`, error);
            }
        }

        return texts.join('\n\n---\n\n');
    }
};
