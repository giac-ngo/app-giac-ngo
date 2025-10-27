// server/services/gptService.js
import fetch from 'node-fetch';
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

const callOpenAI = async (messages, apiKey, model, stream, response_format) => {
     const body = {
        model: model,
        messages: messages,
        stream: stream,
    };

    if (response_format) {
        body.response_format = response_format;
    }
    
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
        
        const additionalTrainingText = await fileParserService.prepareAdditionalTrainingText(aiConfig);
        const systemPrompt = [aiConfig.trainingContent, additionalTrainingText].filter(Boolean).join('\n\n') || "";
        const messages = toGptMessages(history, systemPrompt);
        const model = aiConfig.modelName || 'gpt-4o';
        
        try {
            const response = await callOpenAI(messages, apiKey, model, true);

            if (!response.body) {
                throw new Error('No response body received from OpenAI API.');
            }

            let fullResponseText = '';
            let buffer = '';

            for await (const chunk of response.body) {
                buffer += chunk.toString('utf8');
                
                let eolIndex;
                // Process all full lines in the buffer
                while ((eolIndex = buffer.indexOf('\n')) >= 0) {
                    const line = buffer.slice(0, eolIndex).trim();
                    buffer = buffer.slice(eolIndex + 1);

                    if (line.startsWith('data: ')) {
                        const data = line.substring(6);
                        if (data === '[DONE]') {
                            continue;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content || '';
                            if (content) {
                                fullResponseText += content;
                                callbacks.onChunk(content);
                            }
                        } catch (error) {
                            console.error("Failed to parse OpenAI stream chunk:", data, error);
                        }
                    }
                }
            }
            
            callbacks.onEnd(fullResponseText);

        } catch (error) {
            console.error("Error in GPT Stream service:", error);
            callbacks.onError(error);
        }
    },
    
    translateConfig: async (aiConfig, targetLanguage, apiKey) => {
        const languageName = targetLanguage === 'en' ? 'English' : 'Vietnamese';
        const dataToTranslate = {
            name: aiConfig.name,
            description: aiConfig.description,
            suggestedQuestions: aiConfig.suggestedQuestions,
        };

        const systemPrompt = `You are a translation assistant. Your task is to translate the provided JSON object into ${languageName}.
        The JSON object has three fields: "name", "description", and "suggestedQuestions" (an array of strings).
        You must translate the text content of all fields.
        Your response MUST be a valid JSON object with the exact same structure. Do not add any other text, explanations, or markdown formatting.`;

        const userPrompt = JSON.stringify(dataToTranslate);

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        const model = 'gpt-4o'; 

        try {
            const response = await callOpenAI(messages, apiKey, model, false, { type: "json_object" });
            const jsonResponse = await response.json();
            const translatedText = jsonResponse.choices[0]?.message?.content;
            
            if (!translatedText) {
                throw new Error('No translated content returned from OpenAI.');
            }
            
            return JSON.parse(translatedText);
        } catch (e) {
            console.error('Failed to parse translated JSON from GPT:', e.message);
            throw new Error('Could not parse translation response from AI.');
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