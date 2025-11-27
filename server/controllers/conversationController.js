// server/controllers/conversationController.js
import { conversationModel } from '../models/conversation.model.js';
import { userModel } from '../models/user.model.js';
import { pool } from '../db.js';

export const conversationController = {
    async getConversationsByUserId(req, res) {
        const { userId } = req.query;
        if (!userId) {
            return res.json([]);
        }
        try {
            const userIdString = Array.isArray(userId) ? userId[0] : userId;
            const conversations = await conversationModel.findByUserId(parseInt(userIdString, 10));
            res.json(conversations);
        } catch (error) {
            console.error("Error fetching conversations by user ID:", error);
            res.status(500).json({ message: 'Không thể tải lịch sử hội thoại.' });
        }
    },

    async getTrainedConversationsByAiId(req, res) {
        try {
            const aiId = parseInt(req.params.id, 10);
            if (isNaN(aiId)) return res.status(400).json({ message: 'Invalid AI ID.' });
            const conversations = await conversationModel.findTrainedByAiId(aiId);
            res.json(conversations);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch trained conversations.' });
        }
    },
    
    async getTestConversationsByAiId(req, res) {
        try {
            const aiId = parseInt(req.params.id, 10);
            const userId = req.user.id; // Get from authenticated user
            if (isNaN(aiId) || !userId) return res.status(400).json({ message: 'Invalid AI ID or missing User ID.' });
            const conversations = await conversationModel.findTestByAiId(aiId, userId);
            res.json(conversations);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch test conversations.' });
        }
    },
    
    async getLatestConversationByAiId(req, res) {
        const { userId } = req.body;
        try {
            if (!userId) return res.status(401).json({ message: 'User is required.' });
            const conversation = await conversationModel.findLatestByAiId(req.params.id, userId);
            res.json(conversation);
        } catch (error) {
            res.status(500).json({ message: 'Failed to get latest conversation.' });
        }
    },

    async getAllConversations(req, res) {
        try {
            const conversations = await conversationModel.findAll();
            res.json(conversations);
        } catch (error) {
            res.status(500).json({ message: 'Không thể tải tất cả hội thoại.' });
        }
    },

    async createConversation(req, res) {
        const { aiConfigId, messages, userId } = req.body;
        if (!aiConfigId || !messages || !userId) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }
        try {
            const user = await userModel.findById(userId);
            if (!user) return res.status(404).json({ message: 'User not found' });

            const newConv = await conversationModel.create({
                userId: userId,
                userName: user.name,
                aiConfigId: aiConfigId,
                messages: messages,
            });
            res.status(201).json(newConv);
        } catch (error) {
            res.status(500).json({ message: 'Failed to create conversation.' });
        }
    },

    async updateConversationMessages(req, res) {
        try {
            const { messages } = req.body;
            if (!messages) return res.status(400).json({ message: 'Messages are required.' });
            await conversationModel.update(req.params.id, messages);
            res.status(200).json({ message: 'Conversation updated successfully.' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi cập nhật hội thoại.' });
        }
    },
    
    async deleteConversation(req, res) {
        try {
            await conversationModel.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi xóa hội thoại.' });
        }
    },

    async renameConversation(req, res) {
        const { title } = req.body;
        if (!title) return res.status(400).json({ message: 'New title is required.' });
        try {
            const updatedConv = await conversationModel.rename(parseInt(req.params.id, 10), title);
            res.json(updatedConv);
        } catch (error) {
            res.status(500).json({ message: 'Failed to rename conversation.' });
        }
    },
    
    async updateConversationTrainingStatus(req, res) {
        const { isTrained } = req.body;
        if (typeof isTrained !== 'boolean') {
            return res.status(400).json({ message: 'isTrained (boolean) is required.' });
        }
        try {
            const updatedConv = await conversationModel.updateTrainingStatus(parseInt(req.params.id, 10), isTrained);
            res.json(updatedConv);
        } catch (error) {
            res.status(500).json({ message: 'Failed to update training status.' });
        }
    },
    
    async setMessageFeedback(req, res) {
        const { conversationId, messageId } = req.params;
        const { feedback } = req.body;

        if (!['liked', 'disliked', null].includes(feedback)) {
            return res.status(400).json({ message: 'Invalid feedback type.' });
        }
        
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const convoRes = await client.query('SELECT messages FROM conversations WHERE id = $1 FOR UPDATE', [conversationId]);
            if (convoRes.rows.length === 0) {
                return res.status(404).json({ message: 'Conversation not found.' });
            }

            const messages = convoRes.rows[0].messages;
            const messageIndex = messages.findIndex(m => String(m.id) === messageId);

            if (messageIndex === -1) {
                return res.status(404).json({ message: 'Message not found in conversation.' });
            }

            if (feedback === null) {
                delete messages[messageIndex].feedback;
            } else {
                messages[messageIndex].feedback = feedback;
            }

            // FIX: This line was missing. It saves the updated messages array back to the database.
            await client.query('UPDATE conversations SET messages = $1 WHERE id = $2', [JSON.stringify(messages), conversationId]);

            await client.query('COMMIT');
            res.status(200).json({ success: true, updatedMessage: messages[messageIndex] });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Error saving message feedback:", error);
            res.status(500).json({ message: 'Failed to save feedback.' });
        } finally {
            client.release();
        }
    },
};