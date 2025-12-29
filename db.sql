// restore_db.js

/**
 * This file contains the complete SQL script to restore the database structure and sample data.
 *
 * IMPORTANT: This script DOES NOT set the admin password correctly due to hashing requirements.
 * AFTER running this SQL script, you MUST run the following command from the 'server/' directory
 * to ensure the admin user is created with the correct password:
 *
 * npm run db:init
 *
 * Default Admin Credentials (after running db:init):
 *   - Email: admin@giac.ngo
 *   - Password: Giacngo@2024
 */

const restore_sql = `
-- =============================================================================
-- GIÁC NGỘ AI - DATABASE RESTORE SCRIPT
-- =============================================================================
-- This script will drop existing tables and recreate the entire database structure.
-- It also seeds the database with essential data for the application to run.
--
-- PLEASE READ THE IMPORTANT NOTE AT THE TOP OF THIS FILE REGARDING THE ADMIN PASSWORD.
-- =============================================================================


-- STEP 1: DROP EXISTING TABLES
-- Dropping in reverse order of creation to respect foreign key constraints.
-- CASCADE will remove any dependent objects.

DROP TABLE IF EXISTS document_config CASCADE;
DROP TABLE IF EXISTS social_feed_posts CASCADE;
DROP TABLE IF EXISTS withdrawal_requests CASCADE;
DROP TABLE IF EXISTS dharma_talks CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS koii_tasks CASCADE;
DROP TABLE IF EXISTS ai_config_documents CASCADE;
DROP TABLE IF EXISTS training_data_sources CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS pricing_plans CASCADE;
DROP TABLE IF EXISTS system_config CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS ai_user_access CASCADE;
DROP TABLE IF EXISTS user_owned_ais CASCADE;
DROP TABLE IF EXISTS ai_configs CASCADE;
DROP TABLE IF EXISTS document_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS document_topics CASCADE;
DROP TABLE IF EXISTS document_types CASCADE;
DROP TABLE IF EXISTS document_authors CASCADE;
DROP TABLE IF EXISTS spaces CASCADE;
DROP TABLE IF EXISTS space_types CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;


-- STEP 2: CREATE TABLES

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    permissions TEXT[]
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    merits INT,
    requests_remaining INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    api_token VARCHAR(255) UNIQUE,
    api_keys JSONB,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMPTZ,
    template VARCHAR(50) DEFAULT 'giacngo',
    subscription_plan_id INT,
    stripe_customer_id VARCHAR(255),
    stripe_account_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    role_ids INTEGER[] DEFAULT ARRAY[]::INTEGER[]
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS space_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    icon VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS spaces (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    space_sort INT DEFAULT 0,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    description TEXT,
    description_en TEXT,
    event TEXT,
    event_en TEXT,
    image_url TEXT,
    location_text VARCHAR(255),
    location_text_en VARCHAR(255),
    members_count INT DEFAULT 0,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    rating REAL DEFAULT 0,
    tags TEXT[],
    tags_en TEXT[],
    type_id INT REFERENCES space_types(id) ON DELETE SET NULL,
    space_color VARCHAR(20),
    status VARCHAR(50),
    status_en VARCHAR(50),
    merits INT DEFAULT 0,
    merits_sold INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    space_id INT REFERENCES spaces(id) ON DELETE SET NULL,
    UNIQUE(name, space_id)
);

CREATE TABLE IF NOT EXISTS document_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    space_id INT REFERENCES spaces(id) ON DELETE SET NULL,
    UNIQUE(name, space_id)
);

CREATE TABLE IF NOT EXISTS document_topics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    space_id INT REFERENCES spaces(id) ON DELETE SET NULL,
    type_id INT REFERENCES document_types(id) ON DELETE SET NULL,
    author_id INT REFERENCES document_authors(id) ON DELETE SET NULL,
    number_index INT DEFAULT 0,
    UNIQUE(name, space_id, type_id, author_id)
);

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    summary TEXT,
    summary_en TEXT,
    author_id INT REFERENCES document_authors(id),
    type_id INT REFERENCES document_types(id),
    topic_id INT REFERENCES document_topics(id),
    space_id INT REFERENCES spaces(id) ON DELETE SET NULL,
    content TEXT,
    content_en TEXT,
    thumbnail_url TEXT,
    audio_url TEXT,
    audio_url_en TEXT,
    duration INT,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    rating REAL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS document_tags (
    document_id INT REFERENCES documents(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (document_id, tag_id)
);

CREATE TABLE IF NOT EXISTS ai_configs (
    id SERIAL PRIMARY KEY,
    space_id INT REFERENCES spaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    description TEXT,
    description_en TEXT,
    avatar_url TEXT,
    model_type VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    training_content TEXT,
    suggested_questions TEXT[],
    suggested_questions_en TEXT[],
    tags TEXT[],
    is_public BOOLEAN DEFAULT false,
    is_trial_allowed BOOLEAN DEFAULT false,
    requires_subscription BOOLEAN DEFAULT false,
    is_contact_for_access BOOLEAN DEFAULT false,
    max_output_tokens INT,
    thinking_budget INT,
    purchase_cost INT,
    old_purchase_cost INT,
    is_on_sale BOOLEAN DEFAULT false,
    requests_granted_on_purchase INT,
    merit_cost INT DEFAULT 0,
    access_type VARCHAR(50) DEFAULT 'free',
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    rating REAL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_owned_ais (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    ai_config_id INT REFERENCES ai_configs(id) ON DELETE CASCADE,
    requests_remaining INT,
    PRIMARY KEY (user_id, ai_config_id)
);

CREATE TABLE IF NOT EXISTS ai_user_access (
    ai_config_id INT REFERENCES ai_configs(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (ai_config_id, user_id)
);

CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(100),
    ai_config_id INT REFERENCES ai_configs(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    messages JSONB,
    is_test_chat BOOLEAN DEFAULT false,
    is_trained BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS system_config (
    id INT PRIMARY KEY,
    guest_message_limit INT DEFAULT 5,
    system_keys JSONB,
    template VARCHAR(50) DEFAULT 'giacngo',
    template_settings JSONB
);

CREATE TABLE IF NOT EXISTS pricing_plans (
    id SERIAL PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL,
    plan_name_en VARCHAR(100),
    price VARCHAR(50),
    price_en VARCHAR(50),
    merit_cost INT NOT NULL,
    request_limit INT NOT NULL,
    ai_config_ids INT[],
    features TEXT[],
    features_en TEXT[],
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    admin_id INT REFERENCES users(id) ON DELETE SET NULL,
    destination_space_id INT REFERENCES spaces(id) ON DELETE SET NULL,
    merits INT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    type VARCHAR(50) NOT NULL,
    details JSONB,
    stripe_charge_id VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS training_data_sources (
    id SERIAL PRIMARY KEY,
    ai_config_id INT REFERENCES ai_configs(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'qa', 'file', 'url'
    question TEXT,
    answer TEXT,
    thought TEXT,
    file_name VARCHAR(255),
    file_url TEXT,
    summary TEXT,
    description TEXT,
    is_indexed BOOLEAN DEFAULT false,
    last_exported_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_config_documents (
    ai_config_id INT REFERENCES ai_configs(id) ON DELETE CASCADE,
    document_id INT REFERENCES documents(id) ON DELETE CASCADE,
    PRIMARY KEY (ai_config_id, document_id)
);

CREATE TABLE IF NOT EXISTS koii_tasks (
    id SERIAL PRIMARY KEY,
    ai_config_id INT REFERENCES ai_configs(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    comment_type VARCHAR(50) NOT NULL,
    source_id VARCHAR(255) NOT NULL,
    source_title VARCHAR(255),
    parent_id INT REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dharma_talks (
    id SERIAL PRIMARY KEY,
    space_id INT REFERENCES spaces(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    subtitle VARCHAR(255),
    speaker VARCHAR(100),
    speaker_avatar_url TEXT,
    url TEXT,
    duration INT,
    date DATE,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    rating REAL DEFAULT 0,
    tags TEXT[],
    tags_en TEXT[],
    status VARCHAR(50),
    status_en VARCHAR(50),
    notifications INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    stripe_transfer_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_feed_posts (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(100),
    user_avatar_url TEXT,
    question TEXT,
    answer TEXT,
    ai_name VARCHAR(100),
    ai_avatar_url TEXT,
    likes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_config (
    id INT PRIMARY KEY,
    translation_provider VARCHAR(50) DEFAULT 'gemini',
    translation_model VARCHAR(100) DEFAULT 'gemini-2.5-flash',
    tts_provider VARCHAR(50) DEFAULT 'gemini',
    tts_model VARCHAR(100) DEFAULT 'gemini-2.5-flash-preview-tts',
    tts_voice VARCHAR(50) DEFAULT 'Kore'
);


-- STEP 3: INSERT DEFAULT DATA

INSERT INTO roles (id, name, permissions) VALUES
(1, 'Admin', ARRAY['dashboard', 'files', 'spaces', 'dharma-talks', 'comments', 'ai', 'users', 'roles', 'conversations', 'pricing', 'user-billing', 'space-billing', 'manual-billing', 'templates', 'finetune', 'settings']),
(2, 'Content Manager', ARRAY['dashboard', 'files', 'spaces', 'dharma-talks', 'comments', 'ai', 'users', 'conversations', 'space-billing', 'user-billing']),
(3, 'User', ARRAY['user-billing'])
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, permissions = EXCLUDED.permissions;

INSERT INTO system_config (id, guest_message_limit, template, template_settings) VALUES
(1, 5, 'giacngo', '{"w5g": {"logoUrl": "/themes/w5g/logo.svg"}, "giacngo": {"logoUrl": "/themes/giacngo/logo.svg"}}')
ON CONFLICT (id) DO UPDATE SET
guest_message_limit = EXCLUDED.guest_message_limit,
template = EXCLUDED.template,
template_settings = EXCLUDED.template_settings;

INSERT INTO document_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

INSERT INTO space_types (id, name, name_en, icon) VALUES
(1, 'Chùa', 'Pagoda', '⛩️'),
(2, 'Thiền viện', 'Monastery', '🧘'),
(3, 'Đền Tháp', 'Temple', '🏛️'),
(4, 'Trung tâm Thiền', 'Practice Center', '🌿')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, name_en = EXCLUDED.name_en, icon = EXCLUDED.icon;


-- STEP 4: INSERT PLACEHOLDER ADMIN USER
-- IMPORTANT: The password here is a dummy. Run 'npm run db:init' from 'server/' directory to set it correctly.
INSERT INTO users (id, name, email, password, avatar_url, merits, is_active, api_token, role_ids)
VALUES (1, 'Admin', 'admin@giac.ngo', 'dummy_password_hash_please_run_db_init', 'https://i.pravatar.cc/150?u=admin', null, true, 'dummy_api_token_please_run_db_init', ARRAY[1])
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url,
    merits = EXCLUDED.merits,
    is_active = EXCLUDED.is_active;

INSERT INTO user_roles (user_id, role_id) VALUES (1, 1) ON CONFLICT DO NOTHING;

-- Insert sample spaces and AI configs
INSERT INTO spaces (id, user_id, slug, name, name_en, description, description_en, image_url, type_id, status, status_en) VALUES
(1, 1, 'giac-ngo', 'Giác Ngộ', 'Enlightenment', 'Không gian dành cho sự tỉnh thức và giác ngộ.', 'A space for mindfulness and enlightenment.', 'https://app.giac.ngo/uploads/Spaces/giacngo_cover.jpg', 4, 'Hoạt động', 'Active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ai_configs (id, space_id, name, name_en, description, description_en, avatar_url, model_type, model_name, training_content, suggested_questions, is_public, merit_cost, access_type) VALUES
(1, 1, 'Tâm An', 'Tam An', 'Xoa dịu – Chữa lành – Ứng dụng ngay.', 'Soothing - Healing - Immediate Application.', 'https://app.giac.ngo/uploads/AIAvatars/taman.png', 'gemini', 'gemini-2.5-flash', 'AI này được tạo ra bởi các Thiền Sư đã Ngộ Đạo... Trọng tâm là Chữa Lành: giảm căng thẳng, thay đổi góc nhìn, an lạc trong hoàn cảnh hiện tại.', ARRAY['Làm sao để bớt lo âu?', 'Tôi cảm thấy rất căng thẳng.', 'Làm sao để tha thứ cho người khác?', 'Làm sao để tìm thấy bình an?'], true, 0, 'free'),
(7, 1, 'Giác Ngộ', 'Giac Ngo', 'Khai thị trực chỉ—Phá Mê, Phá Chấp.', 'Direct pointing—Breaking Delusion, Breaking Attachment.', 'https://app.giac.ngo/uploads/AIAvatars/giacngo.png', 'gemini', 'gemini-2.5-flash', 'Bạn là Giác Ngộ – một AI Assistant chỉ dẫn con đường Giác Ngộ và Giải Thoát. Mục tiêu là Phá Mê, Phá Chấp; chỉ phương tiện trực chỉ để "Rõ Mình", "Bản Lai Diện Mục".', ARRAY['Giác Ngộ là gì?', 'Làm sao để thành Phật?', 'Làm sao để thoát khổ?', 'Bản lai diện mục là gì?'], true, 0, 'free'),
(3, 1, 'Đốn Ngộ', 'Don Ngo', 'Một câu—đập tan vọng tưởng.', 'One phrase—shattering delusive thoughts.', 'https://app.giac.ngo/uploads/AIAvatars/donngo.png', 'gemini', 'gemini-2.5-pro', 'Mục đích là dùng câu hỏi/lời nói như "cái vả" để phá tức thời mọi kiến chấp; không giải thích dài dòng. Cực ngắn, trực diện, thách thức.', ARRAY['Ta là ai?', 'Trước khi cha mẹ sinh ra, ta là ai?', 'Chết rồi đi về đâu?', 'Ai đang hỏi?'], true, 1, 'per_use_merit')
ON CONFLICT (id) DO UPDATE SET
  space_id = EXCLUDED.space_id, name = EXCLUDED.name, name_en = EXCLUDED.name_en, description = EXCLUDED.description, description_en = EXCLUDED.description_en, avatar_url = EXCLUDED.avatar_url, model_type = EXCLUDED.model_type, model_name = EXCLUDED.model_name, training_content = EXCLUDED.training_content, suggested_questions = EXCLUDED.suggested_questions, is_public = EXCLUDED.is_public, merit_cost = EXCLUDED.merit_cost, access_type = EXCLUDED.access_type;


-- STEP 5: RESET SEQUENCES
-- This ensures that new rows will get IDs starting after the highest manually inserted ID.

SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles), true);
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users), true);
SELECT setval('space_types_id_seq', (SELECT MAX(id) FROM space_types), true);
SELECT setval('spaces_id_seq', (SELECT MAX(id) FROM spaces), true);
SELECT setval('ai_configs_id_seq', (SELECT MAX(id) FROM ai_configs), true);
SELECT setval('document_authors_id_seq', COALESCE((SELECT MAX(id) FROM document_authors), 1), false);
SELECT setval('document_types_id_seq', COALESCE((SELECT MAX(id) FROM document_types), 1), false);
SELECT setval('document_topics_id_seq', COALESCE((SELECT MAX(id) FROM document_topics), 1), false);
SELECT setval('documents_id_seq', COALESCE((SELECT MAX(id) FROM documents), 1), false);
SELECT setval('tags_id_seq', COALESCE((SELECT MAX(id) FROM tags), 1), false);
SELECT setval('conversations_id_seq', COALESCE((SELECT MAX(id) FROM conversations), 1), false);
SELECT setval('pricing_plans_id_seq', COALESCE((SELECT MAX(id) FROM pricing_plans), 1), false);
SELECT setval('transactions_id_seq', COALESCE((SELECT MAX(id) FROM transactions), 1), false);
SELECT setval('training_data_sources_id_seq', COALESCE((SELECT MAX(id) FROM training_data_sources), 1), false);
SELECT setval('koii_tasks_id_seq', COALESCE((SELECT MAX(id) FROM koii_tasks), 1), false);
SELECT setval('comments_id_seq', COALESCE((SELECT MAX(id) FROM comments), 1), false);
SELECT setval('dharma_talks_id_seq', COALESCE((SELECT MAX(id) FROM dharma_talks), 1), false);
SELECT setval('withdrawal_requests_id_seq', COALESCE((SELECT MAX(id) FROM withdrawal_requests), 1), false);
SELECT setval('social_feed_posts_id_seq', COALESCE((SELECT MAX(id) FROM social_feed_posts), 1), false);

`;

// You can copy the content of the `restore_sql` variable and execute it in your database client.
console.log("SQL script is ready in the 'restore_sql' variable.");
