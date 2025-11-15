"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { formatVideoDuration } from "@/lib/utils/video";

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
  mimeType: string | null;
  videoDuration: number | null;
  thumbnailPath: string | null;
}

interface Tag {
  tag: string;
  count: number;
}

export default function PhotosPage() {
  const { data: session } = useSession();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (session) {
      fetchPhotos();
      fetchTags();
    }
  }, [session, selectedTags]);

  const fetchPhotos = async () => {
    try {
      let url = "/api/photos?limit=50&sortBy=uploaded_at&order=desc";

      // Add tag filter if selected
      if (selectedTags.length > 0) {
        url = `/api/photos/search?tags=${selectedTags.join(",")}&limit=50&sortBy=uploaded_at&order=desc`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "写真の取得に失敗しました");
      }

      setPhotos(data.photos || []);
      setHasMore(data.hasMore || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      const data = await response.json();

      if (response.ok) {
        setTags(data.tags || []);
      }
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearTags = () => {
    setSelectedTags([]);
  };

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

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">エラー</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">写真ギャラリー</h1>
          <Link
            href="/upload"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            写真をアップロード
          </Link>
        </div>

        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">写真がありません</h3>
          <p className="mt-1 text-sm text-gray-500">
            最初の写真をアップロードしましょう
          </p>
          <div className="mt-6">
            <Link
              href="/upload"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              写真をアップロード
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">写真ギャラリー</h1>
          <p className="mt-2 text-sm text-gray-600">
            {photos.length}枚の写真
            {selectedTags.length > 0 && (
              <span className="ml-2 text-indigo-600">
                ({selectedTags.length}個のタグで絞り込み中)
              </span>
            )}
          </p>
        </div>
        <Link
          href="/upload"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          写真をアップロード
        </Link>
      </div>

      {/* Tag Filter */}
      {tags.length > 0 && (
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">🏷️ タグで絞り込み</h2>
            {selectedTags.length > 0 && (
              <button
                onClick={handleClearTags}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                クリア
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.tag}
                onClick={() => handleTagToggle(tag.tag)}
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedTags.includes(tag.tag)
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {tag.tag}
                <span className="ml-1.5 text-xs opacity-75">({tag.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {photos.map((photo) => {
          const isVideo = photo.mimeType?.startsWith("video/");

          return (
            <Link
              key={photo.id}
              href={`/photos/${photo.id}`}
              className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 block"
            >
              <Image
                src={photo.url}
                alt={photo.fileName}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />

              {/* Video Overlay */}
              {isVideo && (
                <>
                  {/* Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black bg-opacity-60 rounded-full p-3 transition-transform group-hover:scale-110">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Duration Badge */}
                  {photo.videoDuration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-none">
                      {formatVideoDuration(photo.videoDuration)}
                    </div>
                  )}

                  {/* Video Badge */}
                  <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded pointer-events-none font-medium">
                    VIDEO
                  </div>
                </>
              )}
            </Link>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={fetchPhotos}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            もっと読み込む
          </button>
        </div>
      )}
    </div>
  );
}
