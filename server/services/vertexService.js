
// server/services/vertexService.js
import { GoogleGenAI } from "@google/genai";
import { fileParserService } from './fileParserService.js';

/**
 * Chuyển đổi lịch sử tin nhắn sang định dạng nội dung của Gemini API.
 */
const toGeminiContent = (messages) => {
    const firstUserMessageIndex = messages.findIndex(m => m.sender === 'user');
    if (firstUserMessageIndex === -1) return [];

    const contents = [];
    let currentRole = null;
    let currentParts = [];
    
    const flush = () => {
        if (currentRole && currentParts.length > 0) {
            contents.push({ role: currentRole, parts: currentParts });
        }
    };

    for (const msg of messages.slice(firstUserMessageIndex)) {
        const role = msg.sender === 'user' ? 'user' : 'model';
        if (role !== currentRole) {
            flush();
            currentRole = role;
            currentParts = [];
        }
        if (msg.text) currentParts.push({ text: msg.text });
        if (msg.imageUrl && role === 'user') {
            try {
                const [meta, base64Data] = msg.imageUrl.split(',');
                if (meta && base64Data) {
                    const mimeMatch = meta.match(/:(.*?);/);
                    if (mimeMatch && mimeMatch[1]) {
                        currentParts.push({ inlineData: { mimeType: mimeMatch[1], data: base64Data } });
                    }
                }
            } catch (err) { 
                console.error("Lỗi khi xử lý dữ liệu ảnh cho Vertex:", err); 
            }
        }
    }
    flush();
    return contents;
};

export const vertexService = {
    async sendMessageStream(aiConfig, history, apiKey, callbacks, language, retrievedContext = '') {
        try {
            if (!apiKey) throw new Error("Vertex API Key (Cá nhân) bị thiếu. Vui lòng cấu hình trong phần cài đặt.");
            
            const additionalTrainingText = await fileParserService.prepareAdditionalTrainingText(aiConfig);
            const languageName = language === 'vi' ? 'Vietnamese' : 'English';

            const systemInstruction = [
                retrievedContext,
                aiConfig.trainingContent,
                additionalTrainingText,
                `**SYSTEM INSTRUCTION:** Bạn là một trợ lý AI cao cấp được triển khai trên Vertex AI. Phản hồi bằng ngôn ngữ: ${languageName}. Sử dụng Markdown để trình bày.`,
            ].filter(Boolean).join('\n\n---\n\n');

            const contents = toGeminiContent(history);
            if (contents.length === 0) return callbacks.onError(new Error("Lịch sử trò chuyện trống."));

            // Lấy modelResourceName từ cấu hình AI (e.g. projects/.../endpoints/...)
            const modelResourceName = aiConfig.modelName;
            if (!modelResourceName) throw new Error("Model Name (Resource Path) chưa được cấu hình cho AI này.");

            // Phân tích location từ resource name để xác định regional endpoint
            const locationMatch = modelResourceName.match(/locations\/([a-z0-9-]+)/);
            const location = locationMatch ? locationMatch[1] : 'us-central1';
            
            const ai = new GoogleGenAI({ 
                apiKey,
                baseUrl: `https://${location}-aiplatform.googleapis.com/v1`
            });

            /**
             * SDK mặc định chèn "/models/" vào sau baseUrl.
             * Dùng "../" để lùi lại 1 cấp URL, giúp gọi đúng endpoint tài nguyên Vertex.
             */
            const finalModelPath = `../${modelResourceName}`;

            const streamingResp = await ai.models.generateContentStream({
                model: finalModelPath,
                contents,
                config: { 
                    systemInstruction,
                    maxOutputTokens: aiConfig.maxOutputTokens || 65535,
                    temperature: 1,
                    topP: 0.95,
                    thinkingConfig: {
                        // Sử dụng giá trị từ aiConfig nếu có, nếu không mặc định -1 (hoặc 32768 tùy phiên bản SDK)
                        thinkingBudget: aiConfig.thinkingBudget !== undefined ? aiConfig.thinkingBudget : 32768
                    },
                    safetySettings: [
                        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }
                    ],
                    tools: [{ googleSearch: {} }]
                }
            });

            let fullResponseText = '';
            for await (const chunk of streamingResp) {
                const chunkText = chunk.text;
                if (chunkText) {
                    fullResponseText += chunkText;
                    callbacks.onChunk(chunkText);
                }
            }
            
            let thought = null;
            let finalAnswer = fullResponseText.trim();
            const thoughtMatch = fullResponseText.match(/<thought>([\s\S]*?)<\/thought>/);
            if (thoughtMatch) {
                thought = thoughtMatch[1].trim();
                finalAnswer = fullResponseText.replace(/<thought>[\s\S]*?<\/thought>/, '').trim();
            }

            callbacks.onEnd({ text: finalAnswer, thought });
        } catch (err) { 
            console.error("Vertex Service Stream Error:", err);
            callbacks.onError(err); 
        }
    }
};
