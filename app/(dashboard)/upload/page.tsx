"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { isVideoFile, validatePhotoFile } from "@/lib/utils/file-validation";
import { extractVideoMetadata, formatVideoDuration } from "@/lib/utils/video";
import { supabaseClient } from "@/lib/supabase-client";

interface FileWithPreview extends File {
  preview?: string;
  isVideo?: boolean;
  videoDuration?: number;
}

export default function UploadPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [selectedFiles]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await processFiles(files);
      setError("");
    }
  };

  const processFiles = async (files: File[]) => {
    const filesWithPreview: FileWithPreview[] = await Promise.all(
      files.map(async (file) => {
        const fileWithPreview = file as FileWithPreview;
        fileWithPreview.preview = URL.createObjectURL(file);
        fileWithPreview.isVideo = isVideoFile(file);

        if (fileWithPreview.isVideo) {
          try {
            const metadata = await extractVideoMetadata(file);
            fileWithPreview.videoDuration = metadata.duration || undefined;
          } catch (error) {
            console.error("Failed to extract video metadata:", error);
          }
        }

        return fileWithPreview;
      })
    );

    setSelectedFiles((prev) => [...prev, ...filesWithPreview]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("ファイルを選択してください");
      return;
    }

    if (!session?.user?.id || !session?.user?.familyId) {
      setError("ログインが必要です");
      return;
    }

    setUploading(true);
    setError("");
    setProgress(0);

    try {
      let completed = 0;

      for (const file of selectedFiles) {
        // Validate file
        const validation = validatePhotoFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Generate unique filename and storage path
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const storagePath = `${session.user.familyId}/${session.user.id}/${fileName}`;

        // Upload directly to Supabase Storage from client
        const { error: uploadError } = await supabaseClient.storage
          .from("photos")
          .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error("ファイルのアップロードに失敗しました");
        }

        // Extract video metadata if it's a video
        let metadata: any = {};
        if (file.isVideo) {
          try {
            const videoMeta = await extractVideoMetadata(file);
            metadata = {
              videoDuration: videoMeta.duration || undefined,
              width: videoMeta.width || undefined,
              height: videoMeta.height || undefined,
            };
          } catch (error) {
            console.error("Failed to extract video metadata:", error);
          }
        }

        // Create database record
        const response = await fetch("/api/photos/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storagePath,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            ...metadata,
          }),
        });

        if (!response.ok) {
          // If DB creation fails, try to delete the uploaded file
          await supabaseClient.storage.from("photos").remove([storagePath]);
          const data = await response.json();
          throw new Error(data.message || "情報の保存に失敗しました");
        }

        completed++;
        setProgress(Math.round((completed / selectedFiles.length) * 100));
      }

      setSuccess(true);
      setSelectedFiles([]);
      setTimeout(() => {
        router.push("/photos");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      await processFiles(files);
      setError("");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">写真・動画をアップロード</h1>
        <p className="mt-2 text-sm text-gray-600">
          画像（JPEG、PNG、WebP、HEIC、最大50MB）または動画（MP4、MOV、AVI、WebM、最大500MB）をアップロードできます
        </p>
      </div>

      {success && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                アップロード完了
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>写真ギャラリーにリダイレクトしています...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">エラー</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="mb-6 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="space-y-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
            >
              <span>ファイルを選択</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                multiple
                accept="image/*,video/mp4,video/quicktime,video/x-msvideo,video/webm"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </label>
            <p className="pl-1">または、ここにドラッグ&ドロップ</p>
          </div>
          <p className="text-xs text-gray-500">
            画像: JPEG, PNG, WebP, HEIC（最大50MB）<br />
            動画: MP4, MOV, AVI, WebM（最大500MB）
          </p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-medium text-gray-900">
            選択されたファイル ({selectedFiles.length}件)
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                {/* Preview */}
                <div className="mb-3 aspect-video w-full overflow-hidden rounded-md bg-gray-100">
                  {file.isVideo ? (
                    <div className="relative h-full w-full">
                      <video
                        src={file.preview}
                        className="h-full w-full object-cover"
                        muted
                      />
                      {/* Play icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black bg-opacity-60 rounded-full p-3">
                          <svg
                            className="w-8 h-8 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      {/* Duration badge */}
                      {file.videoDuration && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          {formatVideoDuration(file.videoDuration)}
                        </div>
                      )}
                      {/* Video badge */}
                      <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded font-medium">
                        VIDEO
                      </div>
                    </div>
                  ) : (
                    <img
                      src={file.preview || ""}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                {/* File info */}
                <div className="space-y-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{file.isVideo ? "動画" : "画像"}</span>
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  {file.isVideo && file.videoDuration && (
                    <p className="text-xs text-gray-500">
                      長さ: {formatVideoDuration(file.videoDuration)}
                    </p>
                  )}
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  disabled={uploading}
                  className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700 disabled:opacity-50"
                  title="削除"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploading && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>アップロード中...</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={uploading}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || selectedFiles.length === 0}
          className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "アップロード中..." : "アップロード"}
        </button>
      </div>
    </div>
  );
}
