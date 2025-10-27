

import { db } from '../db.js';
import { fileParserService } from './fileParserService.js';


const toGptMessages = (messages, systemPrompt) => {
    const gptMessages = [{ role: "system", content: systemPrompt }];
    messages.forEach(msg => {
        gptMessages.push({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        });
    });
    return gptMessages;
};

const callOpenAI = async (messages, apiKey, model, stream) => {
     const body = {
        model: model,
        messages: messages,
        stream: stream,
    };
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error("OpenAI API Error:", errorBody);
        throw new Error(errorBody.error.message || `OpenAI API request failed with status ${response.status}`);
    }
    
    return response;
};


export const gptService = {
    sendMessageStream: async (aiConfig, history, apiKey, callbacks) => {
        
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

        const systemPrompt = [aiConfig.trainingContent, additionalTrainingText.trim()].filter(Boolean).join('\n\n') || "";
        const messages = toGptMessages(history, systemPrompt);
        const model = aiConfig.modelName || 'gpt-4o';
        
        try {
            const response = await callOpenAI(messages, apiKey, model, true);
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponseText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));
                
                for (const line of lines) {
                    const data = line.replace(/^data: /, '');
                    if (data === '[DONE]') {
                        callbacks.onEnd(fullResponseText);
                        return;
                    }
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices[0]?.delta?.content || '';
                        if (content) {
                            fullResponseText += content;
                            callbacks.onChunk(content);
                        }
                    } catch (error) {
                       // Ignore parsing errors for incomplete JSON chunks
                    }
                }
            }
            callbacks.onEnd(fullResponseText);

        } catch (error) {
            console.error("Error in GPT Stream service:", error);
            callbacks.onError(error);
        }
    },
    
    listModels: async (apiKey) => {
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error.message);
            }
            const json = await response.json();
            return json.data
                .filter(model => model.id.includes('gpt'))
                .map(model => model.id);

        } catch (error) {
            console.error("Error listing OpenAI models:", error);
            throw error;
        }
    }
};