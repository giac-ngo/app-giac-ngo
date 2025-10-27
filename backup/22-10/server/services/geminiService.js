

import { GoogleGenAI } from "@google/genai";
import { db } from '../db.js';
import { fileParserService } from './fileParserService.js';

const toGeminiContent = (messages) => {
    const firstUserMessageIndex = messages.findIndex(m => m.sender === 'user');
    if (firstUserMessageIndex === -1) return [];

    const conversationMessages = messages.slice(firstUserMessageIndex);

    return conversationMessages.map(msg => {
        const parts = [];
        parts.push({ text: msg.text || '' });

        if (msg.imageUrl && msg.sender === 'user') {
            try {
                const [meta, base64Data] = msg.imageUrl.split(',');
                if (meta && base64Data) {
                    const mimeTypeMatch = meta.match(/:(.*?);/);
                    if (mimeTypeMatch && mimeTypeMatch[1]) {
                        const mimeType = mimeTypeMatch[1];
                        parts.push({
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Data
                            }
                        });
                    }
                }
            } catch (e) {
                console.error("Error parsing image data URL:", e);
            }
        }

        return {
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: parts
        };
    });
};


export const geminiService = {
    sendMessageStream: async (aiConfig, history, apiKey, callbacks) => {
        try {
            if (!apiKey) {
                throw new Error("Lỗi cấu hình: API Key cho Gemini chưa được cung cấp.");
            }
            
            // --- Fetch and prepare additional training data ---
            let additionalTrainingText = '';
            if (typeof aiConfig.id === 'number') {
                const trainingData = await db.getTrainingDataByAiId(aiConfig.id);
                for (const source of trainingData) {
                    if (source.type === 'qa' && source.question && source.answer) {
                        additionalTrainingText += `Q: ${source.question}\nA: ${source.answer}\n\n`;
                    } else if (source.type === 'file' && source.fileUrl && source.fileName) {
                        const fileContent = await fileParserService.extractText(source.fileUrl, source.fileName);
                        if (fileContent) {
                            additionalTrainingText += `--- START OF DOCUMENT: ${source.fileName} ---\n${fileContent}\n--- END OF DOCUMENT ---\n\n`;
                        }
                    }
                }
            }
            // --- End of training data preparation ---
            
            const ai = new GoogleGenAI({ apiKey });
            
            const fullTrainingContent = [aiConfig.trainingContent, additionalTrainingText.trim()].filter(Boolean).join('\n\n');
            const systemInstruction = fullTrainingContent || undefined;
            const contents = toGeminiContent(history);
            
            if (contents.length === 0) {
                 callbacks.onError(new Error("Vui lòng nhập tin nhắn để bắt đầu cuộc trò chuyện."));
                 return;
            }

            const modelToUse = aiConfig.fineTunedModelId || aiConfig.modelName || "gemini-2.5-flash";

            const result = await ai.models.generateContentStream({
                model: modelToUse,
                contents: contents,
                config: {
                    systemInstruction: systemInstruction,
                },
            });
            
            let fullResponseText = '';
            for await (const chunk of result) {
                const chunkText = chunk.text;
                if (chunkText) {
                    fullResponseText += chunkText;
                    callbacks.onChunk(chunkText);
                }
            }
            
            callbacks.onEnd(fullResponseText);

        } catch (error) {
            console.error("Error calling Gemini Stream API:", error);
            callbacks.onError(error);
        }
    }
};