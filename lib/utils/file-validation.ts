/**
 * File validation utilities (client-side safe)
 */

/**
 * Validate file type (supports both images and videos)
 */
export function validatePhotoFile(file: File): { valid: boolean; error?: string } {
  const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];
  const allowedVideoTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];
  const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

  const maxImageSize = 50 * 1024 * 1024; // 50MB for images
  const maxVideoSize = 500 * 1024 * 1024; // 500MB for videos

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "サポートされていないファイル形式です。画像（JPEG、PNG、WebP、HEIC）または動画（MP4、MOV、AVI、WebM）のみアップロード可能です。",
    };
  }

  const isVideo = allowedVideoTypes.includes(file.type);
  const maxSize = isVideo ? maxVideoSize : maxImageSize;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: isVideo
        ? "動画ファイルサイズが大きすぎます。最大500MBまでアップロード可能です。"
        : "画像ファイルサイズが大きすぎます。最大50MBまでアップロード可能です。",
    };
  }

  return { valid: true };
}

/**
 * Check if file is a video
 */
export function isVideoFile(file: File): boolean {
  const videoTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];
  return videoTypes.includes(file.type);
}
