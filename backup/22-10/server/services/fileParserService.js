// server/services/fileParserService.js
import fs from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const fileParserService = {
    async extractText(fileUrl, fileName) {
        const filePath = path.join(__dirname, '..', fileUrl);
        const extension = path.extname(fileName).toLowerCase();

        try {
            if (extension === '.docx') {
                const result = await mammoth.extractRawText({ path: filePath });
                return result.value;
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
    }
};
