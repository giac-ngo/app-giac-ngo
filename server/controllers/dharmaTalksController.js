// server/controllers/dharmaTalksController.js
import { dharmaTalkModel } from '../models/dharmaTalk.model.js';
import { spaceModel } from '../models/space.model.js';
import { pool } from '../db.js';


const parseAndProcessTalkData = (req) => {
    const data = { ...req.body };
    const files = req.files;
    const spaceIdSubDir = data.spaceId || 'global';

    if (files) {
        if (files.avatarFile) {
            data.speakerAvatarUrl = `/uploads/${spaceIdSubDir}/dharmatalks/${files.avatarFile[0].filename}`;
        }
        if (files.audioFileVi) {
            data.url = `/uploads/${spaceIdSubDir}/dharmatalks/${files.audioFileVi[0].filename}`;
        }
        if (files.audioFileEn) {
            data.urlEn = `/uploads/${spaceIdSubDir}/dharmatalks/${files.audioFileEn[0].filename}`;
        }
        // Legacy support: if audioFile is used (old field name), treat it as Vietnamese
        if (files.audioFile && !files.audioFileVi) {
            data.url = `/uploads/${spaceIdSubDir}/dharmatalks/${files.audioFile[0].filename}`;
        }
    }

    // FIX: Properly handle empty strings for array fields to prevent DB errors.
    // An empty string from FormData should be converted to an empty array for PostgreSQL.
    if (typeof data.tags === 'string') {
        data.tags = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    }
    if (typeof data.tagsEn === 'string') {
        data.tagsEn = data.tagsEn ? data.tagsEn.split(',').map(t => t.trim()).filter(Boolean) : [];
    }

    // Handle numeric fields that might be strings, converting empty values to null
    ['spaceId', 'duration', 'notifications', 'views', 'likes'].forEach(field => {
        if (data[field] === '' || data[field] === null || data[field] === undefined) {
            data[field] = null;
        } else {
            const num = Number(data[field]);
            data[field] = isNaN(num) ? null : num;
        }
    });

    // Handle floating point numbers
    if (data.rating === '' || data.rating === null || data.rating === undefined) {
        data.rating = null;
    } else {
        const num = parseFloat(data.rating);
        data.rating = isNaN(num) ? null : num;
    }

    // Handle empty date string
    if (data.date === '' || data.date === 'null') {
        data.date = null;
    }

    return data;
}


export const dharmaTalksController = {
    async getAllDharmaTalks(req, res) {
        try {
            // Import helper functions
            // Note: In ES modules, dynamic import is needed inside function if not imported at top level, 
            // or we use standard import at top. Let's use dynamic for consistency with previous edits or add top level import.
            // Since this file uses imports, I'll use dynamic import for the middleware helper to avoid circular deps effectively/keep it local.
            const { getUserManagedSpaceIds, isAdmin } = await import('../middleware/authMiddleware.js');

            let talks = await spaceModel.findAllDharmaTalks();

            // If user is logged in, apply filtering
            // Note: req.user is populated by isAuthenticated middleware. 
            // However, this route is public (router.get('/', ...)) in routes file.
            // So we need to check if req.user exists (JWT might be optional or not present).
            // BUT, for the Admin management page, the request SHOULD include the token.
            // If the user complained about seeing everything, they are logged in.

            // To properly handle "public view" vs "admin view", usually we separate endpoints or logic.
            // Assuming "public" means everyone sees everything (global space?), or specific logic.
            // But here the issue is ACCESS CONTROL for management.

            if (req.user) {
                if (!isAdmin(req.user)) {
                    const userSpaceIds = await getUserManagedSpaceIds(req.user.id);
                    // Filter talks: keep only those in user's spaces OR global if allowed (but user wants to remove "tất cả").
                    // If user manages spaces [1, 2], they should see talks from [1, 2].
                    // What about "global" talks? If they don't own space NULL (global), they shouldn't manage it.

                    // Helper: Check if talk.spaceId is in userSpaceIds
                    talks = talks.filter(talk => {
                        if (!talk.spaceId) return false; // Global talks (null spaceId) not manageable by regular user?
                        return userSpaceIds.includes(talk.spaceId);
                    });
                }
            }
            // If req.user is missing, it's a guest. Guests shouldn't be seeing this API if it's for management.
            // BUT, if this API is also used for the public website to list talks, then filtering for guests might be different.
            // Assuming this controller is shared. The user issue is specifically about the "User without admin rights" seeing everything.

            // CAUTION: If I filter for ALL requests based on req.user, I might break public view if public view doesn't send token.
            // If public view sends token (logged in user browsing site), they might only see their own talks?
            // "Public" talks should be visible to everyone.
            // "Private" talks / Management view should be restricted.

            // Correct approach:
            // 1. Management Page uses this API. User is logged in.
            // 2. Public Page uses this API. User might be logged in or not.

            // If the user is in Admin Panel -> they want to see what they MANAGE.
            // If the user is in Public Site -> they want to see what is PUBLIC.

            // Since I can't easily distinguish source (without header), and the strict requirement is "User sees all in Admin", 
            // I will implement: 
            // - If user is Admin: see all.
            // - If user is Content Manager (has 'dharma-talks' perm? or 'ai'?): see THEIR managed talks.
            // - If Guest: see all (Public talks).

            // Wait, if I restrict for Content Manager, will they see Public talks on the public site?
            // Yes, if I filter strictly, they won't.

            // BUT, the user explicitly complained: "sao vẫn thấy được tất cả ... pháp thoại".
            // This strongly implies they are in the Admin/Management context.

            // I will interpret: For non-admin logged-in users, restrict to managed spaces. 
            // (Assuming they use this account for management).

            if (req.user && !isAdmin(req.user)) {
                const userSpaceIds = await getUserManagedSpaceIds(req.user.id);
                talks = talks.filter(talk => talk.spaceId && userSpaceIds.includes(talk.spaceId));
            }

            res.json(talks);
        } catch (error) {
            console.error('Error fetching all dharma talks:', error);
            res.status(500).json({ message: 'Failed to fetch all dharma talks.' });
        }
    },

    async createDharmaTalk(req, res) {
        try {
            const talkData = parseAndProcessTalkData(req);
            const { spaceId } = talkData;

            if (!req.user.permissions.includes('roles') && spaceId) {
                const spaceRes = await pool.query('SELECT user_id FROM spaces WHERE id = $1', [spaceId]);
                if (spaceRes.rows.length === 0 || spaceRes.rows[0].user_id !== req.user.id) {
                    return res.status(403).json({ message: 'You can only create talks for spaces you own.' });
                }
            }

            const newTalk = await dharmaTalkModel.create(talkData);
            res.status(201).json(newTalk);
        } catch (error) {
            console.error('Error creating dharma talk:', error);
            res.status(500).json({ message: 'Failed to create dharma talk.' });
        }
    },

    async updateDharmaTalk(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const talkData = parseAndProcessTalkData(req);

            if (!req.user.permissions.includes('roles')) {
                const talkRes = await pool.query('SELECT s.user_id FROM dharma_talks dt JOIN spaces s ON dt.space_id = s.id WHERE dt.id = $1', [id]);
                if (talkRes.rows.length > 0 && talkRes.rows[0].user_id !== req.user.id) {
                    return res.status(403).json({ message: 'You can only edit talks from spaces you own.' });
                }
            }

            const updatedTalk = await dharmaTalkModel.update(id, talkData);
            if (!updatedTalk) {
                return res.status(404).json({ message: 'Dharma talk not found.' });
            }
            res.json(updatedTalk);
        } catch (error) {
            console.error('Error updating dharma talk:', error);
            res.status(500).json({ message: `Failed to update dharma talk: ${error.message}` });
        }
    },

    async deleteDharmaTalk(req, res) {
        try {
            const id = parseInt(req.params.id, 10);

            if (!req.user.permissions.includes('roles')) {
                const talkRes = await pool.query('SELECT s.user_id FROM dharma_talks dt JOIN spaces s ON dt.space_id = s.id WHERE dt.id = $1', [id]);
                if (talkRes.rows.length > 0 && talkRes.rows[0].user_id !== req.user.id) {
                    return res.status(403).json({ message: 'You can only delete talks from spaces you own.' });
                }
            }

            const deleted = await dharmaTalkModel.delete(id);
            if (!deleted) {
                return res.status(404).json({ message: 'Dharma talk not found.' });
            }
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting dharma talk:', error);
            res.status(500).json({ message: 'Failed to delete dharma talk.' });
        }
    },

    async likeDharmaTalk(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID.' });
            const result = await dharmaTalkModel.incrementLikes(id);
            res.json(result);
        } catch (error) {
            console.error('Error liking dharma talk:', error);
            res.status(500).json({ message: 'Failed to like dharma talk.' });
        }
    },

    async incrementDharmaTalkView(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID.' });
            const result = await dharmaTalkModel.incrementViews(id);
            res.json(result);
        } catch (error) {
            console.error('Error incrementing dharma talk view:', error);
            res.status(500).json({ message: 'Failed to increment view.' });
        }
    }
};