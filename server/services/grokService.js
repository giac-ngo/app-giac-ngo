
// This is a mock implementation since Grok's API details might vary.
// It simulates a streaming response.

export const grokService = {
    sendMessageStream: async (aiConfig, history, apiKey, callbacks, language, retrievedContext = '') => {
        try {
            // Note: retrievedContext is ignored in this mock implementation
            const mockResponse = "<thought>Đây là luồng suy nghĩ mẫu từ Grok. Tôi sẽ trả lời một cách hài hước và có chút nổi loạn.</thought>Đây là một câu trả lời mẫu từ Grok. Grok được biết đến với tính cách hài hước và đôi khi nổi loạn, không ngại đi sâu vào các chủ đề gai góc. Dịch vụ này được phát triển bởi xAI.";
            const words = mockResponse.split(' ');
            let fullResponseText = '';

            for (let i = 0; i < words.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network latency
                const chunk = words[i] + ' ';
                fullResponseText += chunk;
                callbacks.onChunk(chunk);
            }

            const fullResponseTextTrimmed = fullResponseText.trim();
            let thought = null;
            let finalAnswer = fullResponseTextTrimmed;
            const thoughtMatch = fullResponseTextTrimmed.match(/<thought>([\s\S]*?)<\/thought>/);
            if (thoughtMatch && thoughtMatch[1]) {
                thought = thoughtMatch[1].trim();
                finalAnswer = fullResponseTextTrimmed.replace(/<thought>[\s\S]*?<\/thought>/, '').trim();
            }

            callbacks.onEnd({ text: finalAnswer, thought });
        } catch (error) {
            callbacks.onError(error);
        }
    }
};