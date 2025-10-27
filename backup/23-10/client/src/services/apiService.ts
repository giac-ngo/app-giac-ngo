// client/src/services/apiService.ts

import { User, AIConfig, SystemConfig, Conversation, Message, ModelType, PricingPlan, Transaction, Role, DashboardStats, TrainingDataSource } from '../types';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    if (response.status === 204) {
        return null;
    }
    return response.json();
};

interface StreamCallbacks {
    onChunk: (text: string) => void;
    onEnd: (conversationId?: number | null, fullResponse?: string) => void;
    onError: (message: string) => void;
}

const apiService = {
    // Dashboard
    getDashboardStats: (): Promise<DashboardStats> => {
        return fetch('/api/dashboard/stats').then(handleResponse);
    },

    // Auth
    login: (email: string, password: string): Promise<User> => {
        return fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        }).then(handleResponse);
    },
    register: (user: Partial<User> & { password?: string }): Promise<User> => {
        return fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        }).then(handleResponse);
    },


    // System Config
    getSystemConfig: (): Promise<SystemConfig | null> => {
        return fetch('/api/system-config').then(handleResponse);
    },
    updateSystemConfig: (config: SystemConfig): Promise<SystemConfig> => {
        return fetch('/api/system-config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
        }).then(handleResponse);
    },

    // AI Config
    // For ChatPage: Gets public AIs based on user's status
    getAiConfigs: (user: User | null): Promise<AIConfig[]> => {
        return fetch('/api/ai-configs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user }),
        }).then(handleResponse);
    },
     // For AdminPage: Gets manageable AIs based on user's role/ownership
    getManageableAiConfigs: (user: User): Promise<AIConfig[]> => {
        return fetch('/api/ai-configs/manageable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user }),
        }).then(handleResponse);
    },
    createAiConfig: (aiConfig: Partial<AIConfig>): Promise<AIConfig> => {
        return fetch('/api/ai-configs/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(aiConfig),
        }).then(handleResponse);
    },
    updateAiConfig: (aiConfig: AIConfig): Promise<AIConfig> => {
        return fetch(`/api/ai-configs/${aiConfig.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(aiConfig),
        }).then(handleResponse);
    },
    deleteAiConfig: (id: number | string): Promise<void> => {
        return fetch(`/api/ai-configs/${id}`, { method: 'DELETE' }).then(res => {
            if (!res.ok) throw new Error('Failed to delete AI config');
        });
    },
    translateAiConfig: (aiConfig: AIConfig, targetLanguage: 'vi' | 'en', user: User): Promise<Pick<AIConfig, 'name' | 'description' | 'suggestedQuestions'>> => {
        return fetch('/api/ai-configs/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aiConfig, targetLanguage, user }),
        }).then(handleResponse);
    },

    // Conversations
    getConversations: (user: User): Promise<Conversation[]> => {
        if (!user || typeof user.id !== 'number') {
            return Promise.resolve([]);
        }
        return fetch(`/api/conversations?userId=${user.id}`).then(handleResponse);
    },
    getLatestConversationForAI: (aiConfigId: number | string, user: User): Promise<Conversation | null> => {
        return fetch(`/api/ai-configs/${aiConfigId}/latest-conversation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user }),
        }).then(handleResponse);
    },
    getAllConversations: (_user: User): Promise<Conversation[]> => {
        return fetch('/api/conversations/all').then(handleResponse);
    },
    createConversation: (aiConfigId: number | string, messages: Message[], user: User): Promise<Conversation> => {
        return fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aiConfigId, messages, user }),
        }).then(handleResponse);
    },
    deleteConversation: (id: number): Promise<void> => {
        return fetch(`/api/conversations/${id}`, { method: 'DELETE' }).then(res => {
            if (!res.ok) throw new Error('Failed to delete conversation');
        });
    },
    updateConversationMessages: (id: number, messages: Message[]): Promise<any> => {
        return fetch(`/api/conversations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages }),
        }).then(handleResponse);
    },

    // Chat Streaming
    sendMessageStream: async (
        aiConfig: AIConfig,
        messages: Message[],
        user: User | null,
        conversationId: number | null,
        callbacks: StreamCallbacks
    ): Promise<void> => {
        let fullResponseText = '';
        let hasEnded = false; // Prevent double-calling onEnd

        try {
            const bodyPayload = { aiConfig, messages, user, conversationId };

            const response = await fetch('/api/chat/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload),
            });
            
            if (!response.ok || !response.body) {
                const errorText = await response.text().catch(() => `Streaming request failed with status ${response.status}`);
                throw new Error(errorText);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let finalConversationId: number | null = conversationId;

            const processBuffer = () => {
                // Event streams are separated by double newlines from the server.
                const events = buffer.split('\n\n');
                buffer = events.pop() || ''; // Keep the last, possibly partial, event

                for (const event of events) {
                    if (!event.startsWith('data: ')) continue;

                    const jsonStr = event.substring(6).trim();
                    if (!jsonStr) continue;

                    try {
                        const data = JSON.parse(jsonStr);

                        if (data.text) {
                            callbacks.onChunk(data.text);
                            fullResponseText += data.text;
                        }
                        if (data.conversationId) {
                            finalConversationId = data.conversationId;
                        }
                        if (data.error) {
                            callbacks.onError(data.error);
                            hasEnded = true;
                            return; // Stop processing
                        }
                        if (data.done && !hasEnded) {
                            callbacks.onEnd(finalConversationId, fullResponseText);
                            hasEnded = true;
                            return; // Stop processing
                        }
                    } catch (e) {
                        console.error("Failed to parse stream event:", jsonStr, e);
                    }
                }
            };

            while (!hasEnded) {
                const { done, value } = await reader.read();
                if (done) {
                    // Stream finished, process any remaining buffer
                    if (buffer) {
                        processBuffer();
                    }
                    break;
                }
                buffer += decoder.decode(value, { stream: true });
                processBuffer();
            }

            if (!hasEnded && fullResponseText) {
                callbacks.onEnd(finalConversationId, fullResponseText);
            }

        } catch (error: any) {
            console.error("Error in sendMessageStream:", error);
            if (!hasEnded) {
                callbacks.onError(error.message || "An unknown streaming error occurred.");
            }
        }
    },

    // Users
    getAllUsers: (): Promise<User[]> => fetch('/api/users').then(handleResponse),
    createUser: (user: Partial<User> & { password?: string }): Promise<User> => {
        return fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        }).then(handleResponse);
    },
    updateUser: (user: Partial<User>): Promise<User> => {
        return fetch(`/api/users/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        }).then(handleResponse);
    },
    deleteUser: (userId: number): Promise<void> => {
        return fetch(`/api/users/${userId}`, { method: 'DELETE' }).then(res => {
            if (!res.ok) throw new Error('Failed to delete user');
        });
    },
    regenerateApiToken: (userId: number): Promise<User> => {
        return fetch(`/api/users/${userId}/regenerate-token`, {
            method: 'POST',
        }).then(handleResponse);
    },

    // Roles (RBAC)
    getAllRoles: (): Promise<Role[]> => fetch('/api/roles').then(handleResponse),
    createRole: (role: Partial<Role>): Promise<Role> => {
        return fetch('/api/roles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(role),
        }).then(handleResponse);
    },
    updateRole: (role: Role): Promise<Role> => {
        return fetch(`/api/roles/${role.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(role),
        }).then(handleResponse);
    },
    deleteRole: (roleId: number | string): Promise<void> => {
        return fetch(`/api/roles/${roleId}`, { method: 'DELETE' }).then(handleResponse);
    },

    // Billing & Subscriptions
    getAllTransactions: (): Promise<Transaction[]> => fetch('/api/transactions').then(handleResponse),
    getTransactionsForUser: (userId: number): Promise<Transaction[]> => {
        return fetch(`/api/transactions/user/${userId}`).then(handleResponse);
    },
    addCoinsManually: (userId: number, coins: number, adminId: number): Promise<User> => {
        return fetch('/api/transactions/manual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, coins, adminId }),
        }).then(handleResponse);
    },
    purchaseSubscription: (userId: number, planId: number | string): Promise<User> => {
        return fetch('/api/subscriptions/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, planId }),
        }).then(handleResponse);
    },
     // Crypto Payments
    initiateCoinPurchase: (userId: number, coins: number, crypto: 'USDT' | 'USDC' | 'ETH'): Promise<{ paymentAddress: string, amount: string, transactionId: string }> => {
        return fetch('/api/crypto/initiate-coin-purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, coins, crypto }),
        }).then(handleResponse);
    },
    confirmCryptoPayment: (userId: number, transactionId: string): Promise<User> => {
        return fetch('/api/crypto/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, transactionId }),
        }).then(handleResponse);
    },
    
    // File Upload
    uploadFiles: (formData: FormData): Promise<{ filePaths: string[] }> => {
        return fetch('/api/upload', {
            method: 'POST',
            body: formData,
        }).then(handleResponse);
    },

    // Get available models
    getAvailableModels: (provider: ModelType, userId?: number): Promise<string[]> => {
        const url = userId ? `/api/models/${provider}?userId=${userId}` : `/api/models/${provider}`;
        return fetch(url).then(handleResponse);
    },
    
    // Pricing Plans
    getPricingPlans: (): Promise<PricingPlan[]> => fetch('/api/pricing-plans').then(handleResponse),
    createPricingPlan: (plan: Omit<PricingPlan, 'id' | 'coinCost' | 'durationDays'> & { coinCost: number, durationDays: number | null }): Promise<PricingPlan> => {
        return fetch('/api/pricing-plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(plan),
        }).then(handleResponse);
    },
    updatePricingPlan: (plan: PricingPlan): Promise<PricingPlan> => {
        return fetch(`/api/pricing-plans/${plan.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(plan),
        }).then(handleResponse);
    },
    deletePricingPlan: (id: number | string): Promise<void> => fetch(`/api/pricing-plans/${id}`, { method: 'DELETE' }).then(handleResponse),

    // Training Data Sources for a specific AI
    getTrainingDataForAI: (aiConfigId: number | string): Promise<TrainingDataSource[]> => {
        return fetch(`/api/ai-configs/${aiConfigId}/training-data`).then(handleResponse);
    },
    createTrainingDataSourceForAI: (aiConfigId: number | string, data: FormData): Promise<TrainingDataSource> => {
        return fetch(`/api/ai-configs/${aiConfigId}/training-data`, {
            method: 'POST',
            body: data,
        }).then(handleResponse);
    },
    createTrainingQaDataSource: (aiConfigId: number, question: string, answer: string): Promise<TrainingDataSource> => {
        const formData = new FormData();
        formData.append('type', 'qa');
        formData.append('question', question);
        formData.append('answer', answer);
        return fetch(`/api/ai-configs/${aiConfigId}/training-data`, {
            method: 'POST',
            body: formData,
        }).then(handleResponse);
    },
    deleteTrainingDataSource: (id: number): Promise<void> => {
        return fetch(`/api/training-data/${id}`, { method: 'DELETE' }).then(handleResponse);
    },
};

export { apiService };