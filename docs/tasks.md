# プロジェクトタスク管理

## 概要

このドキュメントは、家族思い出アプリの開発タスクを管理します。
各フェーズごとにタスクを整理し、進捗を追跡します。

**最終更新日**: 2025-11-13

---

## Phase 1: MVP（最小限の機能）

### 環境セットアップ

- [x] **Next.js プロジェクトセットアップ**
  - [x] Node.js 20.9+ インストール確認
  - [x] Next.js 16 (App Router) プロジェクト作成
  - [x] React 19 設定確認
  - [x] TypeScript 5+ 設定
  - [x] Tailwind CSS 設定
  - [x] ESLint/Prettier 設定
  - [x] Turbopack 動作確認（dev server）
  - [x] Next.js DevTools MCP 接続確認
  - [x] Git 初期化・リポジトリ作成
  - [x] ビルド・型チェック・Lint 確認
  - 担当者: Claude
  - 期限:
  - ステータス: 完了
  - 備考: docs/setup.md参照。Next.js DevTools MCP設定完了（パッケージ名を修正: next-devtools-mcp）

- [x] **環境変数設定**
  - [x] .env.example ファイル作成
  - [x] .env.local ファイル作成
  - [x] Supabase 環境変数設定（完了）
  - [x] NextAuth 環境変数設定（NEXTAUTH_SECRET生成完了、Google OAuth待ち）
  - [x] .gitignore に .env.local 追加確認
  - [x] 環境変数設定ガイド作成（docs/env-setup-guide.md）
  - [x] 必要なパッケージインストール（next-auth, @supabase/supabase-js, @supabase/ssr, zod）
  - 担当者: Claude
  - 期限:
  - ステータス: 完了（Google OAuthは手動設定が必要）

- [x] **Supabase プロジェクトセットアップ**
  - [x] Supabaseプロジェクト作成
  - [x] データベース初期化
  - [x] テーブル作成（users, families, photos, accounts, sessions）
  - [x] RLSポリシー設定
  - [x] Storageバケット作成（photos）
  - [x] Storage RLSポリシー設定
  - [x] シードデータ投入（テスト家族グループ）
  - [x] 環境変数設定
  - 担当者: Claude + User
  - 期限:
  - ステータス: 完了
  - 備考: SQL Editorでschema.sql実行完了、photosバケット作成完了、Storage RLSポリシー設定完了

- [x] **Vercel プロジェクト連携**
  - [x] Vercelプロジェクト作成
  - [x] GitHubリポジトリ連携
  - [x] 環境変数設定（本番・プレビュー）
  - [x] 自動デプロイ確認
  - 担当者: Claude
  - 期限:
  - ステータス: 完了
  - 備考: プロジェクト作成完了、GitHub自動デプロイ設定完了、環境変数設定完了（NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET）、本番URL: https://family-memories-app-phi.vercel.app

### 認証機能

- [x] **NextAuth.js セットアップ**
  - [x] NextAuth.js インストール
  - [x] Google OAuth設定
    - [x] Google Cloud Consoleでプロジェクト作成
    - [x] OAuth 2.0クライアントID作成
    - [x] 認証情報を環境変数に設定
  - [x] NextAuth設定ファイル作成（app/api/auth/[...nextauth]/route.ts）
  - [x] Supabase Adapter設定
  - 担当者: Claude
  - 期限:
  - ステータス: 完了
  - 備考: lib/auth.tsでNextAuth設定完了、Supabaseとの連携実装、Google OAuth設定完了

- [x] **ログインページ実装**
  - [x] app/(auth)/login/page.tsx 作成
  - [x] Googleログインボタンコンポーネント
  - [x] ログイン後のリダイレクト処理
  - 担当者: Claude
  - 期限:
  - ステータス: 完了
  - 備考: Suspense境界を使用したログインページ実装、エラーハンドリング実装

- [x] **認証ガード実装**
  - [x] middleware.ts で認証チェック
  - [x] 未認証時のリダイレクト
  - [x] セッション管理
  - 担当者: Claude
  - 期限:
  - ステータス: 完了
  - 備考: Next.js 16のミドルウェア実装、JWT tokenベースの認証、SessionProvider設定完了

- [x] **初回ログイン処理**
  - [x] 家族グループ作成フロー
  - [ ] 家族グループ参加フロー（招待機能）
  - [x] ユーザープロフィール設定
  - 担当者: Claude
  - 期限:
  - ステータス: 一部完了
  - 備考: オンボーディングページ実装、家族グループ作成API実装、ホームページからのリダイレクト実装、セッション更新機能実装。招待機能は今後の実装予定

### データベース設計

- [x] **データベーススキーマ実装**
  - [x] docs/sql/schema.sql 作成
  - [x] Supabase プロジェクト作成
  - [x] Supabase SQL Editor で schema.sql 実行
  - [x] スキーマ動作確認
  - [x] データベースユーティリティ関数作成（lib/db）
  - 担当者: Claude
  - 期限:
  - ステータス: 完了
  - 備考: 「Supabase プロジェクトセットアップ」タスクで既に実行済み。lib/db/families.ts, lib/db/users.ts でデータベース操作を抽象化、API routesをリファクタリング完了

- [x] **シードデータ作成（オプション）**
  - [x] docs/sql/seed.sql 作成
  - [x] テスト用家族データ定義
  - 担当者: Claude
  - 期限:
  - ステータス: 完了

### 写真アップロード機能

- [x] **写真アップロードAPI実装**
  - [x] app/api/photos/upload/route.ts 作成
  - [x] multipart/form-dataハンドリング
  - [x] Supabase Storageへのアップロード
  - [x] メタデータのDB保存
  - [x] エラーハンドリング
  - [x] lib/db/photos.ts データベース操作関数作成
  - [x] lib/storage/photos.ts ストレージ操作関数作成
  - 担当者: Claude
  - 期限:
  - ステータス: 完了
  - 備考: ファイルバリデーション（JPEG/PNG/WebP/HEIC、最大50MB）実装、ストレージパスは{family_id}/{user_id}/{filename}形式

- [x] **写真アップロードUI実装**
  - [x] app/(dashboard)/upload/page.tsx 作成
  - [x] ファイル選択コンポーネント
  - [x] ドラッグ&ドロップ対応
  - [x] アップロード進捗バー
  - [x] ファイルリストプレビュー表示
  - 担当者: Claude
  - 期限:
  - ステータス: 完了
  - 備考: ファイル名、サイズ表示、削除機能実装、アップロード完了後に写真ギャラリーへ自動リダイレクト

- [x] **複数ファイル一括アップロード**
  - [x] 複数ファイル選択対応
  - [x] バッチアップロード処理
  - [x] アップロード結果表示（進捗率）
  - 担当者: Claude
  - 期限:
  - ステータス: 完了
  - 備考: 順次アップロード処理、進捗バーでリアルタイム進捗表示

- [x] **EXIF撮影日取得機能**
  - [x] exifrライブラリのインストール
  - [x] EXIFメタデータ抽出ユーティリティ作成（lib/utils/exif.ts）
  - [x] 撮影日取得ロジック実装（DateTimeOriginal/CreateDate）
  - [x] アップロードAPI修正（taken_at設定）
  - [x] データベース関数修正（createPhoto）
  - 担当者: Claude
  - ステータス: 完了
  - 備考: exifr@7.1.3をインストール。lib/utils/exif.tsにextractDateTaken関数とextractGPSLocation関数（今後の実装用）を実装。app/api/photos/upload/route.tsでEXIF撮影日抽出処理追加。lib/db/photos.tsのCreatePhotoDataインターフェースを修正（takenAtがstring | Date型を受け付けるように）。EXIF取得失敗時はuploaded_atがデフォルト値として使用される。ビルド成功（15ページ）

### 動画アップロード・再生機能

- [x] **動画アップロード基盤実装**
  - [x] 動画ファイル形式サポート（MP4, MOV, AVI, WebM）
  - [x] ファイルサイズ制限設定（画像: 最大50MB、動画: 最大500MB）
  - [x] 動画メタデータ抽出ユーティリティ作成（lib/utils/video.ts）
  - [x] データベーススキーマ拡張マイグレーション作成（docs/sql/migrations/004_add_video_support.sql）
  - [x] lib/storage/photos.ts: validatePhotoFile関数を拡張（動画対応）
  - [x] lib/db/photos.ts: Photo/CreatePhotoDataインターフェース拡張（video_duration, video_codec, thumbnail_path追加）
  - [ ] app/api/photos/upload/route.ts: 動画メタデータ抽出・サムネイル生成統合（未実装）
  - 担当者: Claude
  - ステータス: ⚠️ 部分完了 (2025-11-15)
  - 実装済み:
    - バリデーション: MP4/MOV/AVI/WebM対応、500MB上限
    - 動画メタデータ抽出関数（duration, width, height）
    - サムネイル生成関数（最初のフレームからJPEG生成）
    - データベーススキーマ拡張（video_duration, video_codec, thumbnail_path）
    - isVideoFile()ヘルパー関数
  - 未実装:
    - アップロードAPIでの動画メタデータ抽出・サムネイル生成統合
    - サムネイルのStorage自動アップロード
  - 備考: photosテーブルは写真と動画の両方を格納（mime_typeで判別）。サムネイル生成は lib/utils/video.ts の generateVideoThumbnail() で実装済み（クライアントサイド処理）

- [x] **動画アップロードUI実装**
  - [x] app/(dashboard)/upload/page.tsx: 動画ファイル選択対応
  - [x] 動画プレビュー表示（アップロード前）
  - [x] アップロード進捗表示（大容量ファイル対応）
  - [x] 動画情報表示（ファイルサイズ、長さ、形式）
  - [x] app/api/photos/upload-url-signed/route.ts: 署名付きアップロードURL生成
  - [x] app/api/photos/upload-url/route.ts: 動画メタデータ受信・保存
  - 担当者: Claude
  - ステータス: ✅ 完了 (2025-11-16)
  - 実装内容:
    - ファイル選択でMP4/MOV/AVI/WebM対応（accept属性追加）
    - processFiles関数でファイル選択時に動画メタデータ抽出
    - グリッドレイアウトでファイルプレビュー表示（動画/画像を区別）
    - 動画プレビューに再生アイコン、VIDEOバッジ、長さ表示
    - 画像プレビューは<img>タグ使用（Blob URL対応）
    - FileWithPreviewインターフェースでpreview URL, isVideo, videoDuration管理
    - **署名付きアップロードURL方式で実装（Vercel 4.5MB制限対策）**
    - サーバーで署名付きURLを生成し、クライアントから直接Supabase Storageへアップロード
    - Storage RLS問題を署名付きURL方式で解決（サービスロールキー使用）
    - アップロード後にメタデータのみAPIで送信しDB保存
  - 備考: ドラッグ&ドロップで動画も受け付け可能。プレビューURLのクリーンアップ実装済み。署名付きURL方式により大容量動画ファイルのアップロードが可能

- [x] **動画再生機能実装（基本実装完了）**
  - [x] 動画プレーヤーコンポーネント作成（components/video/VideoPlayer.tsx）
  - [x] HTML5 video要素使用
  - [x] 再生コントロール（標準ブラウザコントロール使用）
  - [x] レスポンシブ対応（モバイル/デスクトップ）
  - 担当者: Claude
  - ステータス: ✅ 完了 (2025-11-15)
  - 実装内容:
    - HTML5 videoタグベースのシンプルなプレーヤー
    - controls属性で標準コントロール表示
    - poster属性でサムネイル表示対応
    - autoPlay, muted props対応
    - レスポンシブ対応（maxWidth: 100%, maxHeight: 80vh）
  - 備考: 外部ライブラリ不使用（ネイティブHTML5 video）。カスタムコントロールが必要な場合は react-player 等の導入を検討

- [x] **ギャラリーでの動画表示**
  - [x] app/(dashboard)/photos/page.tsx: 動画サムネイル表示
  - [x] 動画アイコン/バッジ表示（写真と区別）
  - [x] 動画の長さ表示（サムネイル上にオーバーレイ）
  - [x] app/api/photos/route.ts: mimeType, videoDuration, thumbnailPath追加
  - [ ] 動画と写真のフィルタリング機能（未実装）
  - 担当者: Claude
  - ステータス: ✅ 完了 (2025-11-15)
  - 実装内容:
    - 動画サムネイルに再生アイコン（黒背景の三角形、ホバー時に拡大）
    - 動画の長さを右下に表示（formatVideoDuration使用）
    - 左上に「VIDEO」バッジ表示（インディゴ背景）
    - Photo interfaceにmimeType, videoDuration, thumbnailPath追加
    - APIレスポンスに動画メタデータ追加
  - 備考: サムネイルに再生ボタンアイコンと動画長さ（例: 1:23）を表示。フィルタリング機能は今後実装予定

- [x] **動画詳細ページ実装**
  - [x] app/(dashboard)/photos/[photoId]/page.tsx: 動画再生対応
  - [x] 動画プレーヤー統合
  - [x] 動画メタデータ表示（長さ、解像度、形式）
  - [x] app/api/photos/[photoId]/route.ts: mimeType, videoDuration, thumbnailPath追加
  - [ ] 動画ダウンロード機能（未実装）
  - 担当者: Claude
  - ステータス: ✅ 完了 (2025-11-15)
  - 実装内容:
    - mime_typeで写真/動画を判別し表示切り替え
    - 動画の場合はVideoPlayerコンポーネントを表示
    - メタデータセクションのタイトルを「動画情報」に変更
    - 再生時間を表示（formatVideoDuration使用）
    - 解像度（width × height）表示
    - 形式（mime_type）表示
    - Photo interfaceにmimeType, videoDuration, thumbnailPath追加
  - 備考: 動画と写真で同じページを使用、条件分岐で表示を切り替え。ダウンロード機能は今後実装予定

- [ ] **動画圧縮・最適化（将来拡張）**
  - [ ] サーバーサイド動画変換（ffmpeg）
  - [ ] WebM/H.264形式への変換
  - [ ] 複数解像度生成（360p, 720p, 1080p）
  - [ ] アダプティブストリーミング対応
  - 担当者: Claude
  - ステータス: Phase 3-4予定
  - 備考: Vercel Edgeでは動画処理困難なため、別サーバー（AWS Lambda, Cloud Run等）で処理

### 写真ギャラリー表示

- [x] **写真一覧API実装**
  - [x] app/api/photos/route.ts 作成
  - [x] ページネーション実装（limit, offset）
  - [x] ソート機能（uploaded_at, taken_at, created_at）
  - [ ] フィルタリング機能（日付、タグ）※今後の実装予定
  - 担当者: Claude
  - 期限:
  - ステータス: 完了
  - 備考: lib/db/photos.tsのgetPhotosByFamilyId関数を使用、署名付きURL生成機能実装

- [x] **写真ギャラリーUI実装**
  - [x] app/(dashboard)/photos/page.tsx 作成
  - [x] グリッドレイアウト
  - [x] 遅延読み込み（Lazy Loading）
  - [ ] 無限スクロール（もっと読み込むボタンで代替実装済み）
  - [x] レスポンシブデザイン
  - 担当者: Claude
  - 期限:
  - ステータス: 完了
  - 備考: Next.js Image最適化、2-5列のレスポンシブグリッド、ホバーエフェクト実装、空状態UI実装、next.config.tsにSupabase画像ドメイン設定完了

- [x] **写真詳細表示**
  - [x] app/(dashboard)/photos/[photoId]/page.tsx 作成
  - [x] フルサイズ画像表示
  - [x] メタデータ表示
  - [x] 前後の写真へのナビゲーション
  - 担当者: Claude
  - ステータス: 完了
  - 備考: キーボードショートカット実装（←→で前後移動、Escでギャラリーに戻る）、レスポンシブデザイン、API endpoint実装

- [x] **写真詳細ページに撮影日表示**
  - [x] 撮影日時の表示追加
  - [x] EXIF撮影日がない場合の対応
  - 担当者: Claude
  - ステータス: 完了
  - 備考: app/(dashboard)/photos/[photoId]/page.tsxで撮影日時の表示を強化。EXIFから取得した撮影日時には📷アイコンと「(EXIF)」ラベルを追加。撮影日がある場合は「撮影日時」→「アップロード日時」の順で表示。撮影日がない場合は「アップロード日時」のみ表示。日時フォーマットを統一（年月日時分表示）。各項目にアイコンを追加（📷撮影日、⬆️アップロード、📐サイズ）。ビルド成功（15ページ）

### 動作確認・テスト

- [x] **Next.js DevTools MCPでの動作確認**
  - [x] プロジェクト構造の確認
  - [x] ルーティング情報の取得
  - [x] ビルドエラーの診断
  - [ ] パフォーマンスボトルネックの特定（今後の実装予定）
  - 担当者: Claude
  - ステータス: 完了
  - 備考: 本番ビルド成功、TypeScript型エラー修正完了、ルート構造確認（11ページ）。ミドルウェア→プロキシ移行の警告あり（今後対応予定）

- [x] **Chrome DevTools MCPでの動作確認**
  - [x] ローカル環境での動作確認
  - [x] レスポンシブデザイン検証（グリッドレイアウト2-5列）
  - [ ] Core Web Vitals 計測（今後の実装予定）
  - [x] コンソールエラーチェック
  - 担当者: Claude + User
  - ステータス: 完了
  - 備考: Chrome DevTools MCPを使用した自動検証完了。ログインページの表示確認、コンソールエラーなし（HMRとReact DevToolsのみ）、ネットワークエミュレーション（Fast 4G）で正常動作、プロダクションビルド成功（11ページ）。認証後のページ（写真ギャラリー、写真詳細）の動作は手動確認済み。署名付きURL、画像表示、ナビゲーション機能が正常動作

- [x] **プレビューデプロイ確認**
  - [x] Vercelプレビュー環境での動作確認
  - [x] 本番環境変数の動作確認
  - 担当者: Claude
  - ステータス: 完了
  - 備考: Vercel CLIで検証完了。最新デプロイメント（2時間前）が正常稼働中（Status: Ready）。本番URL: https://family-memories-app-phi.vercel.app。すべての必要な環境変数が設定済み（GOOGLE_CLIENT_ID/SECRET, NEXTAUTH_SECRET, SUPABASE keys）。WebFetchでページロード確認、エラーなし。Next.jsハイドレーション正常。developブランチの最新コミット（写真詳細ページ、MCP検証完了）がデプロイ済み

---

## Phase 2: 検索・共有機能

### 家族アカウント機能

- [x] **家族グループ管理API**
  - [x] app/api/families/route.ts 作成
  - [x] 家族グループ作成
  - [x] 家族メンバー一覧取得
  - [x] メンバー追加・削除
  - 担当者: Claude
  - ステータス: 完了
  - 備考: app/api/families/route.tsで家族グループ作成（POST）とメンバー一覧取得（GET）を実装済み。app/api/families/members/route.tsでメンバー管理機能実装（GET: メンバー一覧、DELETE: メンバー削除、PATCH: 役割更新）。lib/db/families.tsに管理用ヘルパー関数追加（removeUserFromFamily, updateUserRole, getFamilyMemberById）。管理者権限チェック実装済み。ビルド成功（12ページ）

- [x] **家族グループ管理UI**
  - [x] app/(dashboard)/family/page.tsx 作成
  - [x] メンバー一覧表示
  - [ ] 招待機能（今後の実装予定）
  - [x] 権限管理UI
  - 担当者: Claude
  - ステータス: 完了
  - 備考: app/(dashboard)/family/page.tsxで家族管理ページ実装完了。メンバー一覧表示（アバター、名前、メール、役割、参加日）、管理者による役割更新（admin/member）、メンバー削除機能（自分以外）実装。app/(dashboard)/layout.tsxにナビゲーションバー追加（レスポンシブ対応、モバイルメニュー含む）。管理者権限チェック実装済み。招待機能UIはプレースホルダーとして配置。ビルド成功（13ページ）

- [x] **家族グループ招待機能**
  - [x] family_invitationsテーブル作成
  - [x] 招待データベース関数実装（lib/db/invitations.ts）
  - [x] 招待API実装（作成・一覧・受諾・削除）
  - [x] 招待UI実装（メール入力、招待リンク生成・コピー、送信済み招待一覧）
  - [x] 招待受諾ページ実装（app/(auth)/invite/[token]/page.tsx）
  - 担当者: Claude
  - ステータス: 完了
  - 備考: UUIDトークンベースの招待システム実装完了。docs/sql/migrations/003_create_family_invitations.sqlでテーブル作成（id, family_id, email, token, status, created_by, expires_at）、RLSポリシー設定（管理者のみ作成・削除可能、家族メンバーは閲覧可能）。lib/db/invitations.tsに招待管理関数実装（createInvitation: 7日間有効期限、getInvitationsByFamily, getInvitationByToken, acceptInvitation: メール検証・期限チェック・家族登録、deleteInvitation, cancelInvitation）。API実装（GET/POST/DELETE /api/families/invitations、GET /api/families/invitations/[token]、POST /api/families/invitations/[token]/accept）。app/(dashboard)/family/page.tsxに招待UI追加（メール入力フォーム、招待リンクコピーボタン、送信済み招待一覧表示、期限切れ表示、削除ボタン）。app/(auth)/invite/[token]/page.tsxで招待受諾ページ実装（トークン検証、自動受諾フロー、ログインプロンプト、メール一致確認、期限切れ・使用済みエラー表示）。ビルド成功（16ページ）

### 写真検索機能

- [x] **検索API実装**
  - [x] タグ検索
  - [x] 日付範囲検索
  - [x] フリーワード検索
  - [x] 複合検索
  - 担当者: Claude
  - ステータス: 完了
  - 備考: app/api/photos/search/route.tsで検索APIエンドポイント実装完了。lib/db/photos.tsにsearchPhotos関数とgetPhotoCountBySearch関数を追加。タグ検索（複数タグAND条件）、日付範囲検索（taken_at基準）、フリーワード検索（description/file_name対象、部分一致）、複合検索（すべての条件を組み合わせ可能）実装。ページネーション対応（limit/offset）、ソート機能（uploaded_at/taken_at/created_at、asc/desc）、検索結果総数取得機能実装。ビルド成功（14ページ）

- [x] **検索UI実装**
  - [x] 検索バーコンポーネント
  - [x] フィルターコンポーネント（タグ、日付範囲）
  - [x] 検索結果表示
  - [ ] 保存した検索条件（今後の実装予定）
  - 担当者: Claude
  - ステータス: 完了
  - 備考: app/(dashboard)/search/page.tsxで検索ページ実装完了。キーワード入力（Enter対応）、タグ入力（カンマ区切り）、日付範囲ピッカー（from/to）、検索・クリアボタン実装。URLクエリパラメータからの自動検索対応。検索結果グリッド表示（レスポンシブ2-5列）、写真にタグバッジ表示、結果件数・検索条件表示、空状態（初期・検索結果なし）実装。Suspense境界でuseSearchParams()ラップ。app/(dashboard)/layout.tsxのナビゲーションに検索リンク追加（🔍アイコン）。ビルド成功（15ページ）

### 写真タグ管理機能

- [x] **タグ追加・編集・削除API実装**
  - [x] 写真にタグ追加API（PATCH /api/photos/[photoId]/tags）
  - [x] タグ削除API（同じエンドポイント、配列操作）
  - [x] 複数タグ一括追加対応
  - [x] バリデーション（タグ名の長さ、特殊文字制限）
  - 担当者: Claude
  - ステータス: 完了
  - 備考: app/api/photos/[photoId]/tags/route.tsでタグ管理APIエンドポイント実装。actionパラメータ（set/add/remove）で操作を切り替え。lib/db/photos.tsにupdatePhotoTags関数追加（重複排除、配列操作）。バリデーション実装（1-50文字、日本語・英数字・スペース・ハイフン・アンダースコア許可）。family_idによるアクセス制御。ビルド成功（17ページ）

- [x] **写真詳細ページにタグ編集UI実装**
  - [x] タグ入力フィールド追加（app/(dashboard)/photos/[photoId]/page.tsx）
  - [x] 既存タグ表示とクリックで削除機能
  - [x] タグ追加ボタン（Enter対応）
  - [x] タグ保存時のリアルタイム更新
  - [x] タグクリックで検索ページへ遷移（クイック検索）
  - 担当者: Claude
  - ステータス: 完了
  - 備考: 写真詳細ページにタグセクション追加。既存タグにホバーで×ボタン表示、クリックで削除。タグ入力欄＋追加ボタン実装（Enter対応、disabled状態管理）。タグクリックで/search?tags=タグ名にルーティング。リアルタイム更新（API呼び出し後、即座にUI反映）。フィードバックメッセージ（追加中...、エラー時はalert）実装

- [x] **ギャラリーページにタグフィルター実装**
  - [x] タグフィルター追加（app/(dashboard)/photos/page.tsx）
  - [x] 使用中のタグ一覧取得API（GET /api/tags）
  - [x] タグ選択でギャラリーを絞り込み表示
  - [x] 複数タグ選択対応（AND条件）
  - 担当者: Claude
  - ステータス: 完了
  - 備考: app/api/tags/route.tsでタグ一覧APIエンドポイント実装。lib/db/photos.tsにgetTagsByFamily関数追加（使用頻度順ソート、カウント付き）。ギャラリーページにタグフィルターセクション追加（クリックで選択/解除、選択中は青背景）。タグカウント表示（例: 旅行 (15)）。複数タグ選択時は既存の検索APIを使用（AND条件）。クリアボタン実装。絞り込み状態表示（「3個のタグで絞り込み中」）。ビルド成功（17ページ）

- [ ] **タグ管理ページ実装（将来拡張）**
  - [ ] 全タグ一覧表示（app/(dashboard)/tags/page.tsx）
  - [ ] タグのリネーム機能（一括更新）
  - [ ] タグのマージ機能（複数タグを統合）
  - [ ] 使用されていないタグの削除
  - [ ] タグ使用統計表示
  - 担当者: Claude
  - ステータス: Phase 3-4予定
  - 備考: 管理者のみアクセス可能。タグの正規化と整理に使用

### 写真削除機能

- [x] **写真削除API実装**
  - [x] DELETE /api/photos/[photoId] エンドポイント作成
  - [x] 権限チェック（家族メンバー全員が削除可能）
  - [x] Supabase Storageからファイル削除（lib/storage/photos.ts: deletePhotoFromStorage関数は既存）
  - [x] データベースから写真レコード削除（lib/db/photos.ts: deletePhoto関数）
  - [x] エラーハンドリング（ストレージ削除失敗時はログ記録、DBレコードは削除済み）
  - 担当者: Claude
  - ステータス: ✅ 完了 (2025-11-15)
  - 実装内容:
    - app/api/photos/[photoId]/route.ts: DELETE ハンドラー実装
    - lib/db/photos.ts: deletePhoto関数実装（familyId検証のみ）
    - lib/storage/photos.ts: deletePhotoFromStorage関数は既存で利用可能
    - エラーハンドリング: 404 (写真なし), 500 (サーバーエラー)
    - 家族メンバー全員が削除権限を持つ（家族グループの写真は家族全員で管理）

- [x] **写真詳細ページに削除UI実装**
  - [x] 削除ボタン追加（app/(dashboard)/photos/[photoId]/page.tsx）
  - [x] 確認ダイアログ実装（「本当に削除しますか？」2段階確認）
  - [x] 削除後のリダイレクト（ギャラリーページへ）
  - [x] ローディング状態表示（削除中...）
  - [x] エラーハンドリング（削除失敗時のalertメッセージ表示）
  - [x] 権限チェック（canDelete: 家族メンバー全員に表示）
  - 担当者: Claude
  - ステータス: ✅ 完了 (2025-11-15)
  - 実装内容:
    - 削除セクション: キーボードショートカットの下に赤いボーダーで配置
    - 2段階確認: 「削除」ボタンクリック → 「はい、削除します」「キャンセル」表示
    - 家族メンバー全員に削除ボタンが表示される
    - 削除成功時は /photos へリダイレクト

- [ ] **ギャラリーページに一括削除機能実装（将来拡張）**
  - [ ] 写真選択モード（チェックボックス表示）
  - [ ] 複数写真選択機能
  - [ ] 一括削除ボタン
  - [ ] 一括削除API（DELETE /api/photos/bulk）
  - [ ] 削除進捗表示
  - 担当者: Claude
  - ステータス: Phase 3-4予定
  - 備考: 選択モード切り替えボタン。管理者のみ一括削除可能。削除確認ダイアログに選択枚数表示

### 位置情報・マップ表示機能

- [x] **GPS位置情報抽出機能**
  - [x] 写真アップロード時のGPS抽出実装（app/api/photos/upload/route.ts）
  - [x] データベースインターフェース更新（lib/db/photos.ts: CreatePhotoData.location追加）
  - [x] exifr既存関数（extractGPSLocation）の活用
  - 担当者: Claude
  - ステータス: 完了
  - 備考: app/api/photos/upload/route.tsでextractGPSLocation関数を並列実行（Promise.all）、EXIFから取得した位置情報をcreatePhoto関数に渡すように実装。lib/db/photos.tsのCreatePhotoDataインターフェースは既にlocation対応済み（location?: any）。photosテーブルのlocation JSONB列を使用。{ latitude: number, longitude: number }形式でデータ保存。GPS情報がない場合はundefinedでデータベースにnullが保存される

- [x] **地図表示機能（写真詳細ページ）**
  - [x] 地図ライブラリインストール（react-leaflet, leaflet, @types/leaflet）
  - [x] 地図コンポーネント作成（components/maps/PhotoLocationMap.tsx）
  - [x] 写真詳細ページに地図セクション追加（app/(dashboard)/photos/[photoId]/page.tsx）
  - [x] Leaflet CSSインポート（コンポーネント内でインポート）
  - [x] 位置情報の有無による条件表示
  - [x] 写真詳細APIにlocation情報追加（app/api/photos/[photoId]/route.ts）
  - 担当者: Claude
  - ステータス: 完了
  - 備考: react-leaflet@4.2.1、leaflet@1.9.4、@types/leaflet@1.9.15をインストール。components/maps/PhotoLocationMap.tsxで地図コンポーネント実装（OpenStreetMapタイル使用、マーカー＋ポップアップ表示、scrollWheelZoom無効化、デフォルトアイコン修正）。app/(dashboard)/photos/[photoId]/page.tsxで動的インポート（ssr: false）実装、Photoインターフェースにlocation追加、地図セクション条件付き表示（📍アイコン、(EXIF)ラベル、座標表示）。app/api/photos/[photoId]/route.tsでレスポンスにlocation追加。ビルド成功（16ページ）

- [ ] **地図ギャラリービュー（将来実装）**
  - [ ] ギャラリー全体を地図表示（app/(dashboard)/photos/map/page.tsx）
  - [ ] マーカークラスタリング機能
  - [ ] 地図上で写真クリック→詳細表示
  - [ ] 日付・タグによる地図フィルタリング
  - 担当者: Claude
  - ステータス: Phase 3-4予定
  - 備考: 全写真を1つの地図にマーカー表示。「この場所の近くで撮影」検索機能の実装

### レスポンシブデザイン最適化

- [ ] **モバイル対応**
  - [ ] スマートフォン表示最適化
  - [ ] タッチ操作対応
  - [ ] モバイルメニュー実装
  - 担当者:
  - 期限:
  - ステータス: 未着手

- [ ] **タブレット対応**
  - [ ] タブレット表示最適化
  - [ ] グリッドレイアウト調整
  - 担当者:
  - 期限:
  - ステータス: 未着手

---

## Phase 3: AI機能

### FastAPI セットアップ

- [ ] **FastAPIプロジェクト作成**
  - [ ] FastAPIプロジェクト初期化
  - [ ] Docker設定
  - [ ] 環境変数設定
  - 担当者:
  - 期限:
  - ステータス: 未着手

- [ ] **FastAPIデプロイ**
  - [ ] Render/Railwayプロジェクト作成
  - [ ] CI/CD設定
  - [ ] 本番環境デプロイ
  - 担当者:
  - 期限:
  - ステータス: 未着手

### Claude AI連携

- [ ] **Claude API連携**
  - [ ] Anthropic API設定
  - [ ] 画像認識エンドポイント実装
  - [ ] タグ生成ロジック実装
  - 担当者:
  - 期限:
  - ステータス: 未着手

### 自動タグ付け機能

- [ ] **AIタグ付けAPI実装**
  - [ ] app/api/ai/tag-photos/route.ts 作成
  - [ ] FastAPI連携
  - [ ] バックグラウンド処理（Queue）
  - [ ] ジョブステータス管理
  - 担当者:
  - 期限:
  - ステータス: 未着手

- [ ] **AIタグ付けUI実装**
  - [ ] 手動タグ付け開始ボタン
  - [ ] 処理進捗表示
  - [ ] タグ確認・編集UI
  - 担当者:
  - 期限:
  - ステータス: 未着手

### 人物認識機能

- [ ] **人物認識実装**
  - [ ] 顔検出ロジック
  - [ ] 人物タグ付け
  - [ ] 人物グルーピング
  - 担当者:
  - 期限:
  - ステータス: 未着手

---

## Phase 4: 最適化・拡張

### パフォーマンス最適化

- [ ] **画像最適化**
  - [ ] Next.js Image Optimization活用
  - [ ] 画像圧縮処理
  - [ ] WebP形式対応
  - 担当者:
  - 期限:
  - ステータス: 未着手

- [ ] **キャッシング実装**
  - [ ] APIレスポンスキャッシュ
  - [ ] CDN活用
  - [ ] ブラウザキャッシュ最適化
  - 担当者:
  - 期限:
  - ステータス: 未着手

### 高度な検索機能

- [ ] **全文検索実装**
  - [ ] PostgreSQL Full-Text Search
  - [ ] 検索インデックス最適化
  - 担当者:
  - 期限:
  - ステータス: 未着手

### アルバム機能

- [ ] **アルバムAPI実装**
  - [ ] app/api/albums/route.ts 作成
  - [ ] アルバム作成・編集・削除
  - [ ] 写真のアルバム追加・削除
  - 担当者:
  - 期限:
  - ステータス: 未着手

- [ ] **アルバムUI実装**
  - [ ] app/(dashboard)/albums/page.tsx 作成
  - [ ] アルバム一覧表示
  - [ ] アルバム詳細表示
  - [ ] アルバム作成UI
  - 担当者:
  - 期限:
  - ステータス: 未着手

### 共有リンク生成

- [ ] **共有リンク機能実装**
  - [ ] 共有リンクAPI実装
  - [ ] 有効期限設定
  - [ ] パスワード保護
  - 担当者:
  - 期限:
  - ステータス: 未着手

---

## バグ・課題管理

### 既知の問題

| ID | 優先度 | 問題 | 担当者 | ステータス |
|----|--------|------|--------|-----------|
| - | - | - | - | - |

### 技術的負債

| ID | 優先度 | 内容 | 担当者 | ステータス |
|----|--------|------|--------|-----------|
| - | - | - | - | - |

---

## ドキュメント作成タスク

- [x] 要件定義書（requirement.md）
- [x] セットアップガイド（setup.md）
- [x] データベーススキーマ（database-schema.md）
- [x] API仕様書（api-spec.md）
- [x] MCP活用ガイド（mcp-guide.md）
- [x] プロジェクト構造（project-structure.md）
- [x] 開発ワークフロー（workflow.md）
- [x] ドキュメント索引（README.md）
- [x] タスク管理（tasks.md）本ドキュメント
- [ ] テスト計画書
- [ ] デプロイ手順書
- [ ] 運用マニュアル

---

## マイルストーン

### M1: MVP完成（Phase 1完了）
- **目標日**: 未設定
- **完了条件**:
  - 認証機能が動作
  - 写真アップロードが可能
  - 写真ギャラリー表示が可能
  - Vercel本番環境デプロイ完了

### M2: 基本機能完成（Phase 2完了）
- **目標日**: 未設定
- **完了条件**:
  - 家族アカウント機能が動作
  - 写真検索機能が動作
  - レスポンシブデザイン対応完了

### M3: AI機能実装（Phase 3完了）
- **目標日**: 未設定
- **完了条件**:
  - AI自動タグ付け機能が動作
  - 人物認識機能が動作
  - AIタグの精度80%以上

### M4: 本番リリース（Phase 4完了）
- **目標日**: 未設定
- **完了条件**:
  - パフォーマンス最適化完了
  - アルバム機能実装
  - 共有リンク機能実装
  - 家族での実運用開始

---

## 週次進捗レポート

### Week 1 (2025-11-02 〜)
- **完了タスク**:
  - ドキュメント作成（requirement.md, setup.md等）
- **進行中タスク**:
  - 未設定
- **次週の予定**:
  - 環境セットアップ開始
- **課題・ブロッカー**:
  - なし

---

## 参考リンク

- [要件定義書](./requirement.md)
- [セットアップガイド](./setup.md)
- [開発ワークフロー](./workflow.md)
- [GitHub Issues](未設定)
- [プロジェクトボード](未設定)

---

## 更新履歴

| 日付 | 更新内容 |
|------|----------|
| 2025-11-02 | タスク管理ドキュメント初版作成 |
| 2025-11-03 | 環境セットアップタスク統合、データベース設計タスク詳細化、Next.js DevTools MCP動作確認追加 |
| 2025-11-12 | 写真アップロード機能完了、写真一覧API実装完了をマーク |
| 2025-11-13 | 写真ギャラリーUI実装完了、写真詳細表示機能実装完了をマーク、Phase 1 MVP基本機能完了 |
