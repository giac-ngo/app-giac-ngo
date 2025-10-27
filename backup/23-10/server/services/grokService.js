
// This is a mock implementation since Grok's API details might vary.
// It simulates a streaming response.

export const grokService = {
    sendMessageStream: async (aiConfig, history, apiKey, callbacks) => {
        try {
            const mockResponse = "Đây là một câu trả lời mẫu từ Grok. Grok được biết đến với tính cách hài hước và đôi khi nổi loạn, không ngại đi sâu vào các chủ đề gai góc. Dịch vụ này được phát triển bởi xAI.";
            const words = mockResponse.split(' ');
            let fullResponseText = '';

            for (let i = 0; i < words.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network latency
                const chunk = words[i] + ' ';
                fullResponseText += chunk;
                callbacks.onChunk(chunk);
            }

            callbacks.onEnd(fullResponseText.trim());
        } catch (error) {
            callbacks.onError(error);
        }
    }
};
