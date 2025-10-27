import { GoogleGenAI, Type } from "@google/genai";
import { fileParserService } from './fileParserService.js';

const toGeminiContent = (messages) => {
    // Start from the first user message to ignore any initial system/AI welcome messages
    const firstUserMessageIndex = messages.findIndex(m => m.sender === 'user');
    if (firstUserMessageIndex === -1) {
        return [];
    }
    const conversationMessages = messages.slice(firstUserMessageIndex);

    if (conversationMessages.length === 0) {
        return [];
    }

    const contents = [];
    let currentRole = null;
    let currentParts = [];

    const flush = () => {
        if (currentRole && currentParts.length > 0) {
            contents.push({ role: currentRole, parts: currentParts });
        }
    };

    for (const msg of conversationMessages) {
        const role = msg.sender === 'user' ? 'user' : 'model';

        // If role changes, flush the previous parts and start a new role.
        if (role !== currentRole) {
            flush();
            currentRole = role;
            currentParts = [];
        }

        // Add text part
        if (msg.text) {
            currentParts.push({ text: msg.text });
        }
        
        // Add image part for user messages
        if (msg.imageUrl && role === 'user') {
            try {
                const [meta, base64Data] = msg.imageUrl.split(',');
                if (meta && base64Data) {
                    const mimeTypeMatch = meta.match(/:(.*?);/);
                    if (mimeTypeMatch && mimeTypeMatch[1]) {
                        currentParts.push({
                            inlineData: {
                                mimeType: mimeTypeMatch[1],
                                data: base64Data
                            }
                        });
                    }
                }
            } catch (e) {
                console.error("Error parsing image data URL:", e);
            }
        }
    }
    
    // Push any remaining parts
    flush();

    return contents;
};


export const geminiService = {
    sendMessageStream: async (aiConfig, history, apiKey, callbacks) => {
        try {
            if (!apiKey) {
                throw new Error("Lỗi cấu hình: API Key cho Gemini chưa được cung cấp.");
            }
            
            const additionalTrainingText = await fileParserService.prepareAdditionalTrainingText(aiConfig);
            
            const ai = new GoogleGenAI({ apiKey });
            
            const fullTrainingContent = [aiConfig.trainingContent, additionalTrainingText].filter(Boolean).join('\n\n');
            const systemInstruction = fullTrainingContent || undefined;
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
    },

    translateConfig: async (aiConfig, targetLanguage, apiKey) => {
        const ai = new GoogleGenAI({ apiKey });
        const languageName = targetLanguage === 'en' ? 'English' : 'Vietnamese';

        const dataToTranslate = {
            name: aiConfig.name,
            description: aiConfig.description,
            suggestedQuestions: aiConfig.suggestedQuestions,
        };

        const prompt = `Translate the 'name' and 'description' fields, and each string in the 'suggestedQuestions' array into ${languageName}. Provide the output strictly as a JSON object with the keys "name", "description", and "suggestedQuestions". Do not include any other text or markdown formatting.

        Input JSON:
        ${JSON.stringify(dataToTranslate)}
        `;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            suggestedQuestions: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        },
                        required: ['name', 'description', 'suggestedQuestions']
                    }
                }
            });
            
            return JSON.parse(response.text);

        } catch (error) {
            console.error("Error calling Gemini for translation:", error);
            throw new Error("Failed to get translation from Gemini.");
        }
    },
};