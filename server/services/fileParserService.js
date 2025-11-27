// server/services/fileParserService.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { trainingDataModel } from '../models/trainingData.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const fileParserService = {
    async extractText(fileUrl, originalFileName) {
        // fileUrl is relative like /uploads/filename.pdf
        const filePath = path.join(__dirname, '..', fileUrl);
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
            }
            // Note: .doc is not easily supported in Node.js without external dependencies like LibreOffice.
            // .xlsx can be added here using a library like 'xlsx' if needed.
        } catch (error) {
            console.error(`Error parsing file ${originalFileName} at ${filePath}:`, error);
            throw new Error(`Could not parse file: ${originalFileName}`);
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
                    const content = source.summary || await this.extractText(source.fileUrl, source.fileName);
                    if (content) {
                        texts.push(`--- Content from file: ${source.fileName} ---\n${content}`);
                    }
                } else if (source.type === 'document') {
                     // For linked library documents, prioritize summary, then full content.
                     // The `answer` field from the getTrainingDataByAiIdForChat query holds the full content.
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