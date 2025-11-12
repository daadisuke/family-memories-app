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
 * Validate file type
 */
export function validatePhotoFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "サポートされていないファイル形式です。JPEG、PNG、WebP、HEICのみアップロード可能です。",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "ファイルサイズが大きすぎます。最大50MBまでアップロード可能です。",
    };
  }

  return { valid: true };
}
