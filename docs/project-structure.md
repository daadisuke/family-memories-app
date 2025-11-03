# プロジェクト構造

## 概要

このドキュメントは、家族思い出アプリのディレクトリ構造とファイル配置について説明します。
Next.js App Routerを使用した構造になっています。

## ディレクトリ構造

```
family-memories-app/
├── .github/                    # GitHub関連設定
│   └── workflows/              # GitHub Actions
│       ├── ci.yml              # CI/CDパイプライン
│       └── db-migration.yml    # DBマイグレーション
│
├── app/                        # Next.js App Router
│   ├── (auth)/                 # 認証関連ページグループ
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/            # ダッシュボードグループ（認証必須）
│   │   ├── layout.tsx          # 共通レイアウト
│   │   ├── page.tsx            # ホーム（/）
│   │   ├── photos/
│   │   │   ├── page.tsx        # 写真一覧
│   │   │   ├── [photoId]/
│   │   │   │   └── page.tsx    # 写真詳細
│   │   │   └── upload/
│   │   │       └── page.tsx    # 写真アップロード
│   │   ├── albums/
│   │   │   ├── page.tsx        # アルバム一覧
│   │   │   └── [albumId]/
│   │   │       └── page.tsx    # アルバム詳細
│   │   ├── family/
│   │   │   └── page.tsx        # 家族管理
│   │   └── settings/
│   │       └── page.tsx        # 設定
│   │
│   ├── api/                    # API Routes
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts    # NextAuth設定
│   │   │   └── signup/
│   │   │       └── route.ts
│   │   ├── photos/
│   │   │   ├── route.ts        # GET, POST
│   │   │   ├── [photoId]/
│   │   │   │   └── route.ts    # GET, PATCH, DELETE
│   │   │   └── upload/
│   │   │       └── route.ts    # POST (multipart)
│   │   ├── families/
│   │   │   ├── route.ts
│   │   │   └── [familyId]/
│   │   │       └── route.ts
│   │   ├── tags/
│   │   │   ├── route.ts
│   │   │   └── suggestions/
│   │   │       └── route.ts
│   │   └── ai/
│   │       ├── tag-photos/
│   │       │   └── route.ts
│   │       └── jobs/
│   │           └── [jobId]/
│   │               └── route.ts
│   │
│   ├── layout.tsx              # ルートレイアウト
│   ├── globals.css             # グローバルスタイル
│   └── error.tsx               # エラーページ
│
├── components/                 # Reactコンポーネント
│   ├── layout/                 # レイアウトコンポーネント
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   │
│   ├── photos/                 # 写真関連コンポーネント
│   │   ├── PhotoGallery.tsx
│   │   ├── PhotoCard.tsx
│   │   ├── PhotoUploader.tsx
│   │   ├── PhotoViewer.tsx
│   │   └── PhotoFilters.tsx
│   │
│   ├── albums/                 # アルバム関連コンポーネント
│   │   ├── AlbumList.tsx
│   │   ├── AlbumCard.tsx
│   │   └── AlbumCreator.tsx
│   │
│   ├── family/                 # 家族関連コンポーネント
│   │   ├── FamilyMemberList.tsx
│   │   ├── InviteForm.tsx
│   │   └── MemberCard.tsx
│   │
│   └── common/                 # 共通コンポーネント
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── Pagination.tsx
│       └── SearchBar.tsx
│
├── lib/                        # ユーティリティ・ヘルパー
│   ├── auth.ts                 # NextAuth設定
│   ├── supabase.ts             # Supabaseクライアント
│   ├── db/                     # データベース操作
│   │   ├── photos.ts
│   │   ├── users.ts
│   │   └── families.ts
│   ├── storage/                # Supabase Storage操作
│   │   └── photos.ts
│   ├── utils/                  # ユーティリティ関数
│   │   ├── date.ts
│   │   ├── file.ts
│   │   └── image.ts
│   └── validations/            # バリデーションスキーマ
│       ├── photo.ts
│       └── user.ts
│
├── hooks/                      # カスタムフック
│   ├── useAuth.ts
│   ├── usePhotos.ts
│   ├── useUpload.ts
│   └── useInfiniteScroll.ts
│
├── types/                      # TypeScript型定義
│   ├── index.ts
│   ├── database.ts             # Supabaseテーブル型
│   ├── api.ts                  # APIレスポンス型
│   └── next-auth.d.ts          # NextAuth型拡張
│
├── docs/                       # ドキュメント
│   ├── requirement.md          # 要件定義書
│   ├── setup.md                # セットアップガイド
│   ├── database-schema.md      # データベーススキーマ
│   ├── api-spec.md             # API仕様書
│   ├── mcp-guide.md            # MCP活用ガイド
│   ├── project-structure.md    # プロジェクト構造（本ドキュメント）
│   ├── workflow.md             # 開発ワークフロー
│   └── sql/                    # SQLファイル
│       ├── schema.sql          # スキーマ定義
│       ├── seed.sql            # 初期データ
│       └── migrations/         # マイグレーション
│
├── public/                     # 静的ファイル
│   ├── images/
│   │   └── logo.png
│   └── icons/
│       └── favicon.ico
│
├── tests/                      # テスト
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.local                  # 環境変数（ローカル）
├── .env.example                # 環境変数サンプル
├── .gitignore
├── next.config.js              # Next.js設定
├── tailwind.config.ts          # Tailwind CSS設定
├── tsconfig.json               # TypeScript設定
├── package.json
└── README.md
```

---

## 主要ディレクトリの詳細

### `/app` - Next.js App Router

Next.js 13+のApp Routerを使用。ファイルベースルーティング。

**特徴:**
- `(auth)`, `(dashboard)` などのRoute Groupsでページを整理
- `layout.tsx` で共通レイアウトを定義
- Server ComponentsとClient Componentsを使い分け

**命名規則:**
- ページ: `page.tsx`
- レイアウト: `layout.tsx`
- ローディング: `loading.tsx`
- エラー: `error.tsx`
- 動的ルート: `[param]/`

---

### `/components` - Reactコンポーネント

再利用可能なUIコンポーネントを配置。

**ディレクトリ分類:**

#### `layout/` - レイアウトコンポーネント
- Header, Sidebar, Footer などの全体レイアウト
- 各ページで共有するナビゲーション

#### `photos/`, `albums/`, `family/` - 機能別コンポーネント
- 各機能に特化したコンポーネント
- ドメインロジックを含む

#### `common/` - 共通コンポーネント
- 機能に依存しない汎用コンポーネント
- LoadingSpinner, ErrorBoundary など

**命名規則:**
- PascalCase（例: `PhotoGallery.tsx`）
- Client Componentには `'use client'` ディレクティブを追加

---

### `/lib` - ユーティリティ・ヘルパー

ビジネスロジック、データベース操作、ユーティリティ関数を配置。

**主要ファイル:**

#### `auth.ts`
NextAuth.js の設定と認証ロジック

```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  // 認証設定
};
```

#### `supabase.ts`
Supabaseクライアントの初期化

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

#### `db/` ディレクトリ
各テーブルの操作関数

```typescript
// lib/db/photos.ts
export async function getPhotos(familyId: string) {
  // 写真取得ロジック
}

export async function createPhoto(data: PhotoData) {
  // 写真作成ロジック
}
```

---

### `/hooks` - カスタムフック

React Hooksを使用した状態管理・副作用処理。

**例:**

```typescript
// hooks/usePhotos.ts
import { useState, useEffect } from 'react';

export function usePhotos(familyId: string) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 写真取得ロジック
  }, [familyId]);

  return { photos, loading };
}
```

**命名規則:**
- `use` プレフィックスを付ける（例: `useAuth`, `usePhotos`）

---

### `/types` - TypeScript型定義

プロジェクト全体で使用する型定義。

**主要ファイル:**

#### `database.ts`
Supabaseテーブルの型定義

```typescript
// types/database.ts
export interface Photo {
  id: string;
  user_id: string;
  family_id: string;
  storage_path: string;
  // ...
}

export interface Family {
  id: string;
  name: string;
  // ...
}
```

#### `api.ts`
APIレスポンスの型定義

```typescript
// types/api.ts
export interface PhotosResponse {
  photos: Photo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

---

### `/docs` - ドキュメント

プロジェクトの設計・仕様ドキュメント。

**ファイル一覧:**
- `requirement.md`: 要件定義書
- `setup.md`: セットアップガイド
- `database-schema.md`: データベーススキーマ
- `api-spec.md`: API仕様書
- `mcp-guide.md`: MCP活用ガイド
- `project-structure.md`: プロジェクト構造（本ドキュメント）
- `workflow.md`: 開発ワークフロー

---

## ファイル命名規則

### コンポーネントファイル
- **形式**: PascalCase
- **例**: `PhotoGallery.tsx`, `AlbumCard.tsx`

### ユーティリティファイル
- **形式**: camelCase
- **例**: `auth.ts`, `supabase.ts`

### 型定義ファイル
- **形式**: camelCase.ts
- **例**: `database.ts`, `api.ts`

### APIルート
- **形式**: kebab-case（URLに合わせる）
- **例**: `route.ts` (ディレクトリ名でパスを表現)

---

## インポートパス

### エイリアス設定（tsconfig.json）

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/types/*": ["./types/*"]
    }
  }
}
```

### 使用例

```typescript
// 絶対パスでインポート
import { Button } from '@/components/common/Button';
import { getPhotos } from '@/lib/db/photos';
import { useAuth } from '@/hooks/useAuth';
import { Photo } from '@/types/database';
```

---

## コンポーネント配置ガイドライン

### Server Component vs Client Component

#### Server Component（デフォルト）
- データ取得を含むコンポーネント
- SEOが重要なページ
- インタラクションが少ないコンポーネント

**配置場所:** `app/` 配下のページコンポーネント

#### Client Component（'use client'）
- イベントハンドラーを使用
- useState, useEffectなどのフックを使用
- ブラウザAPIを使用

**配置場所:** `components/` 配下の対話型コンポーネント

---

## 環境変数管理

### `.env.local`（Git非追跡）

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret

# Claude API
ANTHROPIC_API_KEY=your_key
```

### `.env.example`（Git追跡）

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Claude API
ANTHROPIC_API_KEY=
```

---

## ベストプラクティス

### 1. ファイル配置
- 機能ごとにディレクトリを分ける
- 関連するファイルは近くに配置
- 再利用可能なコンポーネントは `components/` に

### 2. インポート順序
```typescript
// 1. 外部ライブラリ
import React from 'react';
import { useSession } from 'next-auth/react';

// 2. 内部コンポーネント
import { PhotoCard } from '@/components/photos/PhotoCard';
import { Button } from '@/components/common/Button';

// 3. ユーティリティ・型
import { getPhotos } from '@/lib/db/photos';
import { Photo } from '@/types/database';

// 4. スタイル
import styles from './styles.module.css';
```

### 3. コンポーネントサイズ
- 1ファイル200行以下を目安
- 複雑になったら分割
- 責任を明確に

### 4. 型定義
- すべての関数・コンポーネントに型を付ける
- `any` は使わない
- インターフェースを活用

---

## 参考リンク

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js Project Structure](https://nextjs.org/docs/getting-started/project-structure)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
