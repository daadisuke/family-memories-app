-- Family Memories App Database Schema
-- Database: Supabase PostgreSQL
-- Version: 1.0
-- Date: 2025-11-03

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. families テーブル
-- =====================================================
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. users テーブル
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    image TEXT,
    family_id UUID REFERENCES families(id) ON DELETE SET NULL,
    role VARCHAR(20) DEFAULT 'member',
    email_verified TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_family_id ON users(family_id);

-- =====================================================
-- 3. accounts テーブル (NextAuth)
-- =====================================================
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_account_id TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type VARCHAR(50),
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    UNIQUE(provider, provider_account_id)
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- =====================================================
-- 4. sessions テーブル (NextAuth)
-- =====================================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- =====================================================
-- 5. verification_tokens テーブル (NextAuth)
-- =====================================================
CREATE TABLE verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    UNIQUE(identifier, token)
);

-- =====================================================
-- 6. photos テーブル
-- =====================================================
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    taken_at TIMESTAMPTZ,
    location JSONB,
    tags TEXT[] DEFAULT '{}',
    ai_processed BOOLEAN DEFAULT FALSE,
    ai_processed_at TIMESTAMPTZ,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_family_id ON photos(family_id);
CREATE INDEX idx_photos_uploaded_at ON photos(uploaded_at DESC);
CREATE INDEX idx_photos_taken_at ON photos(taken_at DESC);
CREATE INDEX idx_photos_tags ON photos USING GIN(tags);

-- =====================================================
-- 7. tags テーブル (将来実装)
-- =====================================================
-- CREATE TABLE tags (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
--     tag_name VARCHAR(100) NOT NULL,
--     tag_type VARCHAR(50),
--     confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
--     bounding_box JSONB,
--     created_at TIMESTAMPTZ DEFAULT NOW()
-- );
--
-- CREATE INDEX idx_tags_photo_id ON tags(photo_id);
-- CREATE INDEX idx_tags_tag_name ON tags(tag_name);
-- CREATE INDEX idx_tags_tag_type ON tags(tag_type);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- users テーブル
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の情報のみ閲覧可能
CREATE POLICY "Users can view own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

-- ユーザーは自分の情報のみ更新可能
CREATE POLICY "Users can update own data"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- photos テーブル
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- 同じ家族グループのユーザーは写真を閲覧可能
CREATE POLICY "Family members can view photos"
    ON photos FOR SELECT
    USING (
        family_id IN (
            SELECT family_id FROM users WHERE id = auth.uid()
        )
    );

-- ユーザーは写真を挿入可能（自分の家族グループのみ）
CREATE POLICY "Users can insert photos"
    ON photos FOR INSERT
    WITH CHECK (
        family_id IN (
            SELECT family_id FROM users WHERE id = auth.uid()
        )
    );

-- ユーザーは自分がアップロードした写真を更新可能
CREATE POLICY "Users can update own photos"
    ON photos FOR UPDATE
    USING (user_id = auth.uid());

-- ユーザーは自分がアップロードした写真を削除可能
CREATE POLICY "Users can delete own photos"
    ON photos FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- Triggers
-- =====================================================

-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_families_updated_at
    BEFORE UPDATE ON families
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photos_updated_at
    BEFORE UPDATE ON photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Storage Bucket Policies
-- =====================================================

-- Supabase Storage: photos バケット作成
-- Note: これはSupabase UIまたは別途実行する必要があります
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('photos', 'photos', false);
--
-- -- RLSポリシー: 同じ家族グループのユーザーのみアクセス可能
-- CREATE POLICY "Family members can view photos"
--     ON storage.objects FOR SELECT
--     USING (
--         bucket_id = 'photos' AND
--         (storage.foldername(name))[1] IN (
--             SELECT family_id::text FROM users WHERE id = auth.uid()
--         )
--     );
--
-- CREATE POLICY "Users can upload photos"
--     ON storage.objects FOR INSERT
--     WITH CHECK (
--         bucket_id = 'photos' AND
--         (storage.foldername(name))[1] IN (
--             SELECT family_id::text FROM users WHERE id = auth.uid()
--         )
--     );
--
-- CREATE POLICY "Users can delete own photos"
--     ON storage.objects FOR DELETE
--     USING (
--         bucket_id = 'photos' AND
--         owner = auth.uid()
--     );
