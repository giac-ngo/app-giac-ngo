// server/services/fileParserService.js
import fs from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';
import xlsx from 'xlsx';
import pdf from 'pdf-parse';
import { fileURLToPath } from 'url';
import { db } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MAX_FILE_CONTENT_LENGTH = 15000; // Approx 4k tokens

export const fileParserService = {
    async extractText(fileUrl, fileName) {
        const filePath = path.join(__dirname, '..', fileUrl);
        const extension = path.extname(fileName).toLowerCase();

        try {
            if (extension === '.docx') {
                const result = await mammoth.extractRawText({ path: filePath });
                return result.value;
            } else if (extension === '.pdf') {
                const dataBuffer = await fs.readFile(filePath);
                const data = await pdf(dataBuffer);
                return data.text;
            } else if (extension === '.xlsx' || extension === '.xls') {
                const workbook = xlsx.readFile(filePath);
                let fullText = '';
                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    // Use { raw: false } to get formatted text, which is often cleaner
                    const sheetText = xlsx.utils.sheet_to_txt(worksheet, { raw: false });
                    fullText += `--- Sheet: ${sheetName} ---\n${sheetText}\n\n`;
                });
                return fullText.trim();
            } else if (['.txt', '.md', '.json', '.csv'].includes(extension)) {
                return await fs.readFile(filePath, 'utf-8');
            } else {
                console.warn(`Unsupported file type for training: ${fileName}. Skipping.`);
                return null;
            }
        } catch (error) {
            console.error(`Error processing file ${fileName}:`, error);
            return null;
        }
    },

    async prepareAdditionalTrainingText(aiConfig) {
        let additionalTrainingText = '';
        if (typeof aiConfig.id !== 'number') {
          return '';
        }
    
        try {
          const trainingData = await db.getTrainingDataByAiIdForChat(aiConfig.id);
          for (const source of trainingData) {
            if (source.type === 'qa' && source.question && source.answer) {
              additionalTrainingText += `Q: ${source.question}\nA: ${source.answer}\n\n`;
            } else if (source.type === 'file' && source.fileUrl && source.fileName) {
              let fileContent = await this.extractText(source.fileUrl, source.fileName);
              if (fileContent) {
                if (fileContent.length > MAX_FILE_CONTENT_LENGTH) {
                  fileContent = fileContent.substring(0, MAX_FILE_CONTENT_LENGTH) + "\n... (content truncated)";
                }
                additionalTrainingText += `--- START OF DOCUMENT: ${source.fileName} ---\n${fileContent}\n--- END OF DOCUMENT ---\n\n`;
              }
            }
          }
        } catch (error) {
          console.error("Error preparing training context:", error);
          // Return empty string on error to not break chat functionality
          return '';
        }
    
        return additionalTrainingText.trim();
      }
};