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
        // FIX: Use authenticated user from req.user instead of userId from body to prevent impersonation.
        const { aiConfig, messages, conversationId, isTestChat, language, clientAiMessageId } = req.body;
        const userId = req.user ? req.user.id : req.body.userId; // Fallback for guest/unauthenticated users if allowed.

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

            if (!userId) {
                return onError(new Error("Authentication is required to chat. Please log in."));
            }

            const currentUser = await userModel.findById(userId);
            if (!currentUser) return onError(new Error("User not found."));

            let retrievedContext = '';
            let requestChargeMethod = 'none'; // 'none', 'ai_specific', 'subscription', 'merit_cost'

            if (!isTestChat) {
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
            }
            
            const apiKey = await getApiKeyForAi(aiConfig);

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
                        const newConv = await conversationModel.create({
                            userId: currentUser?.id || null, userName: currentUser?.name || 'Guest',
                            aiConfigId: aiConfig.id, messages: allFinalMessages, isTestChat,
                        });
                        finalConvId = newConv.id;
                    }
                    
                    let updatedUser = null;
                     if (userId && !isTestChat) {
                         switch (requestChargeMethod) {
                            case 'ai_specific':
                                await aiConfigModel.decrementUserRequestCount(userId, aiConfig.id);
                                updatedUser = await userModel.findById(userId); // Re-fetch user to get the latest state
                                break;
                            case 'subscription':
                                updatedUser = await userModel.deductRequest(userId);
                                break;
                            case 'merit_cost':
                                updatedUser = await billingModel.addMerits(userId, -aiConfig.meritCost, null, 'ai_usage');
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

            const service = { gemini: geminiService, gpt: gptService, grok: grokService }[aiConfig.modelType];
            if (!service) return onError(new Error(`Unsupported model type: ${aiConfig.modelType}`));
            
            service.sendMessageStream(aiConfig, finalMessages.slice(-8), apiKey, { onChunk, onEnd, onError }, language, retrievedContext);
        } catch (error) {
            onError(error);
        }
    },
    
    async estimateContext(req, res) {
        try {
            const { aiConfig, userMessage, userId } = req.body;
            if (!aiConfig || !userId) {
                return res.status(400).json({ message: 'AI config and user ID are required.' });
            }
            const user = await userModel.findById(userId);
            if (!user) return res.status(404).json({ message: 'User not found.' });
            
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
    }
};
