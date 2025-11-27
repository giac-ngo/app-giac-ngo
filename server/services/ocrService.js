// server/services/ocrService.js
import { fileParserService } from './fileParserService.js';
import { geminiService } from './geminiService.js';
import { gptService } from './gptService.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export const ocrService = {
    async extractAndFormat(file, provider, model, apiKey) {
        if (!apiKey) {
            throw new Error(`API Key for ${provider.toUpperCase()} not found in your personal or system settings.`);
        }

        const mimeType = file.mimetype;
        let textContent = '';

        if (mimeType.startsWith('image/')) {
            if (provider !== 'gemini') {
                throw new Error(`OCR for images is currently only supported with Gemini. Please select a Gemini model.`);
            }
            textContent = await geminiService.extractTextFromImage(file.buffer, mimeType, apiKey);
        } else {
            // For other files (PDF, DOCX), write to a temp file to use fileParserService
            const tempFilePath = path.join(os.tmpdir(), `${Date.now()}-${file.originalname}`);
            try {
                await fs.writeFile(tempFilePath, file.buffer);
                // fileParserService expects a relative path from the server root, but it can also handle absolute paths.
                textContent = await fileParserService.extractText(tempFilePath, file.originalname);
            } finally {
                // Clean up the temporary file
                try {
                    await fs.unlink(tempFilePath);
                } catch (cleanupError) {
                    console.error("Failed to clean up temporary OCR file:", cleanupError);
                }
            }
        }

        if (!textContent || !textContent.trim()) {
            return '<i>(No text could be extracted from the document.)</i>';
        }

        // Now, format the extracted text using an AI model.
        if (provider === 'gemini') {
            return await geminiService.formatExtractedText(textContent, apiKey, model);
        } else if (provider === 'gpt') {
            return await gptService.formatExtractedText(textContent, apiKey, model);
        } else if (provider === 'grok') {
            // Grok service is a mock, so just do basic formatting.
            return `<p>${textContent.replace(/\n/g, '<br />')}</p>`;
        }

        throw new Error(`Unsupported provider for text formatting: ${provider}`);
    }
};