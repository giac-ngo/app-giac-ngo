// server/services/geminiService.js
import { GoogleGenAI } from "@google/genai";

const toGeminiContent = (messages) => {
    const firstUserMessageIndex = messages.findIndex(m => m.sender === 'user');
    if (firstUserMessageIndex === -1) return [];

    const conversationMessages = messages.slice(firstUserMessageIndex);

    return conversationMessages.map(msg => {
        const parts = [];
        // Ensure text is always present, even if empty, as the first part.
        parts.push({ text: msg.text || '' });

        if (msg.imageUrl && msg.sender === 'user') {
            try {
                // imageUrl is a data URL like "data:image/jpeg;base64,..."
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
                // Don't add a broken image part
            }
        }

        return {
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: parts
        };
    });
};


export const geminiService = {
    sendMessage: async (aiConfig, history, apiKey) => {
       // This is now deprecated in favor of sendMessageStream
       throw new Error("sendMessage is deprecated. Use sendMessageStream instead.");
    },

    sendMessageStream: async (aiConfig, history, apiKey, callbacks) => {
        try {
            if (!apiKey) {
                throw new Error("Lỗi cấu hình: API Key cho Gemini chưa được cung cấp.");
            }
            
            const ai = new GoogleGenAI({ apiKey });
            
            const systemInstruction = [aiConfig.trainingContent, aiConfig.additionalTrainingContent].filter(Boolean).join('\n\n');
            const contents = toGeminiContent(history);
            
            if (contents.length === 0) {
                 callbacks.onError(new Error("Vui lòng nhập tin nhắn để bắt đầu cuộc trò chuyện."));
                 return;
            }

            const modelToUse = aiConfig.modelName || "gemini-2.5-flash";

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