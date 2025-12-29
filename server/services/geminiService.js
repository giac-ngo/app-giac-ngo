// server/services/geminiService.js
import { GoogleGenAI, Type } from "@google/genai";
import { fileParserService } from './fileParserService.js';

// ==========================
// Convert conversation to Gemini content format
// ==========================
const toGeminiContent = (messages) => {
    const firstUserMessageIndex = messages.findIndex(m => m.sender === 'user');
    if (firstUserMessageIndex === -1) return [];

    const conversationMessages = messages.slice(firstUserMessageIndex);
    if (conversationMessages.length === 0) return [];

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
                        currentParts.push({
                            inlineData: {
                                mimeType: mimeMatch[1],
                                data: base64Data
                            }
                        });
                    }
                }
            } catch (err) {
                console.error("Error parsing image data URL:", err);
            }
        }
    }

    flush();
    return contents;
};

// ==========================
// Gemini Service
// ==========================
export const geminiService = {
    // ---------- TTS Generation ----------
    generateTts: async (text, apiKey, model, voice) => {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: model, // e.g., "gemini-2.5-flash-preview-tts"
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: voice },
                    },
                },
            },
        });
        
        const audioContent = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!audioContent) {
            throw new Error('No audio content returned from Gemini TTS.');
        }
        return audioContent; // It's already base64
    },
    
    // ---------- OCR from Image ----------
    extractTextFromImage: async (imageBuffer, mimeType, apiKey) => {
        const ai = new GoogleGenAI({ apiKey });
        const model = "gemini-2.5-flash"; // Use flash for speed

        const imagePart = {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType,
            },
        };

        const prompt = "Extract all text from this image. Preserve the original formatting as much as possible, including line breaks and spacing.";

        const res = await ai.models.generateContent({
            model,
            contents: { parts: [imagePart, {text: prompt}] },
        });

        return res.text;
    },
    
    // ---------- Format Extracted Text ----------
    formatExtractedText: async (text, apiKey, modelName) => {
        const ai = new GoogleGenAI({ apiKey });
        const model = modelName || "gemini-2.5-flash";

        const prompt = `
Take the following raw text extracted from a document and format it into clean, readable HTML.
- Use appropriate heading tags (h1, h2, h3).
- Use paragraphs (<p>) for text blocks.
- Use lists (<ul>, <ol>, <li>) where appropriate.
- Preserve bold (**text**) and italic (*text*) formatting by converting them to <b> and <i> tags.
- Ensure the final output is only the HTML content, without any surrounding markdown fences or extra text.

Raw text:
---
${text}
---
Formatted HTML:
`;
        const res = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        
        // Clean up potential markdown code fences just in case
        return res.text.replace(/```html|```/g, "").trim();
    },

    // ---------- Summarize ----------
    summarizeText: async (text, apiKey) => {
        if (!apiKey) throw new Error("API Key for Gemini must be provided.");
        if (!text?.trim()) return null;

        const ai = new GoogleGenAI({ apiKey });
        const model = "gemini-2.5-flash";
        const prompt = `
Please summarize the following text concisely and clearly. The summary should be in the same language as the original text.
Focus on the key ideas, tone, and message.
Text:
---
${text}
---
Summary:`;

        try {
            const res = await ai.models.generateContent({
                model,
                contents: prompt,
            });
            return res.text;
        } catch (err) {
            console.error("Error during Gemini summarization:", err);
            return null;
        }
    },

    // ---------- Stream Chat ----------
    sendMessageStream: async (aiConfig, history, apiKey, callbacks, language, retrievedContext = '') => {
        try {
            if (!apiKey) throw new Error("Gemini API Key missing.");

            const additionalTrainingText = await fileParserService.prepareAdditionalTrainingText(aiConfig);
            const languageName = language === 'vi' ? 'Vietnamese' : 'English';

            // Simplified instructions - No more thought blocks
            const systemInstruction = [
                retrievedContext,
                aiConfig.trainingContent,
                additionalTrainingText,
                `**SYSTEM INSTRUCTION:** You are a helpful AI assistant. Respond in ${languageName}. Use Markdown for formatting.`
            ].filter(Boolean).join('\n\n---\n\n');

            const contents = toGeminiContent(history);
            if (contents.length === 0) {
                callbacks.onError(new Error("Please enter a message to start."));
                return;
            }

            const ai = new GoogleGenAI({ apiKey });
            const model = aiConfig.modelName || "gemini-2.5-flash";
            
            const geminiConfig = { 
                systemInstruction,
                maxOutputTokens: typeof aiConfig.maxOutputTokens === 'number' ? aiConfig.maxOutputTokens : 8192,
                temperature: 0.7,
            };

            const result = await ai.models.generateContentStream({
                model,
                contents,
                config: geminiConfig
            });

            let fullResponseText = '';
            for await (const chunk of result) {
                const chunkText = chunk.text;
                if (chunkText) {
                    fullResponseText += chunkText;
                    callbacks.onChunk(chunkText);
                }
            }

            // No thought parsing needed
            callbacks.onEnd({ text: fullResponseText.trim(), thought: null });

        } catch (err) {
            console.error("Error calling Gemini Stream API:", err);
            callbacks.onError(err);
        }
    },
    
    // ---------- Translate (single text) ----------
    translateText: async (text, targetLanguage, apiKey, modelName, contextPrompt) => {
        const messages = [{ text }];
        const translatedMessages = await geminiService.translateMessages(messages, targetLanguage, apiKey, modelName, contextPrompt);
        return translatedMessages[0].text;
    },

    // ---------- Translate (batch) ----------
    translateMessages: async (messages, targetLanguage, apiKey, modelName, contextPrompt) => {
        const ai = new GoogleGenAI({ apiKey });
        const languageName = targetLanguage === 'en' ? 'English' : 'Vietnamese';
        const texts = messages.map(m => m.text || '');
        if (texts.every(t => !t.trim())) return messages;

        const data = { texts };
        const prompt = `
${contextPrompt ? `**CONTEXT FOR TRANSLATION STYLE:**\n${contextPrompt}\n\n` : ''}Translate each string in 'texts' into ${languageName}.
Return valid JSON: {"translatedTexts": ["..."]}, same order as input.
Input:
${JSON.stringify(data)}
`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                translatedTexts: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['translatedTexts']
        };

        try {
            const res = await ai.models.generateContent({
                model: modelName || 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: schema
                }
            });
            const parsed = JSON.parse(res.text);
            const translated = parsed.translatedTexts;
            if (translated.length !== messages.length) {
                throw new Error("Mismatch in number of translated messages.");
            }
            return messages.map((m, i) => ({ ...m, text: translated[i] }));
        } catch (err) {
            console.error("Gemini translation error:", err);
            throw new Error("Failed to translate with Gemini.");
        }
    }
};