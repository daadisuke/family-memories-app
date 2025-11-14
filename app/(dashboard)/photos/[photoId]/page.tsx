"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

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
          {/* Photo display */}
          <div className="lg:col-span-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100 shadow-lg">
              <Image
                src={photo.url}
                alt={photo.fileName}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            </div>
          </div>

          {/* Photo metadata */}
          <div className="space-y-6">
            {/* File info */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900">写真情報</h2>
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">ファイル名</dt>
                  <dd className="mt-1 text-sm text-gray-900 break-all">{photo.fileName}</dd>
                </div>

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
                    <dt className="text-sm font-medium text-gray-500">📐 サイズ</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {photo.width} × {photo.height} px
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
            {photo.tags && photo.tags.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-lg font-semibold text-gray-900">タグ</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {photo.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
          </div>
        </div>
      </div>
    </div>
  );
}
