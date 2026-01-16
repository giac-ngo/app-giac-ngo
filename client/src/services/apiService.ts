// client/src/services/apiService.ts

import { User, AIConfig, SystemConfig, Conversation, Message, ModelType, PricingPlan, Transaction, Role, DashboardStats, TrainingDataSource, KoiiTask, Document, Tag, DocumentAuthor, DocumentType, DocumentTopic, SocialFeedPost, Comment, DocumentConfig, Space, DharmaTalk, WithdrawalRequest, SpaceOwnerData, SpaceType, MeditationSession } from '../types';

const getAuthToken = (): string | null => {
    try {
        const userStr = localStorage.getItem('user'); // Changed from sessionStorage to localStorage to be consistent with App.tsx
        if (userStr) {
            const user: User = JSON.parse(userStr);
            return user.apiToken || null;
        }
    } catch (e) {
        // ignore parsing error
    }
    return null;
};

const authedFetch = (url: RequestInfo, options?: RequestInit): Promise<Response> => {
    const token = getAuthToken();
    const headers = new Headers(options?.headers);
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    
    if (options?.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    return fetch(url, { ...options, headers });
};

const createSearchParams = (params: object): URLSearchParams => {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== undefined && value !== '') {
            searchParams.append(key, String(value));
        }
    }
    return searchParams;
};


const handleResponse = async (response: Response) => {
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            if (isJson) {
                const errorData = await response.json();
                errorMessage = errorData.message || JSON.stringify(errorData);
            } else {
                const errorText = await response.text();
                const titleMatch = errorText.match(/<title>(.*?)<\/title>/i);
                if (titleMatch && titleMatch[1]) {
                     errorMessage = titleMatch[1];
                } else {
                    errorMessage = errorText.length > 200 ? errorText.slice(0, 200) + '...' : errorText;
                }
            }
        } catch (e) {
            errorMessage = `HTTP error! status: ${response.status} and failed to parse error response.`;
        }
        throw new Error(errorMessage);
    }
    
    const text = await response.text();
    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch (e) {
        return text;
    }
};

interface StreamCallbacks {
    onChunk: (text: string) => void;
    onEnd: (conversationId?: number | null, updatedUser?: User | null, finalMessage?: { text: string; thought?: string | null }) => void;
    onError: (message: string) => void;
}

export const apiService = {
    getHomePageData: (): Promise<{ aiConfigs: AIConfig[], spaces: Space[], libraryRecommended: { topKe: Document[], topTruyen: Document[] }, socialFeed: SocialFeedPost[] }> => {
        return authedFetch('/api/homepage-data').then(handleResponse);
    },
    getAllDharmaTalks: (): Promise<DharmaTalk[]> => {
        return authedFetch('/api/dharma-talks').then(handleResponse);
    },
    createDharmaTalk: (formData: FormData): Promise<DharmaTalk> => {
        return authedFetch('/api/dharma-talks', {
            method: 'POST',
            body: formData,
        }).then(handleResponse);
    },
    updateDharmaTalk: (id: number, formData: FormData): Promise<DharmaTalk> => {
        return authedFetch(`/api/dharma-talks/${id}`, {
            method: 'PUT',
            body: formData,
        }).then(handleResponse);
    },
    deleteDharmaTalk: (id: number): Promise<void> => {
        return authedFetch(`/api/dharma-talks/${id}`, { method: 'DELETE' }).then(handleResponse);
    },
    getDharmaTalksBySpaceId: (spaceId: number): Promise<DharmaTalk[]> => {
        return authedFetch(`/api/spaces/${spaceId}/dharma-talks`).then(handleResponse);
    },
    getDocumentsBySpaceId: (spaceId: number): Promise<Document[]> => {
        return authedFetch(`/api/spaces/${spaceId}/documents`).then(handleResponse);
    },
    generateTtsAudio: (text: string, provider: ModelType, model: string, voice: string, lang: 'vi' | 'en', userId: number): Promise<{ audioContent: string }> => {
        return authedFetch('/api/tts/generate', {
            method: 'POST',
            body: JSON.stringify({ text, provider, model, voice, lang, userId }),
        }).then(handleResponse);
    },
    translateText: (provider: ModelType, model: string, text: string, targetLanguage: 'en' | 'vi', userId: number, contextPrompt?: string): Promise<{ translatedText: string }> => {
        return authedFetch('/api/translate', {
            method: 'POST',
            body: JSON.stringify({ provider, model, text, targetLanguage, userId, contextPrompt }),
        }).then(handleResponse);
    },
    extractTextFromFile: (provider: ModelType, model: string, file: File, userId: number): Promise<{ htmlContent: string }> => {
        const formData = new FormData();
        formData.append('provider', provider);
        formData.append('model', model);
        formData.append('file', file);
        formData.append('userId', String(userId));
        return authedFetch('/api/documents/extract-text', {
            method: 'POST',
            body: formData,
        }).then(handleResponse);
    },
    getSocialFeedPosts: (): Promise<SocialFeedPost[]> => {
        return authedFetch('/api/social-feed').then(handleResponse);
    },
    getDashboardStats: (): Promise<DashboardStats> => {
        return authedFetch('/api/dashboard/stats').then(handleResponse);
    },
    login: (email: string, password: string): Promise<User> => {
        return authedFetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }).then(handleResponse);
    },
    register: (user: Partial<User> & { password?: string }): Promise<User> => {
        return authedFetch('/api/register', {
            method: 'POST',
            body: JSON.stringify(user),
        }).then(handleResponse);
    },
    forgotPassword: (email: string, language: 'vi' | 'en'): Promise<{ message: string }> => {
        return authedFetch('/api/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email, language }),
        }).then(handleResponse);
    },
    resetPassword: (token: string, password: string): Promise<{ message: string }> => {
        return authedFetch('/api/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, password }),
        }).then(handleResponse);
    },
    changePassword: (userId: number, oldPassword: string, newPassword: string): Promise<{ message: string }> => {
        return authedFetch('/api/users/change-password', {
            method: 'POST',
            body: JSON.stringify({ userId, oldPassword, newPassword }),
        }).then(handleResponse);
    },
    getSystemConfig: (): Promise<SystemConfig | null> => {
        return authedFetch('/api/system-config').then(handleResponse);
    },
    updateSystemConfig: (config: SystemConfig): Promise<SystemConfig> => {
        return authedFetch('/api/system-config', {
            method: 'PUT',
            body: JSON.stringify(config),
        }).then(handleResponse);
    },
    getAiConfigs: (user: User | null): Promise<AIConfig[]> => {
        return authedFetch('/api/ai-configs', {
            method: 'POST',
            body: JSON.stringify({ userId: user?.id }),
        }).then(handleResponse);
    },
     getAiConfigsBySpaceId: (spaceId: number): Promise<AIConfig[]> => {
        return authedFetch(`/api/spaces/${spaceId}/ai-configs`).then(handleResponse);
    },
    getManageableAiConfigs: (user: User): Promise<AIConfig[]> => {
        return authedFetch('/api/ai-configs/manageable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
            body: JSON.stringify({ userId: user.id }),
        }).then(handleResponse);
    },
    createAiConfig: (aiConfig: Partial<AIConfig>): Promise<AIConfig> => {
        return authedFetch('/api/ai-configs/create', {
            method: 'POST',
            body: JSON.stringify(aiConfig),
        }).then(handleResponse);
    },
    updateAiConfig: (aiConfig: AIConfig): Promise<AIConfig> => {
        return authedFetch(`/api/ai-configs/${aiConfig.id}`, {
            method: 'PUT',
            body: JSON.stringify(aiConfig),
        }).then(handleResponse);
    },
    deleteAiConfig: (id: number | string): Promise<void> => {
        return authedFetch(`/api/ai-configs/${id}`, { method: 'DELETE' }).then(res => {
            if (!res.ok) throw new Error('Failed to delete AI config');
        });
    },
    purchaseAi: (aiId: number | string, userId: number): Promise<{ updatedUser: User }> => {
        return authedFetch(`/api/ai-configs/${aiId}/purchase`, {
            method: 'POST',
            body: JSON.stringify({ userId }),
        }).then(handleResponse);
    },
    claimFreeAi: (aiId: number | string, userId: number): Promise<{ updatedUser: User }> => {
        return authedFetch(`/api/ai-configs/${aiId}/claim`, {
            method: 'POST',
            body: JSON.stringify({ userId }),
        }).then(handleResponse);
    },
    getAiAccessList: (aiId: number | string): Promise<User[]> => {
        return authedFetch(`/api/ai-configs/${aiId}/access`).then(handleResponse);
    },
    updateAiAccessList: (aiId: number | string, emails: string[]): Promise<void> => {
        return authedFetch(`/api/ai-configs/${aiId}/access`, {
            method: 'POST',
            body: JSON.stringify({ emails }),
        }).then(handleResponse);
    },
    submitKoiiTask: (aiConfigId: number | string): Promise<{ message: string }> => {
        return authedFetch(`/api/koii/submit-task`, {
            method: 'POST',
            body: JSON.stringify({ aiConfigId }),
        }).then(handleResponse);
    },
    getKoiiTaskStatus: (aiConfigId: number | string): Promise<KoiiTask | null> => {
        return authedFetch(`/api/koii/task-status/${aiConfigId}`).then(res => {
            if (res.status === 404) {
                return null;
            }
            return handleResponse(res);
        });
    },
    getConversations: (filters: { userId: number; aiConfigId: number | string; page: number; limit: number; }): Promise<{ data: Conversation[], total: number }> => {
        const query = createSearchParams(filters as any).toString();
        return authedFetch(`/api/conversations?${query}`).then(handleResponse);
    },
    getTrainedConversationsForAI: (aiConfigId: number | string): Promise<Conversation[]> => {
        return authedFetch(`/api/ai-configs/${aiConfigId}/trained-conversations`).then(handleResponse);
    },
    getTestConversationsForAI: (aiConfigId: number | string, userId: number): Promise<Conversation[]> => {
        return authedFetch(`/api/ai-configs/${aiConfigId}/test-conversations`, {
            method: 'POST',
            body: JSON.stringify({ userId }),
        }).then(handleResponse);
    },
    getLatestConversationForAI: (aiConfigId: number | string, user: User): Promise<Conversation | null> => {
        return authedFetch(`/api/ai-configs/${aiConfigId}/latest-conversation`, {
            method: 'POST',
            body: JSON.stringify({ userId: user.id }),
        }).then(handleResponse);
    },
    getAllConversations: (_user: User): Promise<Conversation[]> => {
        return authedFetch('/api/conversations/all', { headers: {'Cache-Control': 'no-store'} }).then(handleResponse);
    },
    createConversation: (aiConfigId: number | string, messages: Message[], user: User): Promise<Conversation> => {
        return authedFetch('/api/conversations', {
            method: 'POST',
            body: JSON.stringify({ aiConfigId, messages, userId: user.id }),
        }).then(handleResponse);
    },
    deleteConversation: (id: number): Promise<void> => {
        return authedFetch(`/api/conversations/${id}`, { method: 'DELETE' }).then(res => {
            if (!res.ok) throw new Error('Failed to delete conversation');
        });
    },
    renameConversation: (id: number, newTitle: string): Promise<Conversation> => {
        return authedFetch(`/api/conversations/${id}/rename`, {
            method: 'PUT',
            body: JSON.stringify({ title: newTitle }),
        }).then(handleResponse);
    },
    updateConversationMessages: (id: number, messages: Message[]): Promise<any> => {
        return authedFetch(`/api/conversations/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ messages }),
        }).then(handleResponse);
    },
    updateConversationTrainingStatus: (id: number, isTrained: boolean): Promise<Conversation> => {
        return authedFetch(`/api/conversations/${id}/train-status`, {
            method: 'PUT',
            body: JSON.stringify({ isTrained }),
        }).then(handleResponse);
    },
     setMessageFeedback: (conversationId: number, messageId: string | number, feedback: 'liked' | 'disliked' | null): Promise<{success: boolean, updatedMessage: Message}> => {
        return authedFetch(`/api/conversations/${conversationId}/messages/${messageId}/feedback`, {
            method: 'POST',
            body: JSON.stringify({ feedback }),
        }).then(handleResponse);
    },
    sendMessageStream: async (
        aiConfig: AIConfig,
        messages: Message[],
        user: User | null,
        conversationId: number | null,
        callbacks: StreamCallbacks,
        isTestChat: boolean = false,
        language: 'vi' | 'en',
        clientAiMessageId?: string | number,
        guestMessageCount?: number
    ): Promise<void> => {
        let fullResponseText = '';
        let hasEnded = false;

        try {
            const bodyPayload = { 
                aiConfig, 
                messages, 
                userId: user?.id, 
                conversationId, 
                isTestChat, 
                language, 
                clientAiMessageId,
                guestTurnCount: guestMessageCount
            };
            const response = await authedFetch('/api/conversations/chat/stream', {
                method: 'POST',
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
                const events = buffer.split('\n\n');
                buffer = events.pop() || '';

                for (const event of events) {
                    if (!event.startsWith('data: ')) continue;
                    const jsonStr = event.substring(6).trim();
                    if (!jsonStr) continue;
                    try {
                        const data = JSON.parse(jsonStr);
                        if (data.text && !data.done) {
                            callbacks.onChunk(data.text);
                            fullResponseText += data.text;
                        }
                        if (data.conversationId) {
                            finalConversationId = data.conversationId;
                        }
                        if (data.error) {
                            callbacks.onError(data.error);
                            hasEnded = true;
                            return;
                        }
                        if (data.done && !hasEnded) {
                            const finalMessage = data.text ? { text: data.text, thought: data.thought } : undefined;
                            callbacks.onEnd(finalConversationId, data.updatedUser, finalMessage);
                            hasEnded = true;
                            return;
                        }
                    } catch (e) {
                        console.error("Failed to parse stream event:", jsonStr, e);
                    }
                }
            };

            while (!hasEnded) {
                const { done, value } = await reader.read();
                if (done) {
                    if (buffer) processBuffer();
                    break;
                }
                buffer += decoder.decode(value, { stream: true });
                processBuffer();
            }

            if (!hasEnded && fullResponseText) {
                 callbacks.onEnd(finalConversationId, null, { text: fullResponseText, thought: null });
            }
        } catch (error: any) {
            if (!hasEnded) {
                callbacks.onError(error.message || "An unknown streaming error occurred.");
            }
        }
    },
    getSpaceOwners: (): Promise<User[]> => authedFetch('/api/users/space-owners').then(handleResponse),
    getAllUsers: (page: number, limit: number, search: string): Promise<User[]> => {
        const params = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            search: search,
        });
        return authedFetch(`/api/users?${params.toString()}`).then(handleResponse);
    },
    createUser: (user: Partial<User> & { password?: string }): Promise<User> => {
        return authedFetch('/api/users', {
            method: 'POST',
            body: JSON.stringify(user),
        }).then(handleResponse);
    },
    updateUser: (user: Partial<User>): Promise<User> => {
        return authedFetch(`/api/users/${user.id}`, {
            method: 'PUT',
            body: JSON.stringify(user),
        }).then(handleResponse);
    },
    deleteUser: (userId: number): Promise<void> => {
        return authedFetch(`/api/users/${userId}`, { method: 'DELETE' }).then(res => {
            if (!res.ok) throw new Error('Failed to delete user');
        });
    },
    regenerateApiToken: (userId: number): Promise<User> => {
        return authedFetch(`/api/users/${userId}/regenerate-token`, {
            method: 'POST',
        }).then(handleResponse);
    },
    getMySpaceOwnerData: (): Promise<SpaceOwnerData> => {
        return authedFetch('/api/users/my-space-owner-data').then(handleResponse);
    },
    getAllRoles: (): Promise<Role[]> => authedFetch('/api/roles').then(handleResponse),
    createRole: (role: Partial<Role>): Promise<Role> => {
        return authedFetch('/api/roles', {
            method: 'POST',
            body: JSON.stringify(role),
        }).then(handleResponse);
    },
    updateRole: (role: Role): Promise<Role> => {
        return authedFetch(`/api/roles/${role.id}`, {
            method: 'PUT',
            body: JSON.stringify(role),
        }).then(handleResponse);
    },
    deleteRole: (roleId: number | string): Promise<void> => {
        return authedFetch(`/api/roles/${roleId}`, { method: 'DELETE' }).then(handleResponse);
    },
    getAllTransactions: (): Promise<Transaction[]> => authedFetch('/api/transactions').then(handleResponse),
    getTransactionsForUser: (userId: number): Promise<Transaction[]> => {
        return authedFetch(`/api/transactions/user/${userId}`).then(handleResponse);
    },
    addMeritsManually: (userId: number, merits: number, adminId: number): Promise<User> => {
        return authedFetch('/api/transactions/manual', {
            method: 'POST',
            body: JSON.stringify({ userId, merits, adminId }),
        }).then(handleResponse);
    },
    purchaseSubscription: (userId: number, planId: number | string): Promise<User> => {
        return authedFetch('/api/subscriptions/purchase', {
            method: 'POST',
            body: JSON.stringify({ userId, planId }),
        }).then(handleResponse);
    },
    initiateMeritPurchase: (userId: number, merits: number, crypto: 'USDT' | 'USDC' | 'ETH'): Promise<{ paymentAddress: string, amount: string, transactionId: string }> => {
        return authedFetch('/api/crypto/initiate-merit-purchase', {
            method: 'POST',
            body: JSON.stringify({ userId, merits, crypto }),
        }).then(handleResponse);
    },
    confirmCryptoPayment: (userId: number, transactionId: string): Promise<User> => {
        return authedFetch('/api/crypto/confirm', {
            method: 'POST',
            body: JSON.stringify({ userId, transactionId }),
        }).then(handleResponse);
    },
    initiateStripePurchase: (userId: number, merits: number): Promise<{ clientSecret: string, paymentIntentId: string }> => {
        return authedFetch('/api/stripe/create-payment-intent', {
            method: 'POST',
            body: JSON.stringify({ userId, merits }),
        }).then(handleResponse);
    },
    confirmStripePayment: (paymentIntentId: string): Promise<User> => {
        return authedFetch('/api/stripe/confirm-payment', {
            method: 'POST',
            body: JSON.stringify({ paymentIntentId }),
        }).then(handleResponse);
    },
    
    // New methods for Stripe Checkout
    createCheckoutSession: (amount: number, userId: number, message?: string): Promise<{ url: string }> => {
        return authedFetch('/api/stripe/create-checkout-session', {
            method: 'POST',
            body: JSON.stringify({ amount, userId, message }),
        }).then(handleResponse);
    },

    verifyCheckoutSession: (sessionId: string): Promise<User> => {
        return authedFetch('/api/stripe/verify-checkout-session', {
            method: 'POST',
            body: JSON.stringify({ sessionId }),
        }).then(handleResponse);
    },
    
    createWithdrawalRequest: (userId: number, amount: number): Promise<WithdrawalRequest> => {
        return authedFetch('/api/withdrawals', {
            method: 'POST',
            body: JSON.stringify({ userId, amount }),
        }).then(handleResponse);
    },
    getDocumentAuthors: (spaceId?: string): Promise<DocumentAuthor[]> => authedFetch(`/api/documents/authors${spaceId ? `?spaceId=${spaceId}` : ''}`).then(handleResponse),
    createDocumentAuthor: (data: { name: string; spaceId: number | null }): Promise<DocumentAuthor> => {
        return authedFetch('/api/documents/authors', {
            method: 'POST',
            body: JSON.stringify(data),
        }).then(handleResponse);
    },
    updateDocumentAuthor: (id: number, data: { name?: string; spaceId?: number | null }): Promise<DocumentAuthor> => {
        return authedFetch(`/api/documents/authors/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }).then(handleResponse);
    },
    deleteDocumentAuthor: (id: number): Promise<void> => {
        return authedFetch(`/api/documents/authors/${id}`, { method: 'DELETE' }).then(handleResponse);
    },
    getDocumentTypes: (spaceId?: string): Promise<DocumentType[]> => authedFetch(`/api/documents/types${spaceId ? `?spaceId=${spaceId}` : ''}`).then(handleResponse),
    createDocumentType: (data: { name: string; spaceId: number | null }): Promise<DocumentType> => {
        return authedFetch('/api/documents/types', {
            method: 'POST',
            body: JSON.stringify(data),
        }).then(handleResponse);
    },
    updateDocumentType: (id: number, data: { name?: string; spaceId?: number | null }): Promise<DocumentType> => {
        return authedFetch(`/api/documents/types/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }).then(handleResponse);
    },
    deleteDocumentType: (id: number): Promise<void> => {
        return authedFetch(`/api/documents/types/${id}`, { method: 'DELETE' }).then(handleResponse);
    },
    getDocumentTopics: (spaceId?: string): Promise<DocumentTopic[]> => authedFetch(`/api/documents/topics${spaceId ? `?spaceId=${spaceId}` : ''}`).then(handleResponse),
    createDocumentTopic: (data: { name: string; spaceId: number | null; typeId: number; authorId: number; nameEn?: string; }): Promise<DocumentTopic> => {
        return authedFetch('/api/documents/topics', {
            method: 'POST',
            body: JSON.stringify(data),
        }).then(handleResponse);
    },
    updateDocumentTopic: (id: number, data: { name?: string; spaceId?: number | null; typeId?: number; authorId?: number; nameEn?: string; }): Promise<DocumentTopic> => {
        return authedFetch(`/api/documents/topics/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }).then(handleResponse);
    },
    deleteDocumentTopic: (id: number): Promise<void> => {
        return authedFetch(`/api/documents/topics/${id}`, { method: 'DELETE' }).then(handleResponse);
    },
    getAllTags: (): Promise<Tag[]> => authedFetch('/api/documents/tags').then(handleResponse),
    getDocuments: (filters?: any): Promise<{ data: Document[], total: number }> => {
        const query = new URLSearchParams(filters).toString();
        return authedFetch(`/api/documents?${query}`).then(handleResponse);
    },
    createDocument: (docData: Partial<Document>): Promise<Document> => {
        return authedFetch('/api/documents', {
            method: 'POST',
            body: JSON.stringify(docData),
        }).then(handleResponse);
    },
    updateDocument: (id: number, docData: Partial<Document>): Promise<Document> => {
        return authedFetch(`/api/documents/${id}`, {
            method: 'PUT',
            body: JSON.stringify(docData),
        }).then(handleResponse);
    },
    deleteDocument: (id: number): Promise<void> => {
        return authedFetch(`/api/documents/${id}`, { method: 'DELETE' }).then(handleResponse);
    },
    likeDocument: (id: number): Promise<{ likes: number }> => {
        return authedFetch(`/api/documents/${id}/like`, { method: 'POST' }).then(handleResponse);
    },
    getLibraryRecommended: (): Promise<{ topKe: Document[], topTruyen: Document[] }> => authedFetch('/api/library/recommended').then(handleResponse),
    getLibrarySidebarData: (): Promise<any> => authedFetch('/api/library/sidebar').then(handleResponse),
    getLibraryFilters: (spaceIdOrSlug?: number | string | null, filters?: { typeId?: number; authorId?: number; topicsPage?: number; topicsLimit?: number; }): Promise<any> => {
        const params: Record<string, any> = {
            ...(typeof spaceIdOrSlug === 'string' ? { spaceSlug: spaceIdOrSlug } : { spaceId: spaceIdOrSlug }),
            ...(filters || {}),
            _t: Date.now() // Cache buster
        };
        const query = createSearchParams(params).toString();
        return authedFetch(`/api/library/filters?${query}`, {
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        }).then(handleResponse);
    },
    /**
     * Get paginated library documents with support for pagination and Abort signal.
     * Hàm sẽ trả về object chứa { data, page, limit, total } hoặc mảng nếu backend trả mảng.
     */
    getLibraryDocuments: async (params: any = {}) => {
         const { signal, page = 1, limit = 6, ...rest } = params || {};
         const q = new URLSearchParams(
             Object.entries({ ...rest, page: String(page), limit: String(limit) })
                 .filter(([_, v]) => v !== undefined && v !== null)
                 .map(([k, v]) => [k, String(v)])
         ).toString();

        const response = await authedFetch(`/api/library/documents?${q}`, { signal });
        return handleResponse(response);
    },
    getDocumentDetail: (id: number): Promise<Document> => authedFetch(`/api/library/documents/${id}`).then(handleResponse),
    postComment: (data: any): Promise<Comment> => {
        return authedFetch('/api/comments', {
            method: 'POST',
            body: JSON.stringify(data),
        }).then(handleResponse);
    },
    getComments: (filters: any): Promise<Comment[]> => {
        const query = new URLSearchParams(filters).toString();
        return authedFetch(`/api/admin/comments?${query}`).then(handleResponse);
    },
    updateCommentStatus: (id: number, status: string): Promise<Comment> => {
        return authedFetch(`/api/admin/comments/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        }).then(handleResponse);
    },
    deleteComment: (id: number): Promise<void> => {
        return authedFetch(`/api/admin/comments/${id}`, { method: 'DELETE' }).then(handleResponse);
    },
    getSpaces: (): Promise<Space[]> => {
        return authedFetch('/api/spaces').then(handleResponse);
    },
    getSpaceById: (id: number): Promise<Space> => {
        return authedFetch(`/api/spaces/${id}`).then(handleResponse);
    },
    getSpaceBySlug: (slug: string): Promise<Space> => {
        return authedFetch(`/api/spaces/${slug}`).then(handleResponse);
    },
    createSpace: (spaceData: Partial<Space>): Promise<Space> => {
        return authedFetch('/api/spaces', { 
            method: 'POST', 
            body: JSON.stringify(spaceData) 
        }).then(handleResponse);
    },
    updateSpace: ({ id, spaceData }: { id: number, spaceData: Partial<Space> }): Promise<Space> => {
        return authedFetch(`/api/spaces/${id}`, { 
            method: 'PUT', 
            body: JSON.stringify(spaceData) 
        }).then(handleResponse);
    },
    deleteSpace: (id: number): Promise<void> => {
        return authedFetch(`/api/spaces/${id}`, { method: 'DELETE' }).then(handleResponse);
    },
    getSpaceTypes: (): Promise<SpaceType[]> => authedFetch('/api/space-types').then(handleResponse),
    createSpaceType: (data: Partial<SpaceType>): Promise<SpaceType> => authedFetch('/api/space-types', { method: 'POST', body: JSON.stringify(data) }).then(handleResponse),
    updateSpaceType: (id: number, data: Partial<SpaceType>): Promise<SpaceType> => authedFetch(`/api/space-types/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(handleResponse),
    deleteSpaceType: (id: number): Promise<void> => authedFetch(`/api/space-types/${id}`, { method: 'DELETE' }).then(handleResponse),
    incrementSpaceView: (id: number): Promise<void> => {
        return authedFetch(`/api/spaces/${id}/view`, { method: 'POST' }).then(handleResponse);
    },
    likeSpace: (id: number): Promise<{ likes: number }> => {
        return authedFetch(`/api/spaces/${id}/like`, { method: 'POST' }).then(handleResponse);
    },
    makeOffering: (spaceId: number, amount: number, userId: number): Promise<{ updatedUser: User }> => {
        return authedFetch(`/api/spaces/${spaceId}/offer`, {
            method: 'POST',
            body: JSON.stringify({ amount, userId }),
        }).then(handleResponse);
    },
    sendContactForm: (data: { name: string; email: string; message: string; spaceName: string }): Promise<void> => {
        return authedFetch('/api/contact', {
            method: 'POST',
            body: JSON.stringify(data),
        }).then(handleResponse);
    },
    likeDharmaTalk: (id: number): Promise<{ likes: number }> => {
        return authedFetch(`/api/dharma-talks/${id}/like`, { method: 'POST' }).then(handleResponse);
    },
    incrementDharmaTalkView: (id: number): Promise<{ views: number }> => {
        return authedFetch(`/api/dharma-talks/${id}/view`, { method: 'POST' }).then(handleResponse);
    },

    // --- Meditation ---
    getAllMeditations: (): Promise<MeditationSession[]> => {
        return authedFetch('/api/meditations').then(handleResponse);
    },

    getMeditationBySpaceId: (spaceId: number): Promise<MeditationSession | null> => {
        return fetch(`/api/meditations/space/${spaceId}`).then(res => res.json());
    },

    createMeditation: (formData: FormData): Promise<MeditationSession> => {
        return authedFetch('/api/meditations', {
            method: 'POST',
            body: formData,
        }).then(handleResponse);
    },

    updateMeditation: (id: number, formData: FormData): Promise<MeditationSession> => {
        return authedFetch(`/api/meditations/${id}`, {
            method: 'PUT',
            body: formData,
        }).then(handleResponse);
    },

    deleteMeditation: (id: number): Promise<MeditationSession> => {
        return authedFetch(`/api/meditations/${id}`, { method: 'DELETE' }).then(handleResponse);
    },
    getWithdrawalRequests: (): Promise<WithdrawalRequest[]> => authedFetch('/api/admin/withdrawals').then(handleResponse),
    processWithdrawalRequest: (id: number, action: 'approve' | 'reject'): Promise<WithdrawalRequest> => {
        return authedFetch(`/api/admin/withdrawals/${id}/process`, {
            method: 'PUT',
            body: JSON.stringify({ action }),
        }).then(handleResponse);
    },
    getPricingPlans: (): Promise<PricingPlan[]> => authedFetch('/api/pricing-plans').then(handleResponse),
    createPricingPlan: (plan: Partial<PricingPlan>): Promise<PricingPlan> => {
        return authedFetch('/api/pricing-plans', {
            method: 'POST',
            body: JSON.stringify(plan),
        }).then(handleResponse);
    },
    updatePricingPlan: (plan: PricingPlan): Promise<PricingPlan> => {
        return authedFetch(`/api/pricing-plans/${plan.id}`, {
            method: 'PUT',
            body: JSON.stringify(plan),
        }).then(handleResponse);
    },
    deletePricingPlan: (id: number | string): Promise<void> => {
        return authedFetch(`/api/pricing-plans/${id}`, { method: 'DELETE' }).then(handleResponse);
    },
    getTrainingDataForAI: (aiConfigId: number | string): Promise<TrainingDataSource[]> => {
        return authedFetch(`/api/ai-configs/${aiConfigId}/training-data`).then(handleResponse);
    },
    createTrainingDataSourceForAI: (aiConfigId: number, formData: FormData): Promise<TrainingDataSource> => {
        return authedFetch(`/api/ai-configs/${aiConfigId}/training-data`, {
            method: 'POST',
            body: formData,
        }).then(handleResponse);
    },
    createTrainingQaDataSource: (aiConfigId: number, question: string, answer: string, thought?: string | null): Promise<TrainingDataSource> => {
        return authedFetch(`/api/ai-configs/${aiConfigId}/training-data`, {
            method: 'POST',
            body: JSON.stringify({ type: 'qa', question, answer, thought }),
        }).then(handleResponse);
    },
    deleteTrainingDataSource: (id: number): Promise<void> => {
        return authedFetch(`/api/training-data/${id}`, { method: 'DELETE' }).then(handleResponse);
    },
    deleteTrainingQaDataSource: (aiConfigId: number, question: string, answer: string): Promise<void> => {
        return authedFetch(`/api/training-data/qa`, {
            method: 'DELETE',
            body: JSON.stringify({ aiConfigId, question, answer }),
        }).then(handleResponse);
    },
    getAllQaTrainingData: (): Promise<TrainingDataSource[]> => authedFetch('/api/training-data/qa/all').then(handleResponse),
    exportQaDataForFinetune: (sources: any): Promise<any> => {
        return authedFetch('/api/training-data/qa/export', {
            method: 'POST',
            body: JSON.stringify({ sourcesToExport: sources }),
        }).then(handleResponse);
    },
    uploadFiles: (formData: FormData): Promise<{ filePaths: string[] }> => {
        return authedFetch('/api/upload', {
            method: 'POST',
            body: formData,
        }).then(handleResponse);
    },
    getAvailableModels: (provider: ModelType, userId: number): Promise<string[]> => authedFetch(`/api/models/${provider}?userId=${userId}`).then(handleResponse),
    generateSummaryForDataSource: (id: number): Promise<TrainingDataSource> => {
        return authedFetch(`/api/training-data/${id}/summarize`, { method: 'POST' }).then(handleResponse);
    },
    getDocumentConfig: (): Promise<DocumentConfig | null> => authedFetch('/api/documents/config').then(handleResponse),
    updateDocumentConfig: (config: DocumentConfig): Promise<DocumentConfig> => {
        return authedFetch('/api/documents/config', {
            method: 'PUT',
            body: JSON.stringify(config),
        }).then(handleResponse);
    },
    linkDocumentsToAi: (aiConfigId: number, documentIds: number[]): Promise<any> => {
        return authedFetch(`/api/ai-configs/${aiConfigId}/documents`, {
            method: 'POST',
            body: JSON.stringify({ documentIds }),
        }).then(handleResponse);
    },
    unlinkDocumentFromAi: (aiConfigId: number, documentId: number): Promise<void> => {
        return authedFetch(`/api/ai-configs/${aiConfigId}/documents/${documentId}`, { method: 'DELETE' }).then(handleResponse);
    },
    /**
     * Get paginated topics for library with support for infinite scroll
     */
    getLibraryTopics: async (params: any = {}) => {
         const { signal, page = 1, limit = 16, spaceId } = params || {};
         const q = new URLSearchParams(
             Object.entries({ spaceId, page: String(page), limit: String(limit) })
                 .filter(([_, v]) => v !== undefined && v !== null)
                 .map(([k, v]) => [k, String(v)])
         ).toString();
        const response = await authedFetch(`/api/library/topics?${q}`, { signal });
        return handleResponse(response);
    },
    getEnabledPaymentMethods: (): Promise<string[]> => {
        return authedFetch('/api/stripe/payment-methods').then(handleResponse);
    },
    getStripeConfig: (): Promise<{ publishableKey: string }> => {
        return authedFetch('/api/stripe/config').then(handleResponse);
    }
};