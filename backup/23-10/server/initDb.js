// server/initDb.js
import { db } from './db.js';
import 'dotenv/config';
import bcrypt from 'bcrypt';

const initialData = {
  users: [
    { id: 1, email: 'admin@giacngo.ai', password: 'password', name: 'Admin', avatarUrl: 'https://i.pravatar.cc/150?u=admin', isAdmin: true, coins: null, isActive: true, apiKeys: { gemini: 'AIzaSyDR2CNP5DetL3A2C9CGVnUsNEJgUZjxaDc', gpt: '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', grok: '' }, subscriptionPlanId: null, subscriptionExpiresAt: null },
    { id: 2, email: 'user@example.com', password: 'password', name: 'User', avatarUrl: 'https://i.pravatar.cc/150?u=user', isAdmin: false, coins: 100, isActive: true, apiKeys: { gemini: '', gpt: '', grok: '' }, subscriptionPlanId: 2, subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // Active sub for testing
    { id: 3, email: 'expired', password: 'password', name: 'Expired User', avatarUrl: 'https://i.pravatar.cc/150?u=expired', isAdmin: false, coins: 40, isActive: true, apiKeys: { gemini: '', gpt: '', grok: '' }, subscriptionPlanId: null, subscriptionExpiresAt: null },
    { id: 4, email: 'disabled', password: 'password', name: 'Disabled User', avatarUrl: 'https://i.pravatar.cc/150?u=disabled', isAdmin: false, coins: 50, isActive: false, apiKeys: { gemini: '', gpt: '', grok: '' }, subscriptionPlanId: null, subscriptionExpiresAt: null },
  ],
  aiConfigs: [
    {
        id: 1,
        name: "Trợ lý Marketing (Dùng thử)",
        description: "AI chuyên gia về marketing, giúp bạn lên ý tưởng chiến dịch, viết nội dung quảng cáo và phân tích xu hướng thị trường. Dành cho người dùng thử.",
        avatarUrl: 'https://i.pravatar.cc/150?u=marketing-ai',
        modelType: "gemini",
        modelName: "gemini-2.5-flash",
        trainingContent: "Bạn là một chuyên gia marketing kỹ thuật số với 10 năm kinh nghiệm. Cung cấp các chiến lược, ý tưởng và nội dung marketing sáng tạo, hiệu quả và dựa trên dữ liệu. Luôn cập nhật các xu hướng mới nhất về SEO, social media, và content marketing.",
        suggestedQuestions: ["Lên ý tưởng 5 tiêu đề bài blog về AI", "Viết một bài đăng Facebook quảng cáo sản phẩm X", "Phân tích SWOT cho một quán cà phê nhỏ"],
        tags: ["marketing", "seo", "content"],
        isPublic: true,
        ownerId: 1,
        isTrialAllowed: true,
        requiresSubscription: false,
    },
    {
        id: 2,
        name: "AI Viết Content (Yêu cầu gói)",
        description: "Trợ thủ đắc lực cho việc sáng tạo nội dung. Viết bài blog, kịch bản, email, và nhiều hơn nữa với văn phong chuyên nghiệp. Yêu cầu gói thuê bao đang hoạt động.",
        avatarUrl: 'https://i.pravatar.cc/150?u=writing-ai',
        modelType: "gemini",
        modelName: "gemini-2.5-pro",
        trainingContent: "Bạn là một người viết nội dung chuyên nghiệp, có khả năng sản xuất văn bản chất lượng cao, độc đáo và hấp dẫn ở nhiều định dạng khác nhau. Văn phong của bạn linh hoạt, từ học thuật đến thân thiện, tùy theo yêu cầu. Luôn đảm bảo không có lỗi ngữ pháp và chính tả.",
        suggestedQuestions: ["Viết dàn ý cho bài blog về 'Tương lai của làm việc từ xa'", "Soạn một email cảm ơn khách hàng", "Viết một đoạn mở đầu hấp dẫn cho video YouTube"],
        tags: ["viết lách", "sáng tạo", "blog"],
        isPublic: true,
        ownerId: 1,
        isTrialAllowed: false,
        requiresSubscription: true,
    },
    {
        id: 3,
        name: "Tâm An (Dùng thử)",
        description: "Một người bạn đồng hành trên con đường chữa lành, giúp bạn tìm lại sự bình an và kết nối với chính mình. AI này dành cho người dùng thử.",
        avatarUrl: '/uploads/ongbut.svg',
        modelType: "gemini",
        modelName: "gemini-2.5-flash",
        trainingContent: "Bạn là một trợ lý AI mang tên Tâm An, chuyên về chữa lành, bình an nội tâm và phát triển bản thân. Hãy trò chuyện với người dùng một cách nhẹ nhàng, đồng cảm và sâu sắc. Sử dụng ngôn từ tích cực, mang tính xây dựng và khích lệ. Mục tiêu của bạn là giúp họ tìm thấy sự kết nối với chính mình và vượt qua những khó khăn về tinh thần.",
        suggestedQuestions: ["Làm sao để buông bỏ quá khứ?", "Cách đối diện với nỗi sợ?"],
        tags: ["chữa lành", "tâm lý", "bình an"],
        isPublic: true,
        ownerId: 1,
        isTrialAllowed: false,
        requiresSubscription: false,
    }
  ],
  transactions: [
     { id: 1, userId: 2, adminId: 1, coins: 100, type: 'manual' },
     { id: 2, userId: 3, adminId: 1, coins: 40, type: 'manual' },
     { id: 3, userId: 4, adminId: 1, coins: 50, type: 'manual' },
  ],
  systemConfig: {
      guestMessageLimit: 10,
      template: 'giacngo',
      templateSettings: {
        w5g: { logoUrl: '/themes/w5g/logo.svg' },
        giacngo: { logoUrl: '/themes/giacngo/logo.svg' }
      },
      systemKeys: {
          gemini: 'AIzaSyDR2CNP5DetL3A2C9CGVnUsNEJgUZjxaDc',
          gpt: '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',
          grok: process.env.GROK_API_KEY || '',
      }
  },
  pricingPlans: [
      { id: 1, planName: 'Gói Dùng Thử', price: 'Miễn phí', coinCost: 0, durationDays: 7, features: ['Sử dụng trong 7 ngày', 'Truy cập các AI "Dùng thử"'], isActive: true },
      { id: 2, planName: 'Gói Khai Tâm', price: '50 Coins', coinCost: 50, durationDays: 30, features: ['Thời hạn 30 ngày', 'Truy cập tất cả AI tiêu chuẩn', 'Lịch sử trò chuyện'], isActive: true },
      { id: 3, planName: 'Gói Minh Triết', price: '120 Coins', coinCost: 120, durationDays: 90, features: ['Thời hạn 90 ngày', 'Tiết kiệm hơn 20%', 'Truy cập tất cả AI', 'Hỗ trợ ưu tiên'], isActive: true },
      { id: 4, planName: 'Gói Vô Vi', price: 'Liên hệ', coinCost: 9999, durationDays: 365, features: ['Dành cho doanh nghiệp', 'Truy cập không giới hạn', 'Tùy chỉnh AI riêng', 'Hỗ trợ chuyên sâu'], isActive: true },
  ],
  roles: [
      { id: 1, name: 'Super Admin', permissions: ['dashboard', 'ai', 'users', 'roles', 'conversations', 'pricing', 'user-billing', 'manual-billing', 'templates', 'finetune', 'settings'] },
      { id: 2, name: 'Quản lý Nội dung', permissions: ['ai', 'conversations', 'finetune'] },
  ],
  userRoles: [
      { userId: 1, roleId: 1 }, // Super Admin user has the Super Admin role
      { userId: 2, roleId: 2 }, // Normal user has the Content Manager role
  ]
};

const createTables = async () => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Xóa các bảng cũ nếu tồn tại...');
        await client.query('DROP TABLE IF EXISTS users, ai_configs, transactions, system_config, conversations, pricing_plans, roles, user_roles, training_data_sources CASCADE;');

        console.log('Tạo bảng pricing_plans...');
        await client.query(`
            CREATE TABLE pricing_plans (
                id SERIAL PRIMARY KEY,
                plan_name VARCHAR(255) NOT NULL,
                price VARCHAR(100) NOT NULL,
                coin_cost INTEGER NOT NULL,
                duration_days INTEGER,
                features TEXT[] NOT NULL,
                is_active BOOLEAN DEFAULT true
            );
        `);

        console.log('Tạo bảng users...');
        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name VARCHAR(255) NOT NULL,
                avatar_url TEXT,
                is_admin BOOLEAN DEFAULT false,
                is_active BOOLEAN DEFAULT true,
                coins INTEGER,
                api_token TEXT UNIQUE,
                api_keys JSONB,
                subscription_plan_id INTEGER REFERENCES pricing_plans(id) ON DELETE SET NULL,
                subscription_expires_at TIMESTAMPTZ
            );
        `);

        console.log('Tạo bảng roles...');
        await client.query(`
            CREATE TABLE roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                permissions TEXT[]
            );
        `);

        console.log('Tạo bảng user_roles...');
        await client.query(`
            CREATE TABLE user_roles (
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
                PRIMARY KEY (user_id, role_id)
            );
        `);

        console.log('Tạo bảng ai_configs...');
        await client.query(`
            CREATE TABLE ai_configs (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                avatar_url TEXT,
                model_type VARCHAR(50) NOT NULL,
                model_name VARCHAR(255),
                training_content TEXT,
                suggested_questions TEXT[],
                tags TEXT[],
                is_public BOOLEAN DEFAULT false,
                owner_id INTEGER REFERENCES users(id),
                is_trial_allowed BOOLEAN DEFAULT false,
                requires_subscription BOOLEAN DEFAULT false
            );
        `);

        console.log('Tạo bảng training_data_sources...');
        await client.query(`
            CREATE TABLE training_data_sources (
                id SERIAL PRIMARY KEY,
                ai_config_id INTEGER NOT NULL REFERENCES ai_configs(id) ON DELETE CASCADE,
                type VARCHAR(20) NOT NULL, -- 'qa' or 'file'
                question TEXT, -- For qa
                answer TEXT, -- For qa
                file_name TEXT, -- For file
                file_url TEXT, -- For file
                description TEXT,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                is_trained BOOLEAN DEFAULT false
            );
        `);
        
        console.log('Tạo bảng transactions...');
        await client.query(`
            CREATE TABLE transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                coins INTEGER NOT NULL,
                timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                type VARCHAR(50)
            );
        `);
        
        console.log('Tạo bảng system_config...');
        await client.query(`
            CREATE TABLE system_config (
                id SERIAL PRIMARY KEY,
                guest_message_limit INTEGER NOT NULL,
                system_keys JSONB,
                template VARCHAR(50),
                template_settings JSONB
            );
        `);
        
        console.log('Tạo bảng conversations...');
        await client.query(`
            CREATE TABLE conversations (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                user_name VARCHAR(255),
                ai_config_id INTEGER REFERENCES ai_configs(id),
                start_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                messages JSONB
            );
        `);

        console.log('Đang chèn dữ liệu ban đầu...');
        
        for (const plan of initialData.pricingPlans) {
            await client.query(
                'INSERT INTO pricing_plans (id, plan_name, price, coin_cost, duration_days, features, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [plan.id, plan.planName, plan.price, plan.coinCost, plan.durationDays, plan.features, plan.isActive]
            );
        }
        await client.query("SELECT setval('pricing_plans_id_seq', (SELECT MAX(id) FROM pricing_plans));");

        const saltRounds = 10;
        for (const user of initialData.users) {
            const hashedPassword = bcrypt.hashSync(user.password, saltRounds);
            await client.query(
                'INSERT INTO users (id, email, password, name, avatar_url, is_admin, is_active, coins, api_keys, subscription_plan_id, subscription_expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
                [user.id, user.email, hashedPassword, user.name, user.avatarUrl, user.isAdmin, user.isActive, user.coins, user.apiKeys, user.subscriptionPlanId, user.subscriptionExpiresAt]
            );
        }
        await client.query("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));");

        for (const role of initialData.roles) {
            await client.query('INSERT INTO roles (id, name, permissions) VALUES ($1, $2, $3)', [role.id, role.name, role.permissions]);
        }
        await client.query("SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));");

        for (const userRole of initialData.userRoles) {
            await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [userRole.userId, userRole.roleId]);
        }

        for (const config of initialData.aiConfigs) {
            await client.query(
                `INSERT INTO ai_configs (id, name, description, avatar_url, model_type, model_name, training_content, suggested_questions, tags, is_public, owner_id, is_trial_allowed, requires_subscription) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                [config.id, config.name, config.description, config.avatarUrl, config.modelType, config.modelName, config.trainingContent, config.suggestedQuestions, config.tags, config.isPublic, config.ownerId, config.isTrialAllowed, config.requiresSubscription]
            );
        }
        await client.query("SELECT setval('ai_configs_id_seq', (SELECT MAX(id) FROM ai_configs));");

        for (const trans of initialData.transactions) {
            await client.query(
                'INSERT INTO transactions (id, user_id, admin_id, coins, type) VALUES ($1, $2, $3, $4, $5)',
                [trans.id, trans.userId, trans.adminId, trans.coins, trans.type]
            );
        }
        await client.query("SELECT setval('transactions_id_seq', (SELECT MAX(id) FROM transactions));");
        
        await client.query(
            'INSERT INTO system_config (guest_message_limit, system_keys, template, template_settings) VALUES ($1, $2, $3, $4)',
            [initialData.systemConfig.guestMessageLimit, initialData.systemConfig.systemKeys, initialData.systemConfig.template, initialData.systemConfig.templateSettings]
        );
        
        await client.query('COMMIT');
        console.log('Khởi tạo database thành công!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Lỗi khi khởi tạo database:', e);
    } finally {
        client.release();
        process.exit(0);
    }
};

createTables();