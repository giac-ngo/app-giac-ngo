// server/controllers/commentController.js
import { commentModel } from '../models/comment.model.js';
import { documentModel } from '../models/document.model.js';

export const commentController = {
    async postComment(req, res) {
        // Placeholder for user ID from auth middleware
        const MOCK_USER_ID = 2; 
        const { commentType, sourceId, content, parentId } = req.body;
        const userId = MOCK_USER_ID; 

        if (!userId) {
            return res.status(401).json({ message: 'You must be logged in to comment.' });
        }
        if (!commentType || !sourceId || !content) {
            return res.status(400).json({ message: 'Missing required fields for comment.' });
        }

        try {
            let sourceTitle = 'Unknown Source';
            if (commentType === 'document') {
                const doc = await documentModel.findById(parseInt(sourceId, 10));
                if (doc) sourceTitle = doc.title;
            }
            
            const newComment = await commentModel.create(userId, commentType, sourceId, sourceTitle, content, parentId);
            res.status(201).json(newComment);
        } catch (error) {
            res.status(500).json({ message: 'Failed to post comment.' });
        }
    },

    async getComments(req, res) {
        try {
            const { status, type } = req.query;
            const comments = await commentModel.findAll({ status, type });
            res.json(comments);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch comments.' });
        }
    },

    async updateCommentStatus(req, res) {
        const commentId = parseInt(req.params.id, 10);
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status.' });
        }
        try {
            const updatedComment = await commentModel.updateStatus(commentId, status);
            res.json(updatedComment);
        } catch (error) {
            res.status(500).json({ message: 'Failed to update comment status.' });
        }
    },

    async deleteComment(req, res) {
        const commentId = parseInt(req.params.id, 10);
        try {
            await commentModel.delete(commentId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete comment.' });
        }
    },
};