// server/index.js

// Set default NODE_ENV to 'production' if not specified.
// This is for the `npm start` script to work cross-platform.
// `nodemon` for `npm run dev` will set NODE_ENV to 'development'.
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
}

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import { db } from './db.js';
import { geminiService } from './services/geminiService.js';
import { gptService } from './services/gptService.js';
import { grokService } from './services/grokService.js';
import { fileParserService } from './services/fileParserService.js';


const app = express();
const port = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
const trainingDataDir = path.join(uploadsDir, 'training_data');
// Ensure upload directories exist
fs.mkdir(uploadsDir, { recursive: true });
fs.mkdir(trainingDataDir, { recursive: true });


app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Generic storage for things like logos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Specific storage for AI training data files
const trainingDataStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, trainingDataDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        // Use a safe filename on disk to prevent encoding issues on the filesystem.
        // The original, correctly-decoded filename will be stored in the database.
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});
const trainingUpload = multer({ storage: trainingDataStorage });


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

    let isMatch = false;
    const storedPassword = user.password;

    // Kiểm tra xem mật khẩu lưu có phải dạng scrypt không
    if (storedPassword.startsWith('scrypt:')) {
      const parts = storedPassword.split('$');
      if (parts.length !== 3) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
      }

      const [header, salt, hash] = parts;
      const headerParts = header.split(':');

      if (headerParts.length !== 4 || headerParts[0] !== 'scrypt') {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
      }

      const N = parseInt(headerParts[1], 10);
      const r = parseInt(headerParts[2], 10);
      const p = parseInt(headerParts[3], 10);

      const hashBuffer = Buffer.from(hash, 'hex');
      const keylen = hashBuffer.length;

      // Dùng đúng tham số scrypt trong Node.js
      const derivedKey = await new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, keylen, { N, r, p, maxmem: 64 * 1024 * 1024 }, (err, dk) => {
          if (err) return reject(err);
          resolve(dk);
        });
      });

      if (hashBuffer.length !== derivedKey.length) {
        isMatch = false;
      } else {
        isMatch = crypto.timingSafeEqual(hashBuffer, derivedKey);
      }

    } else {
      // Nếu không phải scrypt thì fallback sang bcrypt
      isMatch = await bcrypt.compare(password, storedPassword);
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    }

    const updatedUser = await db.checkSubscriptionStatus(user.id);
    res.json(mapAndSanitizeUser(updatedUser));

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
  }
});

export default app;

app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Tên, email, và mật khẩu là bắt buộc.' });
        }
        
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'Email đã được sử dụng.' });
        }
        
        const systemConfig = await db.getSystemConfig();
        const defaultTemplate = systemConfig?.template || 'w5g';

        const newUserPayload = {
            name,
            email,
            password,
            // Default values for new public registrations
            isAdmin: false, 
            isActive: true, 
            merits: 100, // Give some starting merits
            avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
            roleIds: [], // No special roles by default
            template: defaultTemplate
        };

        const newUser = await db.createUser(newUserPayload);
        res.status(201).json(mapAndSanitizeUser(newUser));
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        res.status(500).json({ message: `Lỗi khi tạo người dùng: ${error.message}` });
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
app.post('/api/ai-configs', async (req, res) => {
    const { userId } = req.body;
    try {
        let dbUser = null;
        if (userId) {
             dbUser = await db.getUserById(userId);
        }
        const configs = await db.getVisibleAiConfigsForUser(dbUser);
        res.json(configs);
    } catch (error) {
        console.error("Lỗi tải danh sách AI:", error);
        res.status(500).json({ message: 'Không thể tải danh sách AI.' });
    }
});

app.post('/api/ai-configs/manageable', async (req, res) => {
    const { userId } = req.body;
    try {
        if (!userId) {
            return res.status(401).json({ message: 'Yêu cầu xác thực.' });
        }
        const fullDbUser = await db.getUserById(userId);
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

app.post('/api/ai-configs/:id/latest-conversation', async (req, res) => {
    const { userId } = req.body;
    try {
        if (!userId) {
            return res.status(401).json({ message: 'User is required.' });
        }
        const conversation = await db.getLatestConversationByAiId(req.params.id, userId);
        res.json(conversation);
    } catch (error) {
        console.error('Error fetching latest conversation:', error);
        res.status(500).json({ message: 'Failed to get latest conversation.' });
    }
});

// AI Training Data Routes
app.get('/api/ai-configs/:id/training-data', async (req, res) => {
    try {
        const aiId = parseInt(req.params.id, 10);
        const dataSources = await db.getTrainingDataByAiId(aiId);
        res.json(dataSources);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch training data.' });
    }
});

app.post('/api/ai-configs/:id/training-data', trainingUpload.single('file'), async (req, res) => {
    try {
        const aiConfigId = parseInt(req.params.id, 10);
        const { type, question, answer } = req.body;
        
        if (type === 'file' && req.file) {
            // Re-encode filename from latin1 to utf8 to handle special characters correctly,
            // as this is a common issue with how some clients/middleware handle multipart uploads.
            const decodedFileName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

            const dataSource = await db.createTrainingDataSource({
                aiConfigId,
                type: 'file',
                fileName: decodedFileName,
                fileUrl: `/uploads/training_data/${req.file.filename}`,
            });
            res.status(201).json(dataSource);
        } else if (type === 'qa' && question && answer) {
             const dataSource = await db.createTrainingDataSource({
                aiConfigId,
                type: 'qa',
                question,
                answer,
            });
            res.status(201).json(dataSource);
        } else {
            res.status(400).json({ message: 'Invalid training data submission.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to create training data.' });
    }
});

app.delete('/api/training-data/:id', async (req, res) => {
    try {
        const dataSourceId = parseInt(req.params.id, 10);
        const deletedSource = await db.deleteTrainingDataSource(dataSourceId);
        
        if (deletedSource && deletedSource.type === 'file' && deletedSource.fileUrl) {
            const filePath = path.join(__dirname, deletedSource.fileUrl);
            await fs.unlink(filePath).catch(err => console.error(`Failed to delete file: ${filePath}`, err));
        }
        
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting training data:', error);
        res.status(500).json({ message: 'Failed to delete training data.' });
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

app.post('/api/conversations', async (req, res) => {
    const { aiConfigId, messages, userId } = req.body;
    if (!aiConfigId || !messages || !userId) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }
    try {
        const user = await db.getUserById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newConv = await db.createConversation({
            userId: userId,
            userName: user.name,
            aiConfigId: aiConfigId,
            messages: messages,
        });
        res.status(201).json(newConv);
    } catch (error) {
        console.error("Error creating conversation:", error);
        res.status(500).json({ message: 'Failed to create conversation.' });
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
    const { aiConfig, messages, userId, conversationId } = req.body;

    try {
        // Handle file attachment content
        if (messages && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.sender === 'user' && lastMessage.fileAttachment) {
                const { url, name } = lastMessage.fileAttachment;
                try {
                    const extractedText = await fileParserService.extractText(url, name);
                    if (extractedText) {
                        const originalPrompt = lastMessage.text || '';
                        lastMessage.text = `The user has uploaded a file named "${name}". Its content is:\n\n---\n\n${extractedText}\n\n---\n\nThe user's prompt regarding this file is: "${originalPrompt}"`;
                    } else {
                        lastMessage.text = (lastMessage.text || '') + `\n\n(Attachment "${name}" could not be read or is empty.)`;
                    }
                } catch (parseError) {
                    console.error('Error parsing attached file:', parseError);
                    lastMessage.text = (lastMessage.text || '') + `\n\n(Error processing attachment: ${name})`;
                }
                delete lastMessage.fileAttachment;
            }
        }
        
        const systemConfig = await db.getSystemConfig();
        let apiKey;
        let currentUser = null;

        if (userId) {
            currentUser = await db.checkSubscriptionStatus(userId);
            if (!currentUser) {
                 return res.status(401).json({ message: "User not found or invalid." });
            }
            apiKey = currentUser.apiKeys?.[aiConfig.modelType];
            if (!apiKey) {
                return res.status(400).json({ message: `Vui lòng thêm API key cá nhân cho ${aiConfig.modelType.toUpperCase()} trong Cài đặt để có thể trò chuyện.` });
            }
            const hasActiveSub = currentUser.subscriptionExpiresAt && new Date(currentUser.subscriptionExpiresAt) > new Date();
            if (aiConfig.requiresSubscription && !hasActiveSub) {
                return res.status(403).json({ message: "Gói của bạn đã hết hạn hoặc bạn chưa đăng ký gói. Vui lòng mua gói để sử dụng AI này." });
            }
        } else {
            const userMessagesCount = messages.filter(m => m.sender === 'user').length;
            if (userMessagesCount > systemConfig.guestMessageLimit) {
                 return res.status(403).json({ message: "Bạn đã hết lượt nhắn tin cho khách. Vui lòng đăng nhập." });
            }
            apiKey = systemConfig.systemKeys?.[aiConfig.modelType];
            if (!apiKey) {
                return res.status(400).json({ message: `API Key hệ thống cho ${aiConfig.modelType.toUpperCase()} chưa được cấu hình.` });
            }
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
            } else if (typeof aiConfig.id === 'number') { // Only save new convos for existing AIs
                const newConv = await db.createConversation({
                    userId: currentUser?.id || null,
                    userName: currentUser?.name || 'Guest',
                    aiConfigId: aiConfig.id,
                    messages: finalMessages,
                });
                finalConversationId = newConv.id;
            }
             
             res.write(`data: ${JSON.stringify({ conversationId: finalConversationId, done: true, fullResponse: fullResponse })}\n\n`);
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
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'User ID không hợp lệ.' });
        }

        // Sanitize payload to only include valid User fields before sending to DB
        const {
            email, name, password, avatarUrl, isAdmin, isActive, merits,
            apiToken, apiKeys, subscriptionPlanId, subscriptionExpiresAt,
            roleIds, template
        } = req.body;

        const cleanPayload = {
            email, name, password, avatarUrl, isAdmin, isActive, merits,
            apiToken, apiKeys, subscriptionPlanId, subscriptionExpiresAt,
            roleIds, template
        };

        // Remove properties that are undefined so they don't overwrite existing data with NULL
        Object.keys(cleanPayload).forEach(key => {
            if (cleanPayload[key] === undefined) {
                delete cleanPayload[key];
            }
        });

        const updatedUser = await db.updateUser(id, cleanPayload);
        res.json(mapAndSanitizeUser(updatedUser));
    } catch (error) {
        console.error("Lỗi khi cập nhật người dùng:", error);
        res.status(500).json({ message: 'Lỗi khi cập nhật người dùng.' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'User ID không hợp lệ.' });
        }
        await db.deleteUser(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa người dùng.' });
    }
});

app.post('/api/users/:id/regenerate-token', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'User ID không hợp lệ.' });
        }
        const updatedUser = await db.regenerateApiToken(id);
        res.json(mapAndSanitizeUser(updatedUser));
    } catch (error) {
        res.status(500).json({ message: `Lỗi khi tạo token mới: ${error.message}` });
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
        const id = parseInt(userId, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'User ID không hợp lệ.' });
        }
        const transactions = await db.getTransactionsByUserId(id);
        res.json(transactions);
    } catch (error) {
        console.error("Failed to fetch user transactions:", error);
        res.status(500).json({ message: 'Không thể tải lịch sử giao dịch của người dùng.' });
    }
});

app.post('/api/transactions/manual', async (req, res) => {
    const { userId, merits, adminId } = req.body;
    try {
        const updatedUser = await db.addMeritsToUser(userId, merits, adminId);
        res.json(mapAndSanitizeUser(updatedUser));
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi nạp merit.' });
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

app.post('/api/crypto/initiate-merit-purchase', async (req, res) => {
    const { userId, merits, crypto } = req.body;
    if (!userId || !merits || !crypto || merits <= 0) {
        return res.status(400).json({ message: 'Yêu cầu không hợp lệ.' });
    }
    try {
        const amount = (merits * MOCK_CRYPTO_RATES[crypto]).toFixed(6);
        const mockTxId = `crypto_tx_${Date.now()}`;
        
        mockCryptoTransactions[mockTxId] = { userId, merits };

        res.json({
            paymentAddress: MOCK_CRYPTO_ADDRESS,
            amount,
            currency: crypto,
            transactionId: mockTxId,
        });
    } catch (error) {
        res.status(500).json({ message: 'Không thể khởi tạo thanh toán nạp merit.' });
    }
});


app.post('/api/crypto/confirm', async (req, res) => {
    const { userId, transactionId } = req.body;
    const tx = mockCryptoTransactions[transactionId];

    if (!tx || tx.userId !== userId) {
        return res.status(400).json({ message: 'Invalid transaction.' });
    }
    
    try {
        const updatedUser = await db.addMeritsToUser(userId, tx.merits, null, 'crypto');
        delete mockCryptoTransactions[transactionId];
        res.json(mapAndSanitizeUser(updatedUser));
    } catch(error) {
        res.status(500).json({ message: 'Failed to confirm payment.' });
    }
});


// File Upload (Generic for logos etc.)
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
    
    // This endpoint is for the admin panel, so a user must be specified.
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    try {
        const userIdString = Array.isArray(userId) ? userId[0] : userId;
        const user = await db.getUserById(parseInt(userIdString));
        const apiKey = user?.apiKeys?.[provider];

        if (!apiKey) {
            return res.status(400).json({ message: `Vui lòng thêm API key cá nhân cho ${provider.toUpperCase()} trong Cài đặt để tạo AI.` });
        }
        
        const models = await gptService.listModels(apiKey);
        res.json(models);

    } catch (error) {
        console.error("Failed to fetch GPT models:", error);
        res.status(500).json({ message: `Failed to fetch models from OpenAI: ${error.message}` });
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

// --- Static file serving & fallback ---
app.use('/uploads', express.static(uploadsDir));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});