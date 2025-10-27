// server/index.js
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

import { db } from './db.js';
import { geminiService } from './services/geminiService.js';
import { gptService } from './services/gptService.js';
import { grokService } from './services/grokService.js';

const app = express();
const port = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../dist')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const mapAndSanitizeUser = (user) => {
    if (!user) return null;
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
};

// --- API Routes ---

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.getUserByEmail(email);
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Tài khoản không hợp lệ hoặc đã bị vô hiệu hóa.' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
        }
        
        const updatedUser = await db.checkSubscriptionStatus(user.id);

        res.json(mapAndSanitizeUser(updatedUser));
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
    }
});

app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const stats = await db.getDashboardStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Không thể tải dữ liệu dashboard.' });
    }
});

app.get('/api/system-config', async (req, res) => {
    try {
        const config = await db.getSystemConfig();
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Không thể tải cấu hình hệ thống.' });
    }
});

app.put('/api/system-config', async (req, res) => {
    try {
        const updatedConfig = await db.updateSystemConfig(req.body);
        res.json(updatedConfig);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật cấu hình hệ thống.' });
    }
});

// AI Configs
// Endpoint for ChatPage: gets PUBLIC AIs based on user's status
app.post('/api/ai-configs', async (req, res) => {
    const { user } = req.body;
    try {
        let dbUser = null;
        if (user && user.id) {
             dbUser = await db.getUserById(user.id);
        }
        const configs = await db.getVisibleAiConfigsForUser(dbUser);
        res.json(configs);
    } catch (error) {
        console.error("Lỗi tải danh sách AI:", error);
        res.status(500).json({ message: 'Không thể tải danh sách AI.' });
    }
});

// Endpoint for AdminPage: gets manageable AIs based on user's role
app.post('/api/ai-configs/manageable', async (req, res) => {
    const { user } = req.body;
    try {
        if (!user || !user.id) {
            return res.status(401).json({ message: 'Yêu cầu xác thực.' });
        }
        // The user object passed from client might not have permissions fully resolved
        const fullDbUser = await db.getUserById(user.id);
        if (!fullDbUser) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }
        const configs = await db.getManageableAiConfigsForUser(fullDbUser);
        res.json(configs);
    } catch (error) {
        console.error("Lỗi tải danh sách AI có thể quản lý:", error);
        res.status(500).json({ message: 'Không thể tải danh sách AI để quản lý.' });
    }
});

app.post('/api/ai-configs/create', async (req, res) => {
    try {
        const newConfig = await db.createAiConfig(req.body);
        res.status(201).json(newConfig);
    } catch (error) {
        console.error("Lỗi tạo AI:", error);
        res.status(500).json({ message: 'Lỗi khi tạo AI mới.' });
    }
});

app.put('/api/ai-configs/:id', async (req, res) => {
    try {
        const updatedConfig = await db.updateAiConfig(req.params.id, req.body);
        res.json(updatedConfig);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật AI.' });
    }
});

app.delete('/api/ai-configs/:id', async (req, res) => {
    try {
        await db.deleteAiConfig(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa AI.' });
    }
});

app.post('/api/ai-configs/:id/train', async (req, res) => {
    try {
        const { content } = req.body;
        const aiId = req.params.id;
        await db.addTrainingContentToAi(aiId, content);
        res.json({ message: `Đã thêm nội dung huấn luyện cho AI ${aiId}` });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi huấn luyện AI.' });
    }
});

// Conversations
app.get('/api/conversations', async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.json([]);
    }
    try {
        const userIdString = Array.isArray(userId) ? userId[0] : userId;
        const conversations = await db.getConversationsByUserId(parseInt(userIdString, 10));
        res.json(conversations);
    } catch (error) {
        console.error("Error fetching conversations by user ID:", error);
        res.status(500).json({ message: 'Không thể tải lịch sử hội thoại.' });
    }
});

app.get('/api/conversations/all', async (req, res) => {
    try {
        const conversations = await db.getAllConversations();
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: 'Không thể tải tất cả hội thoại.' });
    }
});

app.delete('/api/conversations/:id', async (req, res) => {
    try {
        await db.deleteConversation(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa hội thoại.' });
    }
});

app.put('/api/conversations/:id', async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages) {
            return res.status(400).json({ message: 'Messages are required.' });
        }
        await db.updateConversation(req.params.id, messages);
        res.status(200).json({ message: 'Conversation updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật hội thoại.' });
    }
});

// Chat Streaming
app.post('/api/chat/stream', async (req, res) => {
    const { aiConfig, messages, user, conversationId } = req.body;

    try {
        let currentUser = user;
        if (user && user.id) {
            currentUser = await db.checkSubscriptionStatus(user.id);
        }

        const hasActiveSub = currentUser && currentUser.subscriptionExpiresAt && new Date(currentUser.subscriptionExpiresAt) > new Date();
        if (aiConfig.requiresSubscription && !hasActiveSub) {
            return res.status(403).json({ message: "Gói của bạn đã hết hạn hoặc bạn chưa đăng ký gói. Vui lòng mua gói để sử dụng AI này." });
        }

        const systemConfig = await db.getSystemConfig();
        let apiKey;
        
        let keyLookupUser = currentUser;
        if (currentUser && currentUser.isAdmin && aiConfig.ownerId) {
            const owner = await db.getUserById(aiConfig.ownerId);
            if (owner) keyLookupUser = owner;
        }
        
        if (keyLookupUser && keyLookupUser.apiKeys && keyLookupUser.apiKeys[aiConfig.modelType]) {
            apiKey = keyLookupUser.apiKeys[aiConfig.modelType];
        } else {
            apiKey = systemConfig.systemKeys[aiConfig.modelType];
        }

        if (!apiKey) {
            return res.status(400).json({ message: `API Key for ${aiConfig.modelType} is not configured.` });
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const onChunk = (chunk) => res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);

        const onEnd = async (fullResponse) => {
            let finalConversationId = conversationId;
            const finalMessages = [...messages, { text: fullResponse, sender: 'ai', timestamp: Date.now() }];
            if (conversationId) {
                await db.updateConversation(conversationId, finalMessages);
            } else {
                const newConv = await db.createConversation({
                    userId: currentUser?.id || null,
                    userName: currentUser?.name || 'Guest',
                    aiConfigId: aiConfig.id,
                    messages: finalMessages,
                });
                finalConversationId = newConv.id;
            }
             
            let updatedUserCoins = undefined;
            if (currentUser && !hasActiveSub) { // Only deduct if no active sub
                const updatedUser = await db.deductCoinFromUser(currentUser.id);
                if(updatedUser) updatedUserCoins = updatedUser.coins;
            }

             res.write(`data: ${JSON.stringify({ conversationId: finalConversationId, done: true, newCoinCount: updatedUserCoins, fullResponse: fullResponse })}\n\n`);
             res.end();
        };

        const onError = (error) => {
            console.error("Streaming error:", error);
            let userMessage = error.message;
            if (error.message.toLowerCase().includes('api key')) {
                userMessage = `Lỗi API Key cho nhà cung cấp ${aiConfig.modelType.toUpperCase()}. Vui lòng kiểm tra lại API Key.`;
            }
            res.write(`data: ${JSON.stringify({ error: userMessage })}\n\n`);
            res.end();
        };

        const service = { gemini: geminiService, gpt: gptService, grok: grokService }[aiConfig.modelType];
        if (!service) {
            onError(new Error(`Unsupported model type: ${aiConfig.modelType}`));
            return;
        }

        service.sendMessageStream(aiConfig, messages, apiKey, { onChunk, onEnd, onError });

    } catch (error) {
        console.error('Error in chat stream endpoint:', error);
        res.status(500).end();
    }
});

// Users
app.get('/api/users', async (req, res) => {
    try {
        const users = await db.getAllUsers();
        res.json(users.map(mapAndSanitizeUser));
    } catch (error) {
        res.status(500).json({ message: 'Không thể tải danh sách người dùng.' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const newUser = await db.createUser(req.body);
        res.status(201).json(mapAndSanitizeUser(newUser));
    } catch (error) {
        res.status(500).json({ message: `Lỗi khi tạo người dùng: ${error.message}` });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const updatedUser = await db.updateUser(req.params.id, req.body);
        res.json(mapAndSanitizeUser(updatedUser));
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật người dùng.' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await db.deleteUser(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa người dùng.' });
    }
});

// --- Role-Based Access Control (RBAC) ---
app.get('/api/roles', async (req, res) => {
    try {
        const roles = await db.getAllRoles();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Không thể tải danh sách quyền.' });
    }
});

app.post('/api/roles', async (req, res) => {
    try {
        const newRole = await db.createRole(req.body);
        res.status(201).json(newRole);
    } catch (error) {
        res.status(500).json({ message: `Lỗi khi tạo quyền mới: ${error.message}` });
    }
});

app.put('/api/roles/:id', async (req, res) => {
    try {
        const updatedRole = await db.updateRole(req.params.id, req.body);
        res.json(updatedRole);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật quyền.' });
    }
});

app.delete('/api/roles/:id', async (req, res) => {
    try {
        await db.deleteRole(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa quyền.' });
    }
});


// Transactions & Subscriptions
app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await db.getAllTransactions();
        res.json(transactions);
    } catch (error) {
        console.error("Failed to fetch transactions:", error);
        res.status(500).json({ message: 'Không thể tải lịch sử giao dịch.' });
    }
});

app.get('/api/transactions/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (isNaN(parseInt(userId))) {
            return res.status(400).json({ message: 'User ID không hợp lệ.' });
        }
        const transactions = await db.getTransactionsByUserId(parseInt(userId));
        res.json(transactions);
    } catch (error) {
        console.error("Failed to fetch user transactions:", error);
        res.status(500).json({ message: 'Không thể tải lịch sử giao dịch của người dùng.' });
    }
});

app.post('/api/transactions/manual', async (req, res) => {
    const { userId, coins, adminId } = req.body;
    try {
        const updatedUser = await db.addCoinsToUser(userId, coins, adminId);
        res.json(mapAndSanitizeUser(updatedUser));
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi nạp coin.' });
    }
});

app.post('/api/subscriptions/purchase', async (req, res) => {
    const { userId, planId } = req.body;
    try {
        const updatedUser = await db.purchaseSubscription(userId, planId);
        res.json(mapAndSanitizeUser(updatedUser));
    } catch (error) {
        console.error("Purchase error:", error);
        res.status(400).json({ message: error.message || 'Lỗi khi mua gói.' });
    }
});

// Crypto Payments (Mocked)
const MOCK_CRYPTO_RATES = {
    USDT: 0.1,
    USDC: 0.1,
    ETH: 0.00003,
};
const MOCK_CRYPTO_ADDRESS = '0x1234567890123456789012345678901234567890';
let mockCryptoTransactions = {};

app.post('/api/crypto/initiate-coin-purchase', async (req, res) => {
    const { userId, coins, crypto } = req.body;
    if (!userId || !coins || !crypto || coins <= 0) {
        return res.status(400).json({ message: 'Yêu cầu không hợp lệ.' });
    }
    try {
        const amount = (coins * MOCK_CRYPTO_RATES[crypto]).toFixed(6);
        const mockTxId = `crypto_tx_${Date.now()}`;
        
        mockCryptoTransactions[mockTxId] = { userId, coins };

        res.json({
            paymentAddress: MOCK_CRYPTO_ADDRESS,
            amount,
            currency: crypto,
            transactionId: mockTxId,
        });
    } catch (error) {
        res.status(500).json({ message: 'Không thể khởi tạo thanh toán nạp coin.' });
    }
});


app.post('/api/crypto/confirm', async (req, res) => {
    const { userId, transactionId } = req.body;
    const tx = mockCryptoTransactions[transactionId];

    if (!tx || tx.userId !== userId) {
        return res.status(400).json({ message: 'Invalid transaction.' });
    }
    
    try {
        const updatedUser = await db.addCoinsToUser(userId, tx.coins, null, 'crypto');
        delete mockCryptoTransactions[transactionId];
        res.json(mapAndSanitizeUser(updatedUser));
    } catch(error) {
        res.status(500).json({ message: 'Failed to confirm payment.' });
    }
});


// File Upload
app.post('/api/upload', upload.array('trainingFiles', 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    const filePaths = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ filePaths });
});

// OpenAI Models
app.get('/api/models/:provider', async (req, res) => {
    const { provider } = req.params;
    const { userId } = req.query;

    if (provider !== 'gpt') {
        return res.status(400).json({ message: 'Only GPT provider is supported for dynamic model listing.' });
    }

    try {
        let apiKey;
        if (userId) {
            const userIdString = Array.isArray(userId) ? userId[0] : userId;
            const user = await db.getUserById(parseInt(userIdString));
            apiKey = user?.apiKeys?.gpt;
        }
        
        if (!apiKey) {
            const systemConfig = await db.getSystemConfig();
            apiKey = systemConfig.systemKeys.gpt;
        }

        if (!apiKey) {
            return res.status(400).json({ message: 'API Key for GPT is not configured.' });
        }
        const models = await gptService.listModels(apiKey);
        res.json(models);

    } catch (error) {
        console.error("Failed to fetch GPT models:", error);
        res.status(500).json({ message: 'Failed to fetch models from OpenAI.' });
    }
});

// Pricing Plans
app.get('/api/pricing-plans', async (req, res) => {
    try {
        const plans = await db.getPricingPlans();
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Không thể tải danh sách gói giá.' });
    }
});

app.post('/api/pricing-plans', async (req, res) => {
    try {
        const newPlan = await db.createPricingPlan(req.body);
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo gói giá mới.' });
    }
});

app.put('/api/pricing-plans/:id', async (req, res) => {
    try {
        const updatedPlan = await db.updatePricingPlan(req.params.id, req.body);
        res.json(updatedPlan);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật gói giá.' });
    }
});

app.delete('/api/pricing-plans/:id', async (req, res) => {
    try {
        await db.deletePricingPlan(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa gói giá.' });
    }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});