# データベーススキーマ設計

## 概要

このドキュメントは、家族思い出アプリのデータベース設計を詳細に説明します。
Supabase PostgreSQLを使用し、認証、写真管理、家族共有機能を実装します。

## ER図

```
families (家族グループ)
    ↓ 1:N
users (ユーザー)
    ↓ 1:N
photos (写真)
    ↓ 1:N
tags (タグ) ※将来実装
```

## テーブル定義

### 1. families テーブル

家族グループを管理するテーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | 家族グループID |
| name | VARCHAR(100) | NOT NULL | 家族グループ名 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |

**インデックス:**
- PRIMARY KEY on `id`

**SQL:**
```sql
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 2. users テーブル

ユーザー情報を管理するテーブル（NextAuth連携）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | ユーザーID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | メールアドレス |
| name | VARCHAR(100) | | ユーザー名 |
| image | TEXT | | プロフィール画像URL |
| family_id | UUID | FOREIGN KEY -> families(id) | 家族グループID |
| role | VARCHAR(20) | DEFAULT 'member' | ロール（admin/member） |
| email_verified | TIMESTAMPTZ | | メール確認日時 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |

**インデックス:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`
- INDEX on `family_id`

**SQL:**
```sql
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
```

---

### 3. accounts テーブル

NextAuth認証プロバイダー情報

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | アカウントID |
| user_id | UUID | FOREIGN KEY -> users(id), NOT NULL | ユーザーID |
| type | VARCHAR(50) | NOT NULL | アカウントタイプ |
| provider | VARCHAR(50) | NOT NULL | プロバイダー名 |
| provider_account_id | TEXT | NOT NULL | プロバイダーアカウントID |
| refresh_token | TEXT | | リフレッシュトークン |
| access_token | TEXT | | アクセストークン |
| expires_at | INTEGER | | トークン有効期限 |
| token_type | VARCHAR(50) | | トークンタイプ |
| scope | TEXT | | スコープ |
| id_token | TEXT | | IDトークン |
| session_state | TEXT | | セッション状態 |

**インデックス:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `(provider, provider_account_id)`
- INDEX on `user_id`

**SQL:**
```sql
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
```

---

### 4. sessions テーブル

セッション管理

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | セッションID |
| session_token | TEXT | UNIQUE, NOT NULL | セッショントークン |
| user_id | UUID | FOREIGN KEY -> users(id), NOT NULL | ユーザーID |
| expires | TIMESTAMPTZ | NOT NULL | 有効期限 |

**インデックス:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `session_token`
- INDEX on `user_id`

**SQL:**
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
```

---

### 5. verification_tokens テーブル

メール確認トークン

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| identifier | TEXT | NOT NULL | 識別子（メールアドレス） |
| token | TEXT | NOT NULL | トークン |
| expires | TIMESTAMPTZ | NOT NULL | 有効期限 |

**インデックス:**
- UNIQUE INDEX on `(identifier, token)`

**SQL:**
```sql
CREATE TABLE verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    UNIQUE(identifier, token)
);
```

---

### 6. photos テーブル

写真メタデータを管理するテーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | 写真ID |
| user_id | UUID | FOREIGN KEY -> users(id), NOT NULL | アップロードユーザーID |
| family_id | UUID | FOREIGN KEY -> families(id), NOT NULL | 家族グループID |
| storage_path | TEXT | NOT NULL | Storageパス |
| file_name | VARCHAR(255) | NOT NULL | ファイル名 |
| file_size | BIGINT | | ファイルサイズ（bytes） |
| mime_type | VARCHAR(100) | | MIMEタイプ |
| width | INTEGER | | 画像幅 |
| height | INTEGER | | 画像高さ |
| uploaded_at | TIMESTAMPTZ | DEFAULT NOW() | アップロード日時 |
| taken_at | TIMESTAMPTZ | | 撮影日時（EXIF情報） |
| location | JSONB | | 位置情報（EXIF情報） |
| tags | TEXT[] | DEFAULT '{}' | タグ配列 |
| ai_processed | BOOLEAN | DEFAULT FALSE | AI処理済みフラグ |
| ai_processed_at | TIMESTAMPTZ | | AI処理日時 |
| description | TEXT | | 説明 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |

**インデックス:**
- PRIMARY KEY on `id`
- INDEX on `user_id`
- INDEX on `family_id`
- INDEX on `uploaded_at DESC`
- INDEX on `taken_at DESC`
- GIN INDEX on `tags` (配列検索用)

**SQL:**
```sql
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
```

---

### 7. tags テーブル（将来実装）

AI生成タグの��細情報を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | タグID |
| photo_id | UUID | FOREIGN KEY -> photos(id), NOT NULL | 写真ID |
| tag_name | VARCHAR(100) | NOT NULL | タグ名 |
| tag_type | VARCHAR(50) | | タグタイプ（person/object/scene） |
| confidence | FLOAT | CHECK (confidence >= 0 AND confidence <= 1) | 信頼度（0-1） |
| bounding_box | JSONB | | バウンディングボックス情報 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |

**インデックス:**
- PRIMARY KEY on `id`
- INDEX on `photo_id`
- INDEX on `tag_name`
- INDEX on `tag_type`

**SQL:**
```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    tag_name VARCHAR(100) NOT NULL,
    tag_type VARCHAR(50),
    confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
    bounding_box JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tags_photo_id ON tags(photo_id);
CREATE INDEX idx_tags_tag_name ON tags(tag_name);
CREATE INDEX idx_tags_tag_type ON tags(tag_type);
```

---

## Row Level Security (RLS) ポリシー

### users テーブル

```sql
-- RLS有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の情報のみ閲覧可能
CREATE POLICY "Users can view own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

-- ユーザーは自分の情報のみ更新可能
CREATE POLICY "Users can update own data"
    ON users FOR UPDATE
    USING (auth.uid() = id);
```

### photos テーブル

```sql
-- RLS有効化
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
```

---

## トリガー関数

### updated_at自動更新

```sql
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
```

---

## Supabase Storage バケット

### photos バケット

```sql
-- Storageバケット作成（Supabase UIまたはSQLで実行）
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', false);

-- RLSポリシー: 同じ家族グループのユーザーのみアクセス可能
CREATE POLICY "Family members can view photos"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'photos' AND
        (storage.foldername(name))[1] IN (
            SELECT family_id::text FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can upload photos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'photos' AND
        (storage.foldername(name))[1] IN (
            SELECT family_id::text FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own photos"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'photos' AND
        owner = auth.uid()
    );
```

---

## 初期データ

### サンプル家族グループ

```sql
-- サンプル家族グループの作成
INSERT INTO families (name) VALUES ('山田家');
```

---

## マイグレーション戦略

### Phase 1: 基本スキーマ
1. `families`, `users`, `accounts`, `sessions`, `verification_tokens` テーブル作成
2. NextAuth連携
3. RLSポリシー設定

### Phase 2: 写真機能
1. `photos` テーブル作成
2. Storage バケット作成
3. RLSポリシー設定

### Phase 3: AI機能
1. `tags` テーブル作成
2. AI処理用の追加カラム・インデックス

---

## クエリ例

### 家族の写真を取得

```sql
SELECT p.*, u.name as uploader_name
FROM photos p
JOIN users u ON p.user_id = u.id
WHERE p.family_id = (SELECT family_id FROM users WHERE id = auth.uid())
ORDER BY p.taken_at DESC NULLS LAST, p.uploaded_at DESC
LIMIT 50;
```

### タグで検索

```sql
SELECT *
FROM photos
WHERE family_id = (SELECT family_id FROM users WHERE id = auth.uid())
  AND tags @> ARRAY['家族', '旅行']
ORDER BY uploaded_at DESC;
```

### 日付範囲で検索

```sql
SELECT *
FROM photos
WHERE family_id = (SELECT family_id FROM users WHERE id = auth.uid())
  AND taken_at BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY taken_at DESC;
```

---

## パフォーマンス最適化

1. **インデックス**: 頻繁に検索されるカラムにインデックスを作成済み
2. **パーティショニング**: 将来的に写真が増えた場合、`uploaded_at`でパーティション分割を検討
3. **キャッシング**: よく使われるクエリはアプリケーション側でキャッシュ
4. **ページネーション**: 大量の写真を扱う際は必ずページネーションを使用

---

## 参考資料

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NextAuth.js Database Adapters](https://next-auth.js.org/adapters/models)
