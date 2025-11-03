# MCP（Model Context Protocol）活用ガイド

## 概要

このプロジェクトでは、Claude CodeのMCP機能を活用して開発効率を最大化します。
以下のMCPサーバーを使用して、開発・デプロイ・デバッグを統合的に行います。

## 使用するMCPサーバー一覧

| MCP名 | 用途 | パッケージ名 |
|------|------|------------|
| Next.js MCP | Next.jsプロジェクト管理・操作 | `@modelcontextprotocol/server-nextjs` |
| Supabase MCP | データベース操作・管理 | `@modelcontextprotocol/server-supabase` |
| Vercel MCP | デプロイ管理・プロジェクト操作 | `@modelcontextprotocol/server-vercel` |
| Chrome DevTools MCP | ブラウザデバッグ・DOM操作 | `@modelcontextprotocol/server-chrome-devtools` |

---

## 1. Next.js MCP

### 目的
Next.jsプロジェクトの作成、設定、コンポーネント管理を効率化

### 主な機能

#### 1.1 プロジェクト初期化
```
Next.js MCPを使用してプロジェクトを初期化:
- App Router使用
- TypeScript有効化
- Tailwind CSS有効化
- ESLint有効化
```

#### 1.2 ページ・コンポーネント作成
```
Next.js MCPを使用して:
- app/photos/page.tsx を作成
- Server Componentとして実装
- メタデータ設定を含める
```

#### 1.3 API Route作成
```
Next.js MCPを使用して:
- app/api/photos/route.ts を作成
- GET, POST, PATCH, DELETE メソッド実装
```

#### 1.4 設定ファイル管理
```
Next.js MCPを使用して next.config.js を更新:
- 画像最適化設定
- 外部ドメイン許可
- 環境変数設定
```

### 使用例

**コンポーネント作成:**
```
Claude Codeでの指示例:
「Next.js MCPを使用して、写真ギャラリーコンポーネントを
app/components/PhotoGallery.tsx に作成してください」
```

**ページ作成:**
```
「Next.js MCPを使用して、写真アップロードページを
app/upload/page.tsx に作成してください。
Server Componentとして実装し、認証チェックを含めてください」
```

---

## 2. Supabase MCP

### 目的
Supabaseデータベースとストレージの操作・管理を効率化

### 主な機能

#### 2.1 プロジェクト管理
```
Supabase MCPを使用して:
- 新規プロジェクト作成
- プロジェクト一覧表示
- プロジェクト設定確認
```

#### 2.2 データベース操作
```
Supabase MCPを使用して:
- テーブル作成・削除
- スキーマ確認
- クエリ実行
- RLSポリシー設定
```

#### 2.3 ストレージ操作
```
Supabase MCPを使用して:
- バケット作成・削除
- ファイルアップロード
- ストレージポリシー設定
```

#### 2.4 認証設定
```
Supabase MCPを使用して:
- 認証プロバイダー設定
- メール設定
- JWT設定確認
```

### 使用例

**テーブル作成:**
```
「Supabase MCPを使用して、photosテーブルを作成してください。
docs/database-schema.md の仕様に従ってください」
```

**RLSポリシー設定:**
```
「Supabase MCPを使用して、photosテーブルにRLSポリシーを設定してください。
同じ家族グループのユーザーのみが写真を閲覧できるようにしてください」
```

**ストレージバケット作成:**
```
「Supabase MCPを使用して、photosバケットを作成してください。
プライベート設定で、家族グループごとにフォルダを分けてください」
```

**クエリ実行:**
```
「Supabase MCPを使用して、最近アップロードされた写真10件を取得してください」
```

---

## 3. Vercel MCP

### 目的
Vercelでのデプロイ管理・プロジェクト設定を効率化

### 主な機能

#### 3.1 プロジェクト管理
```
Vercel MCPを使用して:
- 新規プロジェクト作成
- GitHubリポジトリ連携
- プロジェクト一覧表示
```

#### 3.2 デプロイ管理
```
Vercel MCPを使用して:
- デプロイ履歴確認
- デプロイステータス確認
- デプロイログ表示
- プレビューURL取得
```

#### 3.3 環境変数管理
```
Vercel MCPを使用して:
- 環境変数の設定・更新・削除
- Production/Preview/Development環境ごとの設定
```

#### 3.4 ドメイン管理
```
Vercel MCPを使用して:
- カスタムドメイン追加
- ドメイン確認
- SSL証明書設定
```

### 使用例

**プロジェクト作成:**
```
「Vercel MCPを使用して、family-memories-appプロジェクトを作成してください。
GitHubリポジトリと連携し、自動デプロイを有効にしてください」
```

**環境変数設定:**
```
「Vercel MCPを使用して、以下の環境変数を設定してください:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXTAUTH_SECRET
すべての環境（Production/Preview/Development）に適用してください」
```

**デプロイステータス確認:**
```
「Vercel MCPを使用して、最新のデプロイステータスを確認してください」
```

**プレビューURL取得:**
```
「Vercel MCPを使用して、最新のプレビューデプロイのURLを取得してください」
```

---

## 4. Chrome DevTools MCP

### 目的
ブラウザでの動作確認・デバッグ・パフォーマンス計測を効率化

### 主な機能

#### 4.1 DOM操作・検証
```
Chrome DevTools MCPを使用して:
- 要素の検証
- CSSスタイル確認
- レイアウト確認
- DOM構造の確認
```

#### 4.2 デバッグ
```
Chrome DevTools MCPを使用して:
- コンソールログ確認
- JavaScriptエラー確認
- ネットワークリクエスト確認
- ブレークポイント設定
```

#### 4.3 パフォーマンス計測
```
Chrome DevTools MCPを使用して:
- ページ読み込み時間計測
- Core Web Vitals測定（LCP, FID, CLS）
- パフォーマンスプロファイリング
- メモリ使用量確認
```

#### 4.4 レスポンシブデザイン検証
```
Chrome DevTools MCPを使用して:
- モバイルビューの確認
- タブレットビューの確認
- 各種デバイスサイズでの表示確認
```

### 使用例

**ページ検証:**
```
「Chrome DevTools MCPを使用して、localhost:3000/photosページの
DOM構造を確認してください」
```

**レスポンシブ確認:**
```
「Chrome DevTools MCPを使用して、写真ギャラリーページを
iPhone 14 Pro、iPad、デスクトップの各サイズで表示確認してください」
```

**パフォーマンス計測:**
```
「Chrome DevTools MCPを使用して、トップページのCore Web Vitalsを計測してください」
```

**コンソールエラー確認:**
```
「Chrome DevTools MCPを使用して、現在のページのコンソールエラーを確認してください」
```

**ネットワークリクエスト確認:**
```
「Chrome DevTools MCPを使用して、写真アップロード時の
ネットワークリクエストを確認してください」
```

---

## 統合ワークフロー例

### ワークフロー1: 新機能開発

```
1. [Next.js MCP] 新しいページコンポーネントを作成
   「app/albums/page.tsx にアルバム一覧ページを作成」

2. [Supabase MCP] 必要なデータベーステーブルを作成
   「albumsテーブルを作成」

3. [Next.js MCP] API Routeを作成
   「app/api/albums/route.ts を作成」

4. [Chrome DevTools MCP] ローカルで動作確認
   「localhost:3000/albums の表示を確認」

5. [Vercel MCP] プレビューデプロイを確認
   「最新のプレビューデプロイのURLを取得して動作確認」
```

### ワークフロー2: データベースマイグレーション

```
1. [Supabase MCP] スキーマ確認
   「現在のテーブル一覧とスキーマを確認」

2. [Supabase MCP] 新しいカラム追加
   「photosテーブルにlocation_nameカラムを追加」

3. [Supabase MCP] RLSポリシー更新
   「photosテーブルのRLSポリシーを確認・更新」

4. [Vercel MCP] 環境変数確認
   「データベース接続情報が正しく設定されているか確認」

5. [Vercel MCP] 本番デプロイ
   「デプロイ後のステータスを確認」
```

### ワークフロー3: パフォーマンス最適化

```
1. [Chrome DevTools MCP] 現在のパフォーマンス計測
   「Core Web Vitalsを計測」

2. [Chrome DevTools MCP] ボトルネック特定
   「ネットワークリクエストとレンダリング時間を確認」

3. [Next.js MCP] 画像最適化設定
   「next.config.jsに画像最適化設定を追加」

4. [Chrome DevTools MCP] 改善後の計測
   「最適化後のCore Web Vitalsを再計測」

5. [Vercel MCP] 本番デプロイ
   「最適化版をデプロイして確認」
```

### ワークフロー4: バグ修正

```
1. [Chrome DevTools MCP] エラー確認
   「コンソールエラーとネットワークエラーを確認」

2. [Supabase MCP] データベース確認
   「該当するデータが正しく保存されているか確認」

3. [Next.js MCP] コード修正
   「該当コンポーネント/API Routeを修正」

4. [Chrome DevTools MCP] 修正後の動作確認
   「エラーが解消されたか確認」

5. [Vercel MCP] プレビューデプロイで確認
   「プレビュー環境で動作確認」
```

---

## MCP設定ファイル

### Claude Code設定（~/.claude/config.json）

```json
{
  "mcpServers": {
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

---

## トラブルシューティング

### MCP接続エラー

**症状:** MCPサーバーに接続できない

**解決策:**
1. Claude Code設定ファイルのパスを確認
2. 認証情報（トークン、API Key）が正しいか確認
3. Claude Codeを再起動
4. MCPサーバーのバージョンを確認・更新

### 権限エラー

**症状:** 操作が権限エラーで失敗する

**解決策:**
1. Supabase: Service Role Keyを使用しているか確認
2. Vercel: トークンに適切な権限があるか確認
3. 該当リソースへのアクセス権限を確認

### パフォーマンス低下

**症状:** MCP操作が遅い

**解決策:**
1. ネットワーク接続を確認
2. 大量のデータを一度に取得しないようにする
3. 必要最小限のデータのみ取得するようクエリを最適化

---

## ベストプラクティス

### 1. MCP使用時の指示の明確化
- 何をしたいのか明確に伝える
- 必要な設定やパラメータを具体的に指定
- ドキュメントへの参照を含める

### 2. エラーハンドリング
- MCP操作でエラーが発生した場合、ログを確認
- 手動でも実行可能な操作であることを確認
- 代替手段を用意しておく

### 3. セキュリティ
- 認証情報は環境変数で管理
- 本番環境の操作は慎重に行う
- RLSポリシーは必ず設定する

### 4. 効率化
- 複数のMCPを組み合わせて使用
- 定型作業はワークフロー化
- よく使う操作はドキュメント化

---

## 参考リンク

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Next.js MCP](https://github.com/modelcontextprotocol/servers/tree/main/nextjs)
- [Supabase MCP](https://github.com/modelcontextprotocol/servers/tree/main/supabase)
- [Vercel MCP](https://github.com/modelcontextprotocol/servers/tree/main/vercel)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
