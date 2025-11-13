-- Migration: Create family_invitations table
-- Description: 家族グループへの招待機能を実装するためのテーブル
-- Created: 2025-11-13

-- family_invitations テーブル作成
CREATE TABLE IF NOT EXISTS family_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_family_invitations_family_id ON family_invitations(family_id);
CREATE INDEX idx_family_invitations_token ON family_invitations(token);
CREATE INDEX idx_family_invitations_email ON family_invitations(email);
CREATE INDEX idx_family_invitations_status ON family_invitations(status);

-- RLSポリシー有効化
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 招待の閲覧（同じ家族のメンバーのみ）
CREATE POLICY "Users can view invitations for their family"
    ON family_invitations
    FOR SELECT
    USING (
        family_id IN (
            SELECT family_id FROM users WHERE id = auth.uid()
        )
    );

-- RLSポリシー: 招待の作成（管理者のみ）
CREATE POLICY "Admins can create invitations"
    ON family_invitations
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND family_id = family_invitations.family_id
            AND role = 'admin'
        )
    );

-- RLSポリシー: 招待の更新（管理者のみ）
CREATE POLICY "Admins can update invitations"
    ON family_invitations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND family_id = family_invitations.family_id
            AND role = 'admin'
        )
    );

-- RLSポリシー: 招待の削除（管理者のみ）
CREATE POLICY "Admins can delete invitations"
    ON family_invitations
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND family_id = family_invitations.family_id
            AND role = 'admin'
        )
    );

-- トリガー: updated_at の自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_family_invitations_updated_at BEFORE UPDATE
    ON family_invitations FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- コメント追加
COMMENT ON TABLE family_invitations IS '家族グループへの招待を管理するテーブル';
COMMENT ON COLUMN family_invitations.id IS '招待ID';
COMMENT ON COLUMN family_invitations.family_id IS '家族グループID';
COMMENT ON COLUMN family_invitations.email IS '招待されるユーザーのメールアドレス';
COMMENT ON COLUMN family_invitations.token IS '招待トークン（UUID）';
COMMENT ON COLUMN family_invitations.status IS '招待ステータス（pending/accepted/expired/cancelled）';
COMMENT ON COLUMN family_invitations.created_by IS '招待を作成したユーザーID';
COMMENT ON COLUMN family_invitations.expires_at IS '有効期限';
COMMENT ON COLUMN family_invitations.created_at IS '作成日時';
COMMENT ON COLUMN family_invitations.updated_at IS '更新日時';
