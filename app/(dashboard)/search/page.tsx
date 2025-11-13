"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Photo {
  id: string;
  fileName: string;
  url: string;
  uploadedAt: string;
  takenAt: string | null;
  width: number | null;
  height: number | null;
  tags: string[];
  description: string | null;
}

interface SearchResponse {
  photos: Photo[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  searchCriteria: {
    tags: string[];
    dateFrom: string | null;
    dateTo: string | null;
    keyword: string | null;
  };
}

function SearchContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [tags, setTags] = useState(searchParams.get("tags") || "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "");

  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Auto-search if there are query parameters
    if (searchParams.toString()) {
      handleSearch();
    }
  }, [status, router]);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query string
      const params = new URLSearchParams();
      if (keyword.trim()) params.append("keyword", keyword.trim());
      if (tags.trim()) params.append("tags", tags.trim());
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const response = await fetch(`/api/photos/search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "検索に失敗しました");
      }

      setSearchResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setKeyword("");
    setTags("");
    setDateFrom("");
    setDateTo("");
    setSearchResults(null);
    setError(null);
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">写真を検索</h1>
          <p className="mt-2 text-sm text-gray-600">
            キーワード、タグ、日付範囲で写真を検索できます
          </p>
        </div>

        {/* Search Form */}
        <div className="rounded-lg bg-white shadow-md p-6 mb-8">
          <div className="space-y-4">
            {/* Keyword Search */}
            <div>
              <label
                htmlFor="keyword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                キーワード
              </label>
              <input
                type="text"
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="ファイル名や説明文で検索..."
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>

            {/* Tag Search */}
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                タグ（カンマ区切り）
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="例: family, vacation, beach"
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <p className="mt-1 text-xs text-gray-500">
                複数のタグを指定すると、すべてのタグを含む写真を検索します
              </p>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="dateFrom"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  撮影日（開始）
                </label>
                <input
                  type="date"
                  id="dateFrom"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="dateTo"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  撮影日（終了）
                </label>
                <input
                  type="date"
                  id="dateTo"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="flex-1 rounded-md bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "検索中..." : "検索"}
              </button>
              <button
                onClick={handleClearFilters}
                disabled={isLoading}
                className="rounded-md bg-gray-200 px-6 py-3 text-gray-700 font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                クリア
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Search Results */}
        {searchResults && (
          <div>
            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  検索結果: {searchResults.pagination.total}件
                </h2>
                {searchResults.searchCriteria.keyword && (
                  <p className="text-sm text-gray-600 mt-1">
                    キーワード: "{searchResults.searchCriteria.keyword}"
                  </p>
                )}
                {searchResults.searchCriteria.tags.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    タグ: {searchResults.searchCriteria.tags.join(", ")}
                  </p>
                )}
                {(searchResults.searchCriteria.dateFrom || searchResults.searchCriteria.dateTo) && (
                  <p className="text-sm text-gray-600 mt-1">
                    期間:{" "}
                    {searchResults.searchCriteria.dateFrom || "指定なし"} 〜{" "}
                    {searchResults.searchCriteria.dateTo || "指定なし"}
                  </p>
                )}
              </div>
            </div>

            {/* Results Grid */}
            {searchResults.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {searchResults.photos.map((photo) => (
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
                    {/* Tags Overlay */}
                    {photo.tags.length > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <div className="flex flex-wrap gap-1">
                          {photo.tags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-block rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white"
                            >
                              {tag}
                            </span>
                          ))}
                          {photo.tags.length > 2 && (
                            <span className="inline-block rounded-full bg-gray-500 px-2 py-0.5 text-xs text-white">
                              +{photo.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">検索条件に一致する写真が見つかりませんでした</p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  フィルターをクリアして再検索
                </button>
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!searchResults && !error && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 text-lg mb-2">検索条件を入力してください</p>
            <p className="text-gray-500 text-sm">
              キーワード、タグ、または日付範囲を指定して写真を検索できます
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
