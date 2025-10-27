// client/src/services/apiService.ts

import { User, AIConfig, SystemConfig, Conversation, Message, ModelType, PricingPlan, Transaction, Role, DashboardStats } from '../types';

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
    onEnd: (conversationId: number, newCoinCount: number | undefined, fullResponse: string) => void;
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

    // System Config
    getSystemConfig: (): Promise<SystemConfig> => {
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
    trainAi: (aiId: number, content: string): Promise<void> => {
        return fetch(`/api/ai-configs/${aiId}/train`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        }).then(handleResponse);
    },

    // Conversations
    getConversations: (user: User): Promise<Conversation[]> => {
        return fetch(`/api/conversations?userId=${user.id}`).then(handleResponse);
    },
    getAllConversations: (user: User): Promise<Conversation[]> => {
        return fetch('/api/conversations/all').then(handleResponse);
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
        try {
            const response = await fetch('/api/chat/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aiConfig, messages, user, conversationId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Streaming request failed');
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error("Failed to get response reader");

            const decoder = new TextDecoder();
            let finalConversationId = conversationId;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const rawData = decoder.decode(value);
                const chunks = rawData.split('data: ').filter(Boolean);

                for (const chunk of chunks) {
                    try {
                        const data = JSON.parse(chunk.trim());
                        if (data.text) {
                            callbacks.onChunk(data.text);
                            fullResponseText += data.text;
                        }
                        if (data.conversationId) finalConversationId = data.conversationId;
                        if (data.error) {
                            callbacks.onError(data.error);
                            return;
                        }
                        if (data.done) {
                            callbacks.onEnd(finalConversationId!, data.newCoinCount, fullResponseText);
                            return;
                        }
                    } catch (e) {
                        console.error("Failed to parse stream chunk:", chunk);
                    }
                }
            }
        } catch (error: any) {
            console.error("Error in sendMessageStream:", error);
            callbacks.onError(error.message || "An unknown streaming error occurred.");
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
    initiateCoinPurchase: (userId: number, coins: number, crypto: 'USDT' | 'USDC' | 'ETH'): Promise<{ paymentAddress: string, amount: string, currency: string, transactionId: string }> => {
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
};

export { apiService };