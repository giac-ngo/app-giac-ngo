// server/services/gptService.js

// Mock implementation as we don't have the real GPT library
// In a real implementation, you would use the 'openai' package.

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
        const systemPrompt = [aiConfig.trainingContent, aiConfig.additionalTrainingContent].filter(Boolean).join('\n\n');
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
                       // console.error('Error parsing stream data chunk:', data);
                    }
                }
            }
            // Fallback in case [DONE] is missed
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
            // Filter for relevant models and extract IDs
            return json.data
                .filter(model => model.id.includes('gpt'))
                .map(model => model.id);

        } catch (error) {
            console.error("Error listing OpenAI models:", error);
            throw error;
        }
    }
};
