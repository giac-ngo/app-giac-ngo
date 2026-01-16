// server/controllers/chatController.js
import { userModel } from '../models/user.model.js';
import { systemModel } from '../models/system.model.js';
import { billingModel } from '../models/billing.model.js';
import { conversationModel } from '../models/conversation.model.js';
import { aiConfigModel } from '../models/aiConfig.model.js';
import { geminiService } from '../services/geminiService.js';
import { gptService } from '../services/gptService.js';
import { grokService } from '../services/grokService.js';
import { fileParserService } from '../services/fileParserService.js';
import weaviateService from '../services/weaviateService.js';
import { trainingDataModel } from '../models/trainingData.model.js';
import { vertexService } from '../services/vertexService.js';

const mapAndSanitizeUser = (user) => {
    if (!user) return null;
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
};

async function getApiKeyForAi(aiConfig) {
    if (!aiConfig.ownerId) {
        // Fallback for older AI configs without an owner, try system key
        const systemConfig = await systemModel.getConfig();
        const apiKey = systemConfig?.systemKeys?.[aiConfig.modelType];
        if (!apiKey) throw new Error(`System API Key for ${aiConfig.modelType.toUpperCase()} not configured, and AI has no owner.`);
        return apiKey;
    }

    const owner = await userModel.findById(aiConfig.ownerId);
    if (!owner) throw new Error(`AI owner with ID ${aiConfig.ownerId} not found.`);

    const apiKey = owner.apiKeys?.[aiConfig.modelType];
    if (!apiKey) throw new Error(`Owner's API key for ${aiConfig.modelType.toUpperCase()} is missing.`);

    return apiKey;
}

export const chatController = {
    async sendMessageStream(req, res) {
        // Use authenticated user from req.user instead of userId from body to prevent impersonation.
        let { aiConfig, aiConfigId, messages, message, conversationId, isTestChat, language, clientAiMessageId, guestTurnCount } = req.body;

        // Support both 'messages' and 'message' field names (for external API compatibility)
        if (!messages && message) {
            // If message is a string, convert to messages array
            if (typeof message === 'string') {
                messages = [{
                    id: `msg-${Date.now()}`,
                    sender: 'user',
                    text: message,
                    timestamp: Date.now()
                }];
            } else if (Array.isArray(message)) {
                // If message is already an array, use it as messages
                messages = message;
            } else {
                messages = message;
            }
        }

        // Support lookup by aiConfigId if full config object is not provided (for external API calls)
        if (!aiConfig && aiConfigId) {
            const { aiConfigModel } = await import('../models/aiConfig.model.js');
            aiConfig = await aiConfigModel.findById(aiConfigId);
            if (!aiConfig) {
                res.status(404).json({ error: "AI Config not found." });
                return;
            }
        } else if (!aiConfig) {
            res.status(400).json({ error: "aiConfig or aiConfigId is required." });
            return;
        }

        // Validate messages array
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            res.status(400).json({ error: "message is required." });
            return;
        }

        const currentUser = req.user; // This will be null for guests.
        const userId = currentUser ? currentUser.id : null;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const onError = (error) => {
            const userMessage = error.message || "An unexpected error occurred.";
            res.write(`data: ${JSON.stringify({ error: userMessage })}\n\n`);
            res.end();
        };

        try {
            const finalMessages = [...messages];
            const lastMessage = finalMessages[finalMessages.length - 1];
            if (lastMessage.sender === 'user' && lastMessage.fileAttachment) {
                const { url, name } = lastMessage.fileAttachment;
                const text = await fileParserService.extractText(url, name);
                lastMessage.text = `File "${name}" content:\n${text}\n\nUser prompt: "${lastMessage.text || ''}"`;
                delete lastMessage.fileAttachment;
            }

            let retrievedContext = '';
            let requestChargeMethod = 'none'; // 'none', 'ai_specific', 'subscription', 'merit_cost'

            if (!isTestChat) {
                // If user is logged in, perform strict access checks
                if (currentUser) {
                    if (aiConfig.isContactForAccess) {
                        const isGranted = await aiConfigModel.checkUserAccess(aiConfig.id, currentUser.id);
                        if (!isGranted) {
                            return onError(new Error("This AI requires special access. Please contact the administrator."));
                        }
                        // If granted, access is free for this request.
                        requestChargeMethod = 'none';
                    } else {
                        const isUniversallyFree = aiConfig.isPublic && !aiConfig.requiresSubscription && !aiConfig.purchaseCost && !aiConfig.meritCost;

                        if (!isUniversallyFree) {
                            const perAiRequestCount = await aiConfigModel.getUserRequestCount(currentUser.id, aiConfig.id);
                            if (perAiRequestCount !== null && perAiRequestCount > 0) {
                                requestChargeMethod = 'ai_specific';
                            } else if (currentUser.subscriptionPlanId && (currentUser.requestsRemaining === null || currentUser.requestsRemaining > 0)) {
                                const plan = await billingModel.findPlanById(currentUser.subscriptionPlanId);
                                if (plan && (plan.aiConfigIds || []).map(String).includes(String(aiConfig.id))) {
                                    requestChargeMethod = 'subscription';
                                }
                            } else if (aiConfig.meritCost && aiConfig.meritCost > 0) {
                                if (currentUser.merits !== null && currentUser.merits >= aiConfig.meritCost) {
                                    requestChargeMethod = 'merit_cost';
                                } else {
                                    return onError(new Error("You do not have enough merits for this request."));
                                }
                            } else if (aiConfig.purchaseCost && aiConfig.purchaseCost > 0) {
                                return onError(new Error("This AI must be purchased to use."));
                            } else {
                                if (perAiRequestCount === 0) {
                                    return onError(new Error("You have used all your requests for this specific AI."));
                                } else if (currentUser.requestsRemaining === 0) {
                                    return onError(new Error("You have reached the request limit for your subscription plan."));
                                }
                                return onError(new Error("You do not have access to this AI."));
                            }
                        }
                    }
                } else {
                    // Guest Logic with backend limit check
                    const systemConfig = await systemModel.getConfig();
                    const guestLimit = systemConfig.guestMessageLimit || 5;

                    if (guestTurnCount !== undefined && guestTurnCount >= guestLimit) {
                        return onError(new Error("Hết lượt chat miễn phí. Vui lòng đăng nhập để tiếp tục."));
                    }

                    if (aiConfig.isContactForAccess) {
                        return onError(new Error("This AI requires special access. Please log in or contact the administrator."));
                    }
                    requestChargeMethod = 'none'; // Guests are not charged in the DB
                }
            }

            const apiKey = await getApiKeyForAi(aiConfig);
            console.log(apiKey);
            const lastUserMessage = finalMessages.findLast(m => m.sender === 'user');
            if (lastUserMessage?.text && apiKey) {
                const results = await weaviateService.search(aiConfig.modelType, aiConfig.id, lastUserMessage.text, apiKey);
                if (results?.length > 0) {
                    retrievedContext = "--- Relevant Information ---\n" + results.map(r => r.content).join('\n\n') + "\n--- End of Information ---\n\n";
                }
            }

            const onChunk = (chunk) => res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
            const onEnd = async (finalMessage) => {
                try {
                    let finalConvId = conversationId;
                    const { text, thought } = finalMessage;
                    const aiMessage = { id: clientAiMessageId || `ai-${Date.now()}`, text, sender: 'ai', timestamp: Date.now(), thought: thought || undefined };
                    const allFinalMessages = [...finalMessages, aiMessage];

                    if (conversationId) {
                        await conversationModel.update(conversationId, allFinalMessages);
                    } else if (typeof aiConfig.id === 'number') {
                        // Create conversation. For guests, userId is null.
                        const newConv = await conversationModel.create({
                            userId: currentUser?.id || null,
                            userName: currentUser?.name || 'Guest',
                            aiConfigId: aiConfig.id,
                            messages: allFinalMessages,
                            isTestChat,
                        });
                        finalConvId = newConv.id;
                    }

                    let updatedUser = null;
                    if (currentUser && !isTestChat) {
                        switch (requestChargeMethod) {
                            case 'ai_specific':
                                await aiConfigModel.decrementUserRequestCount(currentUser.id, aiConfig.id);
                                updatedUser = await userModel.findById(currentUser.id); // Re-fetch user to get the latest state
                                break;
                            case 'subscription':
                                updatedUser = await userModel.deductRequest(currentUser.id);
                                break;
                            case 'merit_cost':
                                updatedUser = await billingModel.addMerits(currentUser.id, -aiConfig.meritCost, null, 'ai_usage');
                                break;
                        }
                    }

                    res.write(`data: ${JSON.stringify({ conversationId: finalConvId, done: true, updatedUser: mapAndSanitizeUser(updatedUser), text, thought })}\n\n`);
                    res.end();
                } catch (error) {
                    console.error("Error in onEnd callback:", error);
                    onError(error);
                }
            };
            console.log(aiConfig.modelType);
            const service = { gemini: geminiService, gpt: gptService, grok: grokService, vertex: vertexService }[aiConfig.modelType];
            if (!service) return onError(new Error(`Unsupported model type: ${aiConfig.modelType}`));
            console.log(service);
            service.sendMessageStream(aiConfig, finalMessages.slice(-8), apiKey, { onChunk, onEnd, onError }, language, retrievedContext);
        } catch (error) {
            onError(error);
        }
    },

    async estimateContext(req, res) {
        try {
            const { aiConfig, userMessage, userId } = req.body;
            if (!aiConfig) {
                return res.status(400).json({ message: 'AI config is required.' });
            }

            // Allow estimation without user for guests, or require user if preferred.
            // For now, let's allow it if we can get an API key.
            const apiKey = await getApiKeyForAi(aiConfig);

            let ragContext = '';
            if (apiKey && userMessage) {
                try {
                    const results = await weaviateService.search(aiConfig.modelType, aiConfig.id, userMessage, apiKey);
                    if (results?.length > 0) {
                        ragContext = "--- Relevant Information ---\n" + results.map(r => r.content).join('\n\n') + "\n--- End of Information ---\n\n";
                    }
                } catch (e) { console.warn("Weaviate search failed during estimation:", e.message); }
            }

            const systemPrompt = aiConfig.trainingContent || '';

            // Get detailed training data breakdown
            const dataSources = await trainingDataModel.findByAiIdForChat(aiConfig.id);
            let qaContext = '';
            let fileContext = '';
            let documentContext = '';

            for (const source of dataSources) {
                if (source.type === 'qa' && source.question && source.answer) {
                    qaContext += `Question: ${source.question}\nAnswer: ${source.answer}\n\n`;
                } else if (source.type === 'file') {
                    const content = source.summary || await fileParserService.extractText(source.fileUrl, source.fileName);
                    if (content) fileContext += `--- Content from file: ${source.fileName} ---\n${content}\n\n`;
                } else if (source.type === 'document') {
                    const content = source.summary || source.answer; // answer holds full content for docs
                    if (content) documentContext += `--- Content from document: ${source.fileName} ---\n${content}\n\n`;
                }
            }

            res.json({ systemPrompt, qaContext, fileContext, documentContext, ragContext });
        } catch (error) {
            res.status(500).json({ message: error.message || 'Failed to estimate context tokens.' });
        }
    },

    /**
     * Non-streaming endpoint for external APIs (Facebook, n8n, etc.)
     * Returns plain JSON response instead of Server-Sent Events
     */
    async sendMessageJson(req, res) {
        try {
            let { aiConfigId, message, language = 'vi' } = req.body;

            // Validate input
            if (!aiConfigId) {
                return res.status(400).json({ error: 'aiConfigId is required' });
            }
            if (!message || typeof message !== 'string') {
                return res.status(400).json({ error: 'message (string) is required' });
            }

            // Fetch AI config
            const aiConfig = await aiConfigModel.findById(aiConfigId);
            if (!aiConfig) {
                return res.status(404).json({ error: 'AI Config not found' });
            }

            // Convert message to messages array
            const messages = [{
                id: `msg-${Date.now()}`,
                sender: 'user',
                text: message,
                timestamp: Date.now()
            }];

            // Get API key
            const apiKey = await getApiKeyForAi(aiConfig);

            // Prepare messages with file attachment handling
            const finalMessages = [...messages];
            const lastMessage = finalMessages[finalMessages.length - 1];
            if (lastMessage.sender === 'user' && lastMessage.fileAttachment) {
                const { url, name } = lastMessage.fileAttachment;
                const text = await fileParserService.extractText(url, name);
                lastMessage.text = `File "${name}" content:\n${text}\n\nUser prompt: "${lastMessage.text || ''}"`;
                delete lastMessage.fileAttachment;
            }

            // Get RAG context
            let retrievedContext = '';
            const lastUserMessage = finalMessages.findLast(m => m.sender === 'user');
            if (lastUserMessage?.text && apiKey) {
                try {
                    const results = await weaviateService.search(aiConfig.modelType, aiConfig.id, lastUserMessage.text, apiKey);
                    if (results?.length > 0) {
                        retrievedContext = "--- Relevant Information ---\n" + results.map(r => r.content).join('\n\n') + "\n--- End of Information ---\n\n";
                    }
                } catch (e) {
                    console.warn("Weaviate search failed:", e.message);
                }
            }

            // Collect response
            let fullResponseText = '';
            let responseThought = null;
            let hasError = false;
            let errorMessage = '';

            const onChunk = (chunk) => {
                fullResponseText += chunk;
            };

            const onEnd = async (finalMessage) => {
                const { text, thought } = finalMessage;
                fullResponseText = text || fullResponseText;
                responseThought = thought;
            };

            const onError = (error) => {
                hasError = true;
                errorMessage = error.message || 'An error occurred';
            };

            // Call AI service
            const service = { gemini: geminiService, gpt: gptService, grok: grokService, vertex: vertexService }[aiConfig.modelType];
            if (!service) {
                return res.status(400).json({ error: `Unsupported model type: ${aiConfig.modelType}` });
            }

            await service.sendMessageStream(
                aiConfig,
                finalMessages.slice(-8),
                apiKey,
                { onChunk, onEnd, onError },
                language,
                retrievedContext
            );

            // Check for errors
            if (hasError) {
                return res.status(500).json({ error: errorMessage });
            }

            // Return plain JSON response
            res.json({
                message: fullResponseText,
                thought: responseThought || undefined
            });

        } catch (error) {
            console.error('External chat error:', error);
            res.status(500).json({
                error: error.message || 'An error occurred while processing your request'
            });
        }
    }
};