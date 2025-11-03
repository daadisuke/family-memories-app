# API仕様書

## 概要

このドキュメントは、家族思い出アプリのAPI仕様を定義します。
Next.js App Router の Route Handlers を使用したREST API と、将来的なFastAPI連携を含みます。

## ベースURL

- **開発環境**: `http://localhost:3000`
- **本番環境**: `https://your-app.vercel.app`

## 認証

すべてのAPIエンドポイントは NextAuth.js によるセッション認証が必要です。

### 認証ヘッダー

```
Cookie: next-auth.session-token=<session-token>
```

### エラーレスポンス（未認証）

```json
{
  "error": "Unauthorized",
  "message": "認証が必要です"
}
```

---

## エンドポイント一覧

### 認証関連

#### POST `/api/auth/signup`
新規ユーザー登録

**リクエストボディ:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "山田太郎",
  "familyId": "uuid-of-family" // オプション
}
```

**レスポンス（201 Created）:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "山田太郎",
    "familyId": "uuid-of-family"
  }
}
```

#### POST `/api/auth/signin`
ログイン（NextAuthが処理）

#### POST `/api/auth/signout`
ログアウト（NextAuthが処理）

---

### ユーザー関連

#### GET `/api/users/me`
現在のユーザー情報を取得

**レスポンス（200 OK）:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "山田太郎",
    "image": "https://...",
    "familyId": "uuid-of-family",
    "role": "member",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### PATCH `/api/users/me`
現在のユーザー情報を更新

**リクエストボディ:**
```json
{
  "name": "山田次郎",
  "image": "https://..."
}
```

**レスポンス（200 OK）:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "山田次郎",
    "image": "https://...",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 家族グループ関連

#### GET `/api/families/[familyId]`
家族グループ情報を取得

**レスポンス（200 OK）:**
```json
{
  "family": {
    "id": "uuid",
    "name": "山田家",
    "members": [
      {
        "id": "uuid",
        "name": "山田太郎",
        "email": "user@example.com",
        "role": "admin"
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST `/api/families`
新規家族グループを作成

**リクエストボディ:**
```json
{
  "name": "山田家"
}
```

**レスポンス（201 Created）:**
```json
{
  "family": {
    "id": "uuid",
    "name": "山田家",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### PATCH `/api/families/[familyId]`
家族グループ情報を更新

**リクエストボディ:**
```json
{
  "name": "田中家"
}
```

**レスポンス（200 OK）:**
```json
{
  "family": {
    "id": "uuid",
    "name": "田中家",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST `/api/families/[familyId]/invite`
家族メンバーを招待

**リクエストボディ:**
```json
{
  "email": "newmember@example.com"
}
```

**レスポンス（200 OK）:**
```json
{
  "message": "招待メールを送信しました",
  "inviteToken": "token"
}
```

---

### 写真関連

#### GET `/api/photos`
写真一覧を取得（ページネーション対応）

**クエリパラメータ:**
- `page`: ページ番号（デフォルト: 1）
- `limit`: 1ページあたりの件数（デフォルト: 50）
- `sortBy`: ソート基準（`uploadedAt` | `takenAt`）
- `order`: ソート順（`asc` | `desc`）
- `tags`: タグフィルター（カンマ区切り）
- `startDate`: 開始日（YYYY-MM-DD）
- `endDate`: 終了日（YYYY-MM-DD）

**例:**
```
GET /api/photos?page=1&limit=50&sortBy=takenAt&order=desc&tags=家族,旅行
```

**レスポンス（200 OK）:**
```json
{
  "photos": [
    {
      "id": "uuid",
      "userId": "uuid",
      "familyId": "uuid",
      "storagePath": "family-uuid/photo.jpg",
      "fileName": "photo.jpg",
      "fileSize": 1024000,
      "mimeType": "image/jpeg",
      "width": 1920,
      "height": 1080,
      "uploadedAt": "2024-01-01T00:00:00Z",
      "takenAt": "2023-12-31T12:00:00Z",
      "tags": ["家族", "旅行"],
      "aiProcessed": true,
      "description": "家族旅行の写真",
      "url": "https://supabase-storage-url/..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### GET `/api/photos/[photoId]`
写真詳細を取得

**レスポンス（200 OK）:**
```json
{
  "photo": {
    "id": "uuid",
    "userId": "uuid",
    "familyId": "uuid",
    "storagePath": "family-uuid/photo.jpg",
    "fileName": "photo.jpg",
    "fileSize": 1024000,
    "mimeType": "image/jpeg",
    "width": 1920,
    "height": 1080,
    "uploadedAt": "2024-01-01T00:00:00Z",
    "takenAt": "2023-12-31T12:00:00Z",
    "location": {
      "latitude": 35.6812,
      "longitude": 139.7671
    },
    "tags": ["家族", "旅行"],
    "aiProcessed": true,
    "aiProcessedAt": "2024-01-01T01:00:00Z",
    "description": "家族旅行の写真",
    "url": "https://supabase-storage-url/...",
    "uploader": {
      "id": "uuid",
      "name": "山田太郎"
    }
  }
}
```

#### POST `/api/photos/upload`
写真をアップロード

**リクエスト（multipart/form-data）:**
```
POST /api/photos/upload
Content-Type: multipart/form-data

files: [File, File, ...]
takenAt: "2023-12-31T12:00:00Z" (optional)
description: "家族旅行の写真" (optional)
```

**レスポンス（201 Created）:**
```json
{
  "photos": [
    {
      "id": "uuid",
      "fileName": "photo1.jpg",
      "storagePath": "family-uuid/photo1.jpg",
      "url": "https://supabase-storage-url/..."
    },
    {
      "id": "uuid",
      "fileName": "photo2.jpg",
      "storagePath": "family-uuid/photo2.jpg",
      "url": "https://supabase-storage-url/..."
    }
  ],
  "uploaded": 2,
  "failed": 0
}
```

#### PATCH `/api/photos/[photoId]`
写真メタデータを更新

**リクエストボディ:**
```json
{
  "description": "更新された説明",
  "tags": ["家族", "旅行", "海"],
  "takenAt": "2023-12-31T12:00:00Z"
}
```

**レスポンス（200 OK）:**
```json
{
  "photo": {
    "id": "uuid",
    "description": "更新された説明",
    "tags": ["家族", "旅行", "海"],
    "takenAt": "2023-12-31T12:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### DELETE `/api/photos/[photoId]`
写真を削除

**レスポンス（200 OK）:**
```json
{
  "message": "写真を削除しました",
  "deletedId": "uuid"
}
```

#### GET `/api/photos/[photoId]/url`
署名付きURL取得

**クエリパラメータ:**
- `expiresIn`: 有効期限（秒）（デフォルト: 3600）

**レスポンス（200 OK）:**
```json
{
  "url": "https://supabase-storage-url/...",
  "expiresAt": "2024-01-01T01:00:00Z"
}
```

---

### タグ関連

#### GET `/api/tags`
家族グループのすべてのタグを取得

**レスポンス（200 OK）:**
```json
{
  "tags": [
    {
      "name": "家族",
      "count": 150
    },
    {
      "name": "旅行",
      "count": 75
    }
  ]
}
```

#### GET `/api/tags/suggestions`
タグ候補を取得（オートコンプリート用）

**クエリパラメータ:**
- `q`: 検索クエリ

**例:**
```
GET /api/tags/suggestions?q=家
```

**レスポンス（200 OK）:**
```json
{
  "suggestions": ["家族", "家", "家族旅行"]
}
```

---

### AI処理関連（将来実装）

#### POST `/api/ai/tag-photos`
写真に自動タグ付け

**リクエストボディ:**
```json
{
  "photoIds": ["uuid1", "uuid2"]
}
```

**レスポンス（202 Accepted）:**
```json
{
  "message": "AI処理をキューに追加しました",
  "jobId": "job-uuid",
  "status": "pending"
}
```

#### GET `/api/ai/jobs/[jobId]`
AI処理ジョブのステータス確認

**レスポンス（200 OK）:**
```json
{
  "jobId": "job-uuid",
  "status": "completed",
  "processedPhotos": 2,
  "totalPhotos": 2,
  "results": [
    {
      "photoId": "uuid1",
      "tags": ["人物", "屋外", "笑顔"],
      "confidence": 0.95
    }
  ]
}
```

---

## エラーレスポンス

### 共通エラーフォーマット

```json
{
  "error": "ErrorType",
  "message": "エラーメッセージ",
  "details": {} // オプション
}
```

### HTTPステータスコード

| コード | 説明 |
|-------|------|
| 200 | OK - 成功 |
| 201 | Created - リソース作成成功 |
| 400 | Bad Request - リクエストが不正 |
| 401 | Unauthorized - 認証が必要 |
| 403 | Forbidden - アクセス権限がない |
| 404 | Not Found - リソースが見つからない |
| 409 | Conflict - リソースの競合 |
| 413 | Payload Too Large - ファイルサイズ超過 |
| 422 | Unprocessable Entity - バリデーションエラー |
| 429 | Too Many Requests - レート制限 |
| 500 | Internal Server Error - サーバーエラー |

### エラー例

**400 Bad Request:**
```json
{
  "error": "BadRequest",
  "message": "リクエストが不正です",
  "details": {
    "field": "email",
    "issue": "メールアドレスの形式が正しくありません"
  }
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "認証が必要です"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden",
  "message": "このリソースへのアクセス権限がありません"
}
```

**404 Not Found:**
```json
{
  "error": "NotFound",
  "message": "写真が見つかりません"
}
```

**413 Payload Too Large:**
```json
{
  "error": "PayloadTooLarge",
  "message": "ファイルサイズが制限を超えています",
  "details": {
    "maxSize": "10MB",
    "receivedSize": "15MB"
  }
}
```

---

## レート制限

| エンドポイント | 制限 |
|--------------|------|
| `/api/photos/upload` | 10リクエスト/分 |
| `/api/ai/*` | 5リクエスト/分 |
| その他 | 100リクエスト/分 |

レート制限超過時のレスポンス:
```json
{
  "error": "TooManyRequests",
  "message": "レート制限を超えました",
  "retryAfter": 60
}
```

---

## ファイルサイズ制限

- **1枚あたり**: 最大 10MB
- **一括アップロード**: 最大 50MB（合計）
- **対応フォーマット**: JPEG, PNG, HEIC, WEBP

---

## Webhook（将来実装）

### AI処理完了通知

**POST `/api/webhooks/ai-completed`**

FastAPIからの通知を受け取る

**リクエストボディ:**
```json
{
  "jobId": "job-uuid",
  "photoIds": ["uuid1", "uuid2"],
  "results": [
    {
      "photoId": "uuid1",
      "tags": ["人物", "屋外"],
      "confidence": 0.95
    }
  ]
}
```

---

## 実装例（Next.js Route Handler）

### GET `/api/photos`

```typescript
// app/api/photos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  // 認証確認
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: '認証が必要です' },
      { status: 401 }
    );
  }

  // クエリパラメータ取得
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const sortBy = searchParams.get('sortBy') || 'uploadedAt';
  const order = searchParams.get('order') || 'desc';

  // ユーザーの家族IDを取得
  const { data: user } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', session.user.id)
    .single();

  if (!user?.family_id) {
    return NextResponse.json(
      { error: 'NotFound', message: '家族グループが見つかりません' },
      { status: 404 }
    );
  }

  // 写真一覧を取得
  const { data: photos, error, count } = await supabase
    .from('photos')
    .select('*', { count: 'exact' })
    .eq('family_id', user.family_id)
    .order(sortBy, { ascending: order === 'asc' })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return NextResponse.json(
      { error: 'InternalServerError', message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    photos,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      hasNext: page * limit < (count || 0),
      hasPrev: page > 1,
    },
  });
}
```

---

## 参考資料

- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [NextAuth.js API](https://next-auth.js.org/getting-started/rest-api)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
