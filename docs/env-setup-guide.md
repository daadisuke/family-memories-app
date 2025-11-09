# 環境変数設定ガイド

このガイドでは、アプリケーションの環境変数を設定する方法を説明します。

## 現在の設定状況

### ✅ 完了している設定

- **Supabase環境変数**: 既に設定済み
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

- **NextAuth基本設定**: 完了
  - `NEXTAUTH_URL`: `http://localhost:3000`
  - `NEXTAUTH_SECRET`: 自動生成済み

### ⏳ 未完了の設定

以下の環境変数はまだ設定されていません：

1. **Google OAuth認証情報**
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

2. **Claude API（オプション）**
   - `ANTHROPIC_API_KEY`（将来のAI機能用）

## Google OAuth設定手順

Google OAuthを使用してユーザー認証を行うために、以下の手順でクライアントIDとシークレットを取得します。

### 1. Google Cloud Consoleへアクセス

1. [Google Cloud Console](https://console.cloud.google.com)にアクセス
2. Googleアカウントでログイン

### 2. プロジェクトの作成（新規の場合）

1. 上部のプロジェクト選択ドロップダウンをクリック
2. 「新しいプロジェクト」をクリック
3. プロジェクト名を入力（例: `family-memories-app`）
4. 「作成」をクリック

### 3. OAuth同意画面の設定

1. 左側メニューから「APIとサービス」→「OAuth同意画面」を選択
2. ユーザータイプで「外部」を選択して「作成」をクリック
3. 必須項目を入力：
   - **アプリ名**: `Family Memories App`
   - **ユーザーサポートメール**: あなたのメールアドレス
   - **デベロッパーの連絡先情報**: あなたのメールアドレス
4. 「保存して次へ」をクリック
5. スコープ画面では何も追加せず「保存して次へ」
6. テストユーザー画面でも「保存して次へ」
7. 「ダッシュボードに戻る」をクリック

### 4. OAuth 2.0クライアントIDの作成

1. 左側メニューから「APIとサービス」→「認証情報」を選択
2. 上部の「認証情報を作成」→「OAuth クライアント ID」をクリック
3. アプリケーションの種類で「ウェブアプリケーション」を選択
4. 必須項目を入力：
   - **名前**: `Family Memories Web Client`
   - **承認済みのJavaScript生成元**: `http://localhost:3000`
   - **承認済みのリダイレクトURI**:
     - `http://localhost:3000/api/auth/callback/google`
5. 「作成」をクリック

### 5. 認証情報の取得

作成完了後、ポップアップが表示されます：
- **クライアントID**: `GOOGLE_CLIENT_ID`として使用
- **クライアントシークレット**: `GOOGLE_CLIENT_SECRET`として使用

これらの値をコピーして`.env.local`ファイルに追加してください。

### 6. `.env.local`への追加

`.env.local`ファイルを開き、以下のように設定します：

```env
# Google OAuth
GOOGLE_CLIENT_ID=あなたのクライアントID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=あなたのクライアントシークレット
```

## Claude API設定手順（オプション）

将来的なAI機能（写真の自動タグ付けなど）で使用します。現時点では必須ではありません。

### 1. Anthropic Console へアクセス

1. [Anthropic Console](https://console.anthropic.com)にアクセス
2. アカウントを作成またはログイン

### 2. APIキーの作成

1. 左側メニューから「API Keys」を選択
2. 「Create Key」をクリック
3. キー名を入力（例: `family-memories-dev`）
4. 「Create Key」をクリック
5. 表示されたAPIキーをコピー（一度しか表示されません！）

### 3. `.env.local`への追加

```env
# Claude API (for future AI features)
ANTHROPIC_API_KEY=sk-ant-api03-...
```

## 本番環境（Vercel）での設定

本番環境にデプロイする際は、Vercelダッシュボードで環境変数を設定する必要があります。

### Vercel環境変数の設定方法

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクトを選択
3. 「Settings」タブ→「Environment Variables」を選択
4. 以下の環境変数を追加：

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | Production, Preview, Development |
| `NEXTAUTH_URL` | 本番URL（例: `https://your-app.vercel.app`） | Production |
| `NEXTAUTH_URL` | `http://localhost:3000` | Development |
| `NEXTAUTH_SECRET` | 生成済みのシークレット | Production, Preview, Development |
| `GOOGLE_CLIENT_ID` | Google Client ID | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET` | Google Client Secret | Production, Preview, Development |
| `ANTHROPIC_API_KEY` | Claude API Key（オプション） | Production, Preview |

### 本番環境でのGoogle OAuth設定の更新

本番URLが決まったら、Google Cloud Consoleで以下を追加してください：

1. OAuth 2.0クライアントIDの設定画面を開く
2. **承認済みのJavaScript生成元**に追加:
   - `https://your-app.vercel.app`
3. **承認済みのリダイレクトURI**に追加:
   - `https://your-app.vercel.app/api/auth/callback/google`

## セキュリティ上の注意事項

⚠️ **重要**: 以下の環境変数は絶対に公開しないでください：

- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_SECRET`
- `ANTHROPIC_API_KEY`

これらの値は：
- Gitにコミットしない（`.env.local`は`.gitignore`に含まれています）
- 公開リポジトリに含めない
- スクリーンショットなどで共有しない
- 信頼できるチームメンバーとのみ共有する

## 確認方法

環境変数が正しく設定されているか確認するには：

```bash
# 開発サーバーを起動
npm run dev

# ブラウザでhttp://localhost:3000を開く
# エラーが表示されなければ、基本設定は完了です
```

Google OAuth認証をテストするには：
1. ログインページにアクセス
2. 「Googleでログイン」ボタンをクリック
3. Google認証画面が表示されることを確認

## トラブルシューティング

### Supabase接続エラー

```
Error: Invalid Supabase URL
```

→ `.env.local`の`NEXT_PUBLIC_SUPABASE_URL`が正しいか確認してください。

### NextAuth認証エラー

```
Error: NEXTAUTH_SECRET is not set
```

→ `.env.local`に`NEXTAUTH_SECRET`が設定されているか確認してください。

### Google OAuth エラー

```
Error: redirect_uri_mismatch
```

→ Google Cloud Consoleで設定したリダイレクトURIと、アプリケーションのURLが一致しているか確認してください。

## 次のステップ

環境変数の設定が完了したら：

1. [データベーススキーマ](./database-schema.md)を確認してSupabaseデータベースをセットアップ
2. [開発ワークフロー](./workflow.md)に従って開発を開始
3. 認証機能の実装（NextAuth設定ファイルの作成）

## 参考リンク

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
