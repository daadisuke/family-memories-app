# 開発ワークフロー

## 概要

このドキュメントは、家族思い出アプリの開発における標準的なワークフローを説明します。
MCPを活用した効率的な開発プロセスを推奨します。

---

## 開発環境セットアップ

### 初回セットアップ

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd family-memories-app
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **環境変数の設定**
   ```bash
   cp .env.example .env.local
   # .env.localを編集して必要な値を設定
   ```

4. **Supabaseセットアップ**
   ```
   Claude Codeで:
   「Supabase MCPを使用してプロジェクトをセットアップしてください。
   docs/database-schema.mdのスキーマを適用してください」
   ```

5. **開発サーバー起動**
   ```bash
   npm run dev
   ```

6. **動作確認**
   ```
   Claude Codeで:
   「Chrome DevTools MCPを使用してlocalhost:3000の動作を確認してください」
   ```

---

## 日常的な開発フロー

### 1. 作業開始

#### ブランチ作成
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

#### 最新の変更を取得
```bash
npm install  # 新しい依存関係がある場合
```

---

### 2. 機能開発

#### ステップ1: 設計・計画

**タスク:**
- 実装する機能を明確化
- 必要なコンポーネント・APIを洗い出し
- データベーススキーマの確認・変更

**例:**
```
Claude Codeで:
「写真アルバム機能を実装したいです。
必要なコンポーネント、API、データベーステーブルをリストアップしてください」
```

#### ステップ2: データベース変更（必要な場合）

```
Claude Codeで:
「Supabase MCPを使用して、albumsテーブルを作成してください。
以下のカラムを含めてください: id, name, family_id, created_at」
```

**確認:**
```
「Supabase MCPを使用して、作成したテーブルのスキーマを確認してください」
```

#### ステップ3: APIルート作成

```
Claude Codeで:
「Next.js MCPを使用して、app/api/albums/route.tsを作成してください。
GET（一覧取得）とPOST（新規作成）メソッドを実装してください」
```

**実装内容:**
- 認証チェック
- バリデーション
- データベース操作
- エラーハンドリング

#### ステップ4: 型定義作成

```typescript
// types/database.ts に追加
export interface Album {
  id: string;
  name: string;
  family_id: string;
  created_at: string;
  updated_at: string;
}
```

#### ステップ5: コンポーネント作成

```
Claude Codeで:
「Next.js MCPを使用して、components/albums/AlbumList.tsxを作成してください。
アルバム一覧を表示するClient Componentとして実装してください」
```

#### ステップ6: ページ作成

```
Claude Codeで:
「Next.js MCPを使用して、app/(dashboard)/albums/page.tsxを作成してください。
Server Componentとしてデータ取得を含めてください」
```

#### ステップ7: ローカル動作確認

```bash
npm run dev
```

```
Claude Codeで:
「Chrome DevTools MCPを使用して、localhost:3000/albumsページの動作を確認してください。
- DOM構造の確認
- コンソールエラーの確認
- ネットワークリクエストの確認」
```

---

### 3. コード品質チェック

#### Lint・Format

```bash
npm run lint
npm run format
```

エラーがある場合は修正:
```bash
npm run lint:fix
```

#### 型チェック

```bash
npm run type-check
```

#### テスト実行（将来実装）

```bash
npm run test
npm run test:coverage
```

---

### 4. コミット

#### 変更を確認

```bash
git status
git diff
```

#### ステージング

```bash
git add .
# または特定ファイルのみ
git add app/api/albums/route.ts
```

#### コミット

```bash
git commit -m "feat: アルバム機能を追加

- アルバム一覧表示
- アルバム作成機能
- API Routes実装（GET, POST）
- AlbumListコンポーネント作成"
```

**コミットメッセージ規則:**
- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント
- `style:` コードスタイル（フォーマット等）
- `refactor:` リファクタリング
- `test:` テスト追加・修正
- `chore:` ビルド・設定変更

---

### 5. プッシュ・プルリクエスト

#### プッシュ

```bash
git push origin feature/your-feature-name
```

#### プルリクエスト作成

GitHubでプルリクエストを作成:

**PRテンプレート:**
```markdown
## 概要
アルバム機能を実装しました

## 変更内容
- [ ] albumsテーブル作成
- [ ] API Routes実装（/api/albums）
- [ ] AlbumListコンポーネント作成
- [ ] アルバム一覧ページ作成

## テスト
- [ ] ローカルで動作確認済み
- [ ] Chrome DevTools MCPで検証済み

## スクリーンショット
（必要に応じて）

## 関連Issue
#123
```

#### Vercelプレビュー確認

```
Claude Codeで:
「Vercel MCPを使用して、最新のプレビューデプロイのURLを取得してください」
```

プレビューURLで動作確認:
```
「Chrome DevTools MCPを使用して、プレビューデプロイの動作を確認してください」
```

---

### 6. レビュー・マージ

#### コードレビュー
- チームメンバーのレビューを待つ
- フィードバックがあれば修正

#### 修正コミット

```bash
git add .
git commit -m "fix: レビューフィードバック対応"
git push origin feature/your-feature-name
```

#### マージ

レビュー承認後、GitHubでマージ:
- Squash and merge（推奨）
- ブランチ削除

#### ローカルクリーンアップ

```bash
git checkout main
git pull origin main
git branch -d feature/your-feature-name
```

---

## 特定のタスク別ワークフロー

### A. バグ修正

1. **Issue確認**
   - バグ内容を理解
   - 再現手順を確認

2. **ブランチ作成**
   ```bash
   git checkout -b fix/bug-description
   ```

3. **原因調査**
   ```
   Claude Codeで:
   「Chrome DevTools MCPを使用して、エラーログを確認してください」
   「Supabase MCPを使用して、データベースの状態を確認してください」
   ```

4. **修正実装**
   - コードを修正
   - ローカルで動作確認

5. **テスト追加**（将来実装）
   - 再発防止のためのテストを追加

6. **コミット・PR作成**
   ```bash
   git commit -m "fix: 写真アップロード時のエラーを修正"
   ```

---

### B. データベースマイグレーション

1. **スキーマ変更計画**
   - 変更内容を `docs/database-schema.md` に反映

2. **ローカルで適用**
   ```
   Claude Codeで:
   「Supabase MCPを使用して、photosテーブルにdescriptionカラムを追加してください」
   ```

3. **SQLファイル作成**
   ```sql
   -- docs/sql/migrations/001_add_description_to_photos.sql
   ALTER TABLE photos ADD COLUMN description TEXT;
   ```

4. **アプリケーションコード更新**
   - 型定義を更新
   - 必要な箇所でカラムを使用

5. **動作確認**
   ```
   「Supabase MCPを使用して、変更が正しく適用されたか確認してください」
   ```

6. **本番適用準備**
   - マイグレーションSQLをドキュメント化
   - Vercel環境でのマイグレーション計画

---

### C. パフォーマンス最適化

1. **現状計測**
   ```
   Claude Codeで:
   「Chrome DevTools MCPを使用して、トップページのCore Web Vitalsを計測してください」
   ```

2. **ボトルネック特定**
   ```
   「Chrome DevTools MCPを使用して:
   - ネットワークリクエスト時間を確認
   - レンダリング時間を確認
   - JavaScriptの実行時間を確認」
   ```

3. **最適化実装**
   例:
   - 画像の遅延読み込み
   - コンポーネントのメモ化
   - データベースクエリ最適化

4. **再計測**
   ```
   「Chrome DevTools MCPを使用して、最適化後のCore Web Vitalsを再計測してください」
   ```

5. **結果をドキュメント化**
   - Before/Afterのメトリクスを記録

---

### D. 新しいMCP活用パターン開発

1. **MCP機能調査**
   ```
   Claude Codeで:
   「Next.js MCPで利用可能な機能をリストアップしてください」
   ```

2. **ワークフロー設計**
   - どのMCPを組み合わせるか
   - どの順序で実行するか

3. **実践・検証**
   - 実際にMCPを使用して作業
   - 効率化できたか確認

4. **ドキュメント化**
   - `docs/mcp-guide.md` に追加
   - ベストプラクティスとして共有

---

## チーム開発時の追加ルール

### コミュニケーション

1. **Issue作成**
   - 新機能・バグはすべてIssue化
   - ラベルを適切に付ける

2. **PR作成時**
   - 関連Issueをリンク
   - スクリーンショット・動画を添付
   - レビュアーを指定

3. **レビュー**
   - 24時間以内にレビュー開始
   - 建設的なフィードバック
   - 承認後は速やかにマージ

---

## デプロイフロー

### 開発環境（Vercel Preview）

- **トリガー**: プルリクエスト作成時
- **自動デプロイ**: Vercel
- **確認**: プレビューURLで動作確認

### 本番環境（Vercel Production）

- **トリガー**: mainブランチへのマージ
- **自動デプロイ**: Vercel
- **確認**: 本番URLで動作確認

### デプロイ後チェックリスト

```
Claude Codeで:
「Vercel MCPを使用して:
1. 最新デプロイのステータス確認
2. デプロイログの確認
3. 環境変数が正しく設定されているか確認」

「Chrome DevTools MCPを使用して:
1. 本番URLでの動作確認
2. Core Web Vitals計測
3. コンソールエラーチェック」
```

---

## トラブルシューティング

### ビルドエラー

1. **ローカルでビルド確認**
   ```bash
   npm run build
   ```

2. **型エラー確認**
   ```bash
   npm run type-check
   ```

3. **環境変数確認**
   ```
   「Vercel MCPを使用して、環境変数が正しく設定されているか確認してください」
   ```

### データベースエラー

1. **接続確認**
   ```
   「Supabase MCPを使用して、データベース接続をテストしてください」
   ```

2. **RLSポリシー確認**
   ```
   「Supabase MCPを使用して、該当テーブルのRLSポリシーを確認してください」
   ```

3. **クエリ確認**
   - SQLエラーログを確認
   - クエリを修正

### パフォーマンス問題

1. **計測**
   ```
   「Chrome DevTools MCPを使用して、パフォーマンスボトルネックを特定してください」
   ```

2. **最適化**
   - 画像最適化
   - クエリ最適化
   - キャッシング

3. **再計測**
   - 改善されたか確認

---

## ベストプラクティス

### 1. 小さく頻繁にコミット
- 機能単位で細かくコミット
- コミットメッセージは明確に

### 2. MCPを積極的に活用
- 手作業を減らす
- 自動化できる部分は自動化

### 3. ドキュメント更新
- コード変更時はドキュメントも更新
- 新しいパターンは共有

### 4. テストを書く（将来実装）
- 新機能にはテストを追加
- バグ修正にはリグレッションテストを追加

### 5. コードレビューを活用
- 積極的にフィードバック
- 学びの機会として活用

---

## チェックリスト

### 新機能開発完了チェックリスト

- [ ] ローカルで動作確認
- [ ] 型エラーなし（`npm run type-check`）
- [ ] Lintエラーなし（`npm run lint`）
- [ ] コミットメッセージが明確
- [ ] PRに説明を記載
- [ ] プレビューデプロイで確認
- [ ] Chrome DevTools MCPで動作確認
- [ ] ドキュメント更新（必要に応じて）

### バグ修正完了チェックリスト

- [ ] バグが再現しないことを確認
- [ ] 関連する機能に影響がないか確認
- [ ] テスト追加（将来実装）
- [ ] Issue番号をコミットメッセージに含める

### デプロイ前チェックリスト

- [ ] すべてのテストが通過
- [ ] ビルドが成功（`npm run build`）
- [ ] 環境変数が正しく設定されている
- [ ] データベースマイグレーションが完了
- [ ] ロールバック手順を確認

---

## 参考リンク

- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Workflow](https://vercel.com/docs/concepts/deployments/overview)
