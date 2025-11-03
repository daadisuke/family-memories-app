# Next.js 16 アップグレードガイド

## 概要

このドキュメントは、Next.js 15から16へのアップグレード手順を説明します。
Next.js 16は2025年10月21日に安定版がリリースされ、Turbopackの安定化やNext.js DevTools MCPなど、重要な新機能が追加されています。

**作成日**: 2025-11-02

---

## Next.js 16の主な新機能

### 1. Turbopack（安定版）
- Rust製の高速バンドラーが安定版に
- すべての新規プロジェクトでデフォルト
- 大幅なパフォーマンス向上

### 2. Next.js DevTools MCP
- Model Context Protocol統合
- AIアシストデバッグ機能
- アプリケーションへのコンテキスト洞察
- **Claude Codeとの連携が強化**

### 3. Proxy Architecture
- `middleware.ts` から `proxy.ts` への移行
- ネットワーク境界の明確化
- Node.jsランタイムで実行

### 4. Cache Components
- Partial Pre-Rendering (PPR)
- `use cache` による即座のナビゲーション
- 新しいキャッシングモデル

### 5. 開発者体験の向上
- ビルドログの改善
- 開発リクエストのログ改善

---

## 必須要件

### システム要件
- **Node.js**: 20.9+ （重要！）
- **TypeScript**: 5+ （重要！）
- **React**: 19+ （推奨）

### 互換性確認

現在の環境を確認:
```bash
node --version  # 20.9以上であることを確認
npm --version
```

---

## アップグレード手順

### ステップ1: バックアップ

```bash
# 現在のブランチから新規ブランチ作成
git checkout -b upgrade/nextjs-16
git add .
git commit -m "chore: Next.js 16アップグレード前のバックアップ"
```

### ステップ2: Node.jsバージョン確認・更新

Node.js 20.9+が必要です。

```bash
# Node.jsバージョン確認
node --version

# 20.9未満の場合はアップグレード
# nvmを使用している場合
nvm install 20
nvm use 20

# または公式サイトからインストール
# https://nodejs.org/
```

### ステップ3: 依存関係の更新

```bash
# Next.js 16へアップグレード
npm install next@16 react@19 react-dom@19

# または最新版を指定
npm install next@latest react@latest react-dom@latest

# TypeScriptの型定義も更新
npm install -D @types/react@latest @types/react-dom@latest
```

### ステップ4: TypeScriptバージョン確認

```bash
# TypeScript 5+が必要
npm install -D typescript@latest
```

### ステップ5: 設定ファイルの更新

#### next.config.js

Next.js 16では、Turbopackがデフォルトで有効になります。

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopackは自動的に有効（明示的な設定不要）

  // 既存の設定はそのまま
  images: {
    domains: ['your-supabase-url.supabase.co'],
  },

  // 新機能: Partial Pre-Rendering (PPR) を有効化（オプション）
  experimental: {
    ppr: true, // Partial Pre-Renderingを有効化
  },
}

module.exports = nextConfig
```

### ステップ6: Middleware → Proxy移行（必要な場合）

Next.js 16では `middleware.ts` が非推奨となり、`proxy.ts` への移行が推奨されます。

**middleware.tsを使用している場合:**

```typescript
// 旧: middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 認証チェックなど
  return NextResponse.next()
}
```

**新: proxy.ts（推奨）**

```typescript
// proxy.ts
export default function proxy(request: Request) {
  // ネットワーク境界での処理
  return fetch(request)
}

export const config = {
  matcher: '/api/:path*',
}
```

**注意**: 認証処理については、引き続き middleware.ts を使用可能です（後方互換性あり）。

### ステップ7: package.jsonスクリプト更新

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

`--turbo` フラグは Next.js 16ではデフォルトで有効なため、省略可能です。

### ステップ8: ローカルビルド確認

```bash
# 開発サーバー起動
npm run dev

# ビルド確認
npm run build
npm run start
```

### ステップ9: TypeScriptエラー確認

```bash
# 型チェック
npx tsc --noEmit
```

エラーがある場合は修正します。

### ステップ10: Lintエラー確認

```bash
npm run lint
```

---

## Next.js DevTools MCPの設定

Next.js 16の目玉機能であるDevTools MCPを設定します。

### Claude Code設定ファイル更新

`~/.claude/config.json` に追加:

```json
{
  "mcpServers": {
    "nextjs-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
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

### DevTools MCPの使い方

Claude Codeで以下のように指示:

```
Next.js DevTools MCPを使用して:
1. 現在のプロジェクト構造を確認
2. ビルドエラーを解析
3. パフォーマンスボトルネックを特定
4. ルーティング情報を取得
```

---

## Breaking Changes（破壊的変更）

### 1. Node.js 18のサポート終了
- Node.js 20.9+が必須
- Node.js 18を使用している場合はアップグレード必須

### 2. React 18のサポート（非推奨）
- React 19が推奨
- React 18は動作するが、新機能を利用できない

### 3. Middlewareの変更
- `middleware.ts` は引き続き使用可能だが、`proxy.ts` への移行が推奨
- 将来のバージョンで `middleware.ts` が完全非推奨になる可能性

---

## トラブルシューティング

### エラー1: Node.jsバージョンが古い

**症状:**
```
Error: Next.js requires Node.js 20.9 or later
```

**解決策:**
```bash
nvm install 20
nvm use 20
```

### エラー2: TypeScriptエラー

**症状:**
```
Type error: ...
```

**解決策:**
```bash
# TypeScript 5+にアップグレード
npm install -D typescript@latest

# 型定義を更新
npm install -D @types/react@latest @types/react-dom@latest
```

### エラー3: Turbopackビルドエラー

**症状:**
Turbopack関連のビルドエラー

**解決策:**
一時的にWebpackに切り替える:
```bash
# next.config.jsで明示的にWebpackを使用
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    return config
  },
}
```

または
```bash
# 開発時にWebpackを使用
TURBOPACK=false npm run dev
```

### エラー4: DevTools MCP接続エラー

**症状:**
DevTools MCPに接続できない

**解決策:**
1. Claude Code設定ファイルのパスを確認
2. プロジェクトパスが正しいか確認
3. Claude Codeを再起動

---

## パフォーマンス計測

アップグレード前後でパフォーマンスを計測します。

### ビルド時間

```bash
# アップグレード前
time npm run build

# アップグレード後（Turbopack）
time npm run build
```

### 開発サーバー起動時間

```bash
# アップグレード前
time npm run dev

# アップグレード後
time npm run dev
```

### Chrome DevTools MCPで計測

```
Chrome DevTools MCPを使用して:
1. ページ読み込み時間を計測
2. Core Web Vitalsを計測
3. Turbopack vs Webpack の比較
```

---

## Vercelデプロイ設定

### 環境変数確認

Vercel環境でNode.js 20を使用するように設定:

```bash
# Vercel MCPを使用
「Vercel MCPを使用して、Node.jsバージョンを20に設定してください」
```

または Vercel Dashboardで:
- Settings → General → Node.js Version → 20.x

---

## ロールバック手順

問題が発生した場合のロールバック手順:

```bash
# アップグレード前のブランチに戻る
git checkout main

# または package.json を元に戻す
npm install next@15 react@18 react-dom@18
```

---

## チェックリスト

### アップグレード前

- [ ] 現在のコードをコミット
- [ ] 新規ブランチ作成
- [ ] Node.js 20.9+インストール確認
- [ ] package.jsonのバックアップ

### アップグレード中

- [ ] Next.js 16インストール
- [ ] React 19インストール
- [ ] TypeScript 5+インストール
- [ ] next.config.js更新
- [ ] middleware.ts → proxy.ts 移行検討

### アップグレード後

- [ ] ローカルビルド成功
- [ ] 型チェック成功
- [ ] Lintチェック成功
- [ ] 開発サーバー起動確認
- [ ] Next.js DevTools MCP設定
- [ ] Vercelプレビューデプロイ確認
- [ ] パフォーマンス計測
- [ ] 本番デプロイ

---

## 参考リンク

- [Next.js 16 公式アナウンス](https://nextjs.org/blog/next-16)
- [Next.js 16 Migration Guide](https://nextjs.org/docs/upgrade-guide)
- [Turbopack Documentation](https://nextjs.org/docs/architecture/turbopack)
- [Next.js DevTools MCP](https://nextjs.org/docs/devtools-mcp)

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-11-02 | Next.js 16アップグレードガイド初版作成 |
