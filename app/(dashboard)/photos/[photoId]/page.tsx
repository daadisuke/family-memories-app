"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { formatVideoDuration } from "@/lib/utils/video";

// Dynamically import map component with SSR disabled
const PhotoLocationMap = dynamic(
  () => import("@/components/maps/PhotoLocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-gray-500">地図を読み込んでいます...</p>
      </div>
    ),
  }
);

// Dynamically import video player with SSR disabled
const VideoPlayer = dynamic(() => import("@/components/video/VideoPlayer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">動画を読み込んでいます...</p>
    </div>
  ),
});

interface Photo {
  id: string;
  fileName: string;
  url: string;
  uploadedAt: string;
  takenAt: string | null;
  width: number | null;
  height: number | null;
  tags: string[] | null;
  description: string | null;
  location: { latitude: number; longitude: number } | null;
  mimeType: string | null;
  videoDuration: number | null;
  thumbnailPath: string | null;
  aiProcessed: boolean;
  aiProcessedAt: string | null;
}

interface PhotoDetailResponse {
  photo?: Photo;
  previousPhotoId?: string | null;
  nextPhotoId?: string | null;
  error?: string;
  message?: string;
}

export default function PhotoDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const photoId = params.photoId as string;

  const [photo, setPhoto] = useState<Photo | null>(null);
  const [previousPhotoId, setPreviousPhotoId] = useState<string | null>(null);
  const [nextPhotoId, setNextPhotoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (session && photoId) {
      fetchPhotoDetail();
    }
  }, [session, photoId]);

  const fetchPhotoDetail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/photos/${photoId}`);
      const data: PhotoDetailResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "写真の取得に失敗しました");
      }

      if (data.photo) {
        setPhoto(data.photo);
        setPreviousPhotoId(data.previousPhotoId || null);
        setNextPhotoId(data.nextPhotoId || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" && previousPhotoId) {
      router.push(`/photos/${previousPhotoId}`);
    } else if (e.key === "ArrowRight" && nextPhotoId) {
      router.push(`/photos/${nextPhotoId}`);
    } else if (e.key === "Escape") {
      router.push("/photos");
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim() || !photo) return;

    setIsAddingTag(true);
    try {
      const response = await fetch(`/api/photos/${photoId}/tags`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tags: [newTag.trim()],
          action: "add",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPhoto({ ...photo, tags: data.photo.tags });
        setNewTag("");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "タグの追加に失敗しました");
      }
    } catch (error) {
      console.error("Error adding tag:", error);
      alert("タグの追加中にエラーが発生しました");
    } finally {
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!photo) return;

    try {
      const response = await fetch(`/api/photos/${photoId}/tags`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tags: [tagToRemove],
          action: "remove",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPhoto({ ...photo, tags: data.photo.tags });
      } else {
        const errorData = await response.json();
        alert(errorData.message || "タグの削除に失敗しました");
      }
    } catch (error) {
      console.error("Error removing tag:", error);
      alert("タグの削除中にエラーが発生しました");
    }
  };

  const handleTagClick = (tag: string) => {
    router.push(`/search?tags=${encodeURIComponent(tag)}`);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleDeletePhoto = async () => {
    if (!photo) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Redirect to gallery after successful deletion
        router.push("/photos");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "写真の削除に失敗しました");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("写真の削除中にエラーが発生しました");
      setIsDeleting(false);
    }
  };

  // All family members can delete photos
  const canDelete = photo && session?.user?.familyId;

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previousPhotoId, nextPhotoId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">エラー</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error || "写真が見つかりませんでした"}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Link
            href="/photos"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            ← ギャラリーに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/photos"
              className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              ギャラリーに戻る
            </Link>

            {/* Navigation arrows */}
            <div className="flex items-center gap-2">
              {previousPhotoId ? (
                <Link
                  href={`/photos/${previousPhotoId}`}
                  className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </Link>
              ) : (
                <div className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </div>
              )}

              {nextPhotoId ? (
                <Link
                  href={`/photos/${nextPhotoId}`}
                  className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ) : (
                <div className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Photo/Video display */}
          <div className="lg:col-span-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100 shadow-lg">
              {photo.mimeType?.startsWith("video/") ? (
                <VideoPlayer url={photo.url} className="w-full h-full" />
              ) : (
                <Image
                  src={photo.url}
                  alt={photo.fileName}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              )}
            </div>
          </div>

          {/* Photo metadata */}
          <div className="space-y-6">
            {/* File info */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900">
                {photo.mimeType?.startsWith("video/") ? "動画情報" : "写真情報"}
              </h2>
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">ファイル名</dt>
                  <dd className="mt-1 text-sm text-gray-900 break-all">{photo.fileName}</dd>
                </div>

                {/* Video duration */}
                {photo.mimeType?.startsWith("video/") && photo.videoDuration && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">⏱️ 再生時間</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatVideoDuration(photo.videoDuration)}
                    </dd>
                  </div>
                )}

                {/* 撮影日時（EXIF情報から取得） */}
                {photo.takenAt && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      📷 撮影日時
                      <span className="ml-1 text-xs text-gray-400">(EXIF)</span>
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(photo.takenAt).toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </dd>
                  </div>
                )}

                {/* アップロード日時 */}
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    ⬆️ アップロード日時
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(photo.uploadedAt).toLocaleString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </dd>
                </div>

                {photo.width && photo.height && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">📐 解像度</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {photo.width} × {photo.height} px
                    </dd>
                  </div>
                )}

                {/* Media Type */}
                {photo.mimeType && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">📁 形式</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {photo.mimeType.startsWith("video/") ? "動画" : "画像"} ({photo.mimeType})
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Description */}
            {photo.description && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-lg font-semibold text-gray-900">説明</h2>
                <p className="mt-2 text-sm text-gray-700">{photo.description}</p>
              </div>
            )}

            {/* Tags */}
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">🏷️ タグ</h2>
                {/* AI Status Badge */}
                {photo.aiProcessed ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    AI処理済み
                  </span>
                ) : !photo.mimeType?.startsWith("video/") ? (
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                    <svg className="mr-1 h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    AI処理中...
                  </span>
                ) : null}
              </div>

              {/* Existing Tags */}
              {photo.tags && photo.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {photo.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800 cursor-pointer hover:bg-indigo-200 transition-colors group"
                    >
                      <button
                        onClick={() => handleTagClick(tag)}
                        className="mr-1"
                      >
                        {tag}
                      </button>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="タグを削除"
                      >
                        <svg
                          className="h-3 w-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add Tag Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="タグを追加（Enterで追加）"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  disabled={isAddingTag}
                />
                <button
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || isAddingTag}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isAddingTag ? "追加中..." : "追加"}
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                タグをクリックすると、そのタグで検索できます
              </p>
            </div>

            {/* Location Map */}
            {photo.location && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  📍 撮影場所
                  <span className="ml-2 text-xs font-normal text-gray-400">(EXIF)</span>
                </h2>
                <PhotoLocationMap
                  latitude={photo.location.latitude}
                  longitude={photo.location.longitude}
                  photoName={photo.fileName}
                  height="300px"
                />
                <p className="mt-3 text-xs text-gray-500 text-center">
                  {photo.location.latitude.toFixed(6)}, {photo.location.longitude.toFixed(6)}
                </p>
              </div>
            )}

            {/* Keyboard shortcuts hint */}
            <div className="rounded-lg bg-gray-100 p-4">
              <h3 className="text-sm font-medium text-gray-700">キーボードショートカット</h3>
              <dl className="mt-2 space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <dt>← →</dt>
                  <dd>前後の写真</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Esc</dt>
                  <dd>ギャラリーに戻る</dd>
                </div>
              </dl>
            </div>

            {/* Delete button (only for uploader) */}
            {canDelete && (
              <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
                <h3 className="text-sm font-medium text-red-900 mb-2">写真の削除</h3>
                <p className="text-xs text-red-700 mb-3">
                  削除すると元に戻せません
                </p>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    🗑️ 削除
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-red-900">本当に削除しますか？</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeletePhoto}
                        disabled={isDeleting}
                        className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-red-300 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? "削除中..." : "はい、削除します"}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                        className="flex-1 rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
