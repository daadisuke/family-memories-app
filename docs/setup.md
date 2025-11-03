# 開発環境セットアップガイド

## 前提条件

### 必要なツール
- Node.js 20.9+ 以上（Next.js 16の要件）
- npm または yarn
- Git
- Claude Code（MCP設定済み）

### 必要なアカウント
- GitHub アカウント
- Vercel アカウント
- Supabase アカウント
- Anthropic アカウント（Claude API用）

## 1. プロジェクトのクローン

```bash
git clone <repository-url>
cd family-memories-app
```

## 2. Next.js プロジェクトセットアップ

### 2.1 Next.js MCP を使用したセットアップ

Claude Codeで以下を実行:

```
Next.js MCPを使用してプロジェクトを初期化
- Next.js 16 使用
- React 19 使用
- App Router使用
- TypeScript有効化
- Tailwind CSS有効化
- ESLint有効化
- Turbopack有効化（開発サーバー高速化）
```

**重要**: Next.js 16とReact 19を使用することで、最新の機能とパフォーマンス改善が利用できます。

### 2.2 依存関係のインストール

```bash
npm install
# または
yarn install
```

## 3. Supabase セットアップ

### 3.1 Supabase MCPを使用したプロジェクト作成

Claude Codeで以下を実行:

```
Supabase MCPを使用して:
1. 新規プロジェクト作成
2. データベース初期化
3. Storage バケット作成（photos）
```

### 3.2 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Claude API (将来のAI機能用)
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 3.3 データベーススキーマの適用

Supabase SQL Editorで `docs/sql/schema.sql` を実行

## 4. NextAuth セットアップ

### 4.1 必要なパッケージのインストール

```bash
npm install next-auth @next-auth/prisma-adapter
npm install -D prisma
```

### 4.2 NextAuth設定ファイルの作成

`app/api/auth/[...nextauth]/route.ts` に認証設定を追加

## 5. Vercel セットアップ

### 5.1 Vercel MCPを使用したプロジェクト連携

Claude Codeで以下を実行:

```
Vercel MCPを使用して:
1. 新規プロジェクト作成
2. GitHubリポジトリと連携
3. 環境変数を設定
4. 自動デプロイ有効化
```

### 5.2 Vercel環境変数の設定

Vercel Dashboardまたは Vercel MCPで以下を設定:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

## 6. MCP設定

### 6.1 Claude Code MCP設定ファイル

`~/.claude/config.json` に以下を追加:

```json
{
  "mcpServers": {
    "nextjs-devtools": {
      "command": "npx",
      "args": ["-y", "@next/devtools-mcp"]
    },
    "nextjs": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-nextjs"]
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "your_supabase_url",
        "SUPABASE_KEY": "your_supabase_anon_key"
      }
    },
    "vercel": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-vercel"],
      "env": {
        "VERCEL_TOKEN": "your_vercel_token"
      }
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-chrome-devtools"]
    }
  }
}
```

**Note**: Next.js DevTools MCP (`@next/devtools-mcp`) は Next.js 16 で新しく導入された公式MCPサーバーです。AI支援デバッグ、プロジェクト構造分析、ビルドエラー診断などの機能を提供します。

## 7. 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
```

**Note**: Next.js 16では開発サーバーが自動的にTurbopackを使用し、高速な開発体験を提供します。

ブラウザで http://localhost:3000 を開く

## 8. 動作確認

### 8.1 Next.js DevTools MCPでの確認

Claude Codeで以下を実行:

```
Next.js DevTools MCPを使用して:
1. プロジェクト構造の確認
2. ルーティング情報の取得
3. ビルドエラーの診断（もしあれば）
4. パフォーマンスボトルネックの特定
```

### 8.2 Chrome DevTools MCPでの確認

Claude Codeで以下を実行:

```
Chrome DevTools MCPを使用して:
1. ブラウザでlocalhost:3000を開く
2. DOMの検証
3. レスポンシブデザインの確認
4. Core Web Vitalsの計測
```

## 9. データベースマイグレーション（将来的に）

### 9.1 Prisma セットアップ

```bash
npx prisma init
npx prisma db pull  # Supabaseからスキーマを取得
npx prisma generate
```

### 9.2 マイグレーション実行

```bash
npx prisma migrate dev --name init
```

## 10. トラブルシューティング

### Supabase接続エラー
- `.env.local` の環境変数を確認
- Supabase ダッシュボードでプロジェクトが起動しているか確認

### NextAuth認証エラー
- `NEXTAUTH_SECRET` が正しく設定されているか確認
- `NEXTAUTH_URL` がアプリケーションのURLと一致しているか確認

### Vercelデプロイエラー
- Vercelの環境変数がすべて設定されているか確認
- ビルドログを確認してエラーメッセージを特定

### MCP接続エラー
- Claude Code設定ファイルのパスが正しいか確認
- 各MCPサーバーの認証情報が正しいか確認
- Claude Codeを再起動

## 次のステップ

1. [プロジェクト構造](./project-structure.md)を確認
2. [データベーススキーマ](./database-schema.md)を確認
3. [開発ワークフロー](./workflow.md)に従って開発開始
4. [MCP使用ガイド](./mcp-guide.md)でMCPの活用方法を学習

## 参考リンク

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Next.js DevTools MCP](https://nextjs.org/docs/devtools-mcp)
- [React 19 Documentation](https://react.dev/blog/2024/12/05/react-19)
- [Supabase Documentation](https://supabase.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Vercel Documentation](https://vercel.com/docs)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io)
