import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const PHOTOS_BUCKET = "photos";

/**
 * Upload a photo to Supabase Storage
 */
export async function uploadPhoto(
  file: File,
  familyId: string,
  userId: string
): Promise<{ path: string | null; error: string | null }> {
  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${familyId}/${userId}/${fileName}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading photo:", uploadError);
      return { path: null, error: "写真のアップロードに失敗しました" };
    }

    return { path: filePath, error: null };
  } catch (error) {
    console.error("Error in uploadPhoto:", error);
    return { path: null, error: "写真のアップロードに失敗しました" };
  }
}

/**
 * Get public URL for a photo
 */
export function getPhotoUrl(storagePath: string): string {
  const { data } = supabase.storage
    .from(PHOTOS_BUCKET)
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

/**
 * Get signed URL for a photo (valid for 1 hour)
 */
export async function getSignedPhotoUrl(
  storagePath: string
): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (error) {
    console.error("Error creating signed URL:", error);
    return { url: null, error: "署名付きURLの生成に失敗しました" };
  }

  return { url: data.signedUrl, error: null };
}

/**
 * Delete a photo from storage
 */
export async function deletePhotoFromStorage(
  storagePath: string
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .remove([storagePath]);

  if (error) {
    console.error("Error deleting photo from storage:", error);
    return { success: false, error: "写真の削除に失敗しました" };
  }

  return { success: true, error: null };
}

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
