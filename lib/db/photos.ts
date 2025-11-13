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

export interface Photo {
  id: string;
  user_id: string;
  family_id: string;
  storage_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  uploaded_at: string;
  taken_at: string | null;
  location: any | null;
  tags: string[];
  ai_processed: boolean;
  ai_processed_at: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePhotoData {
  userId: string;
  familyId: string;
  storagePath: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  takenAt?: string | Date; // ISO 8601 string or Date object
  location?: any;
  description?: string;
}

/**
 * Create a new photo record
 */
export async function createPhoto(
  data: CreatePhotoData
): Promise<{ photo: Photo | null; error: string | null }> {
  const { data: photo, error } = await supabase
    .from("photos")
    .insert({
      user_id: data.userId,
      family_id: data.familyId,
      storage_path: data.storagePath,
      file_name: data.fileName,
      file_size: data.fileSize || null,
      mime_type: data.mimeType || null,
      width: data.width || null,
      height: data.height || null,
      taken_at: data.takenAt
        ? typeof data.takenAt === "string"
          ? data.takenAt
          : data.takenAt.toISOString()
        : null,
      location: data.location || null,
      description: data.description || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating photo:", error);
    return { photo: null, error: "写真情報の保存に失敗しました" };
  }

  return { photo, error: null };
}

/**
 * Get photo by ID with family verification
 */
export async function getPhotoById(photoId: string, familyId: string): Promise<Photo | null> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("id", photoId)
    .eq("family_id", familyId)
    .single();

  if (error) {
    console.error("Error fetching photo:", error);
    return null;
  }

  return data;
}

/**
 * Get adjacent photo IDs for navigation (previous and next)
 */
export async function getAdjacentPhotoIds(
  photoId: string,
  familyId: string
): Promise<{ previousId: string | null; nextId: string | null }> {
  // Get the current photo's upload timestamp
  const currentPhoto = await getPhotoById(photoId, familyId);
  if (!currentPhoto) {
    return { previousId: null, nextId: null };
  }

  // Get previous photo (older, uploaded before current)
  const { data: previousPhotos } = await supabase
    .from("photos")
    .select("id")
    .eq("family_id", familyId)
    .lt("uploaded_at", currentPhoto.uploaded_at)
    .order("uploaded_at", { ascending: false })
    .limit(1);

  // Get next photo (newer, uploaded after current)
  const { data: nextPhotos } = await supabase
    .from("photos")
    .select("id")
    .eq("family_id", familyId)
    .gt("uploaded_at", currentPhoto.uploaded_at)
    .order("uploaded_at", { ascending: true })
    .limit(1);

  return {
    previousId: previousPhotos && previousPhotos.length > 0 ? previousPhotos[0].id : null,
    nextId: nextPhotos && nextPhotos.length > 0 ? nextPhotos[0].id : null,
  };
}

/**
 * Get photos by family ID with pagination
 */
export async function getPhotosByFamilyId(
  familyId: string,
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: "uploaded_at" | "taken_at" | "created_at";
    order?: "asc" | "desc";
  }
): Promise<Photo[]> {
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;
  const sortBy = options?.sortBy || "uploaded_at";
  const order = options?.order || "desc";

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("family_id", familyId)
    .order(sortBy, { ascending: order === "asc" })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching photos:", error);
    return [];
  }

  return data || [];
}

/**
 * Get photos by user ID
 */
export async function getPhotosByUserId(userId: string): Promise<Photo[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("user_id", userId)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Error fetching user photos:", error);
    return [];
  }

  return data || [];
}

/**
 * Update photo metadata
 */
export async function updatePhoto(
  photoId: string,
  updates: {
    description?: string;
    tags?: string[];
    takenAt?: Date;
    location?: any;
    aiProcessed?: boolean;
  }
): Promise<{ success: boolean; error: string | null }> {
  const updateData: Record<string, any> = { updated_at: new Date().toISOString() };

  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.takenAt !== undefined) updateData.taken_at = updates.takenAt.toISOString();
  if (updates.location !== undefined) updateData.location = updates.location;
  if (updates.aiProcessed !== undefined) {
    updateData.ai_processed = updates.aiProcessed;
    if (updates.aiProcessed) {
      updateData.ai_processed_at = new Date().toISOString();
    }
  }

  const { error } = await supabase
    .from("photos")
    .update(updateData)
    .eq("id", photoId);

  if (error) {
    console.error("Error updating photo:", error);
    return { success: false, error: "写真情報の更新に失敗しました" };
  }

  return { success: true, error: null };
}

/**
 * Delete photo
 */
export async function deletePhoto(
  photoId: string
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase.from("photos").delete().eq("id", photoId);

  if (error) {
    console.error("Error deleting photo:", error);
    return { success: false, error: "写真の削除に失敗しました" };
  }

  return { success: true, error: null };
}

/**
 * Search photos by tags
 */
export async function searchPhotosByTags(
  familyId: string,
  tags: string[]
): Promise<Photo[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("family_id", familyId)
    .contains("tags", tags)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Error searching photos by tags:", error);
    return [];
  }

  return data || [];
}

/**
 * Search photos with multiple criteria
 */
export interface SearchCriteria {
  familyId: string;
  tags?: string[];
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
  keyword?: string; // Search in description and filename
  limit?: number;
  offset?: number;
  sortBy?: "uploaded_at" | "taken_at" | "created_at";
  order?: "asc" | "desc";
}

export async function searchPhotos(criteria: SearchCriteria): Promise<Photo[]> {
  const {
    familyId,
    tags,
    dateFrom,
    dateTo,
    keyword,
    limit = 50,
    offset = 0,
    sortBy = "uploaded_at",
    order = "desc",
  } = criteria;

  let query = supabase.from("photos").select("*").eq("family_id", familyId);

  // Tag search - contains any of the tags
  if (tags && tags.length > 0) {
    query = query.contains("tags", tags);
  }

  // Date range search (taken_at)
  if (dateFrom) {
    query = query.gte("taken_at", dateFrom);
  }
  if (dateTo) {
    query = query.lte("taken_at", dateTo);
  }

  // Keyword search in description and filename
  if (keyword && keyword.trim()) {
    // Use OR condition for searching in multiple fields
    // Note: Supabase/PostgreSQL doesn't directly support OR in client query builder
    // We'll use textSearch on description and filter filename in application code
    query = query.or(`description.ilike.%${keyword}%,file_name.ilike.%${keyword}%`);
  }

  // Apply sorting and pagination
  query = query.order(sortBy, { ascending: order === "asc" }).range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error("Error searching photos:", error);
    return [];
  }

  return data || [];
}

/**
 * Get photo count by search criteria
 */
export async function getPhotoCountBySearch(criteria: Omit<SearchCriteria, "limit" | "offset" | "sortBy" | "order">): Promise<number> {
  const { familyId, tags, dateFrom, dateTo, keyword } = criteria;

  let query = supabase
    .from("photos")
    .select("id", { count: "exact", head: true })
    .eq("family_id", familyId);

  if (tags && tags.length > 0) {
    query = query.contains("tags", tags);
  }

  if (dateFrom) {
    query = query.gte("taken_at", dateFrom);
  }

  if (dateTo) {
    query = query.lte("taken_at", dateTo);
  }

  if (keyword && keyword.trim()) {
    query = query.or(`description.ilike.%${keyword}%,file_name.ilike.%${keyword}%`);
  }

  const { count, error } = await query;

  if (error) {
    console.error("Error counting photos:", error);
    return 0;
  }

  return count || 0;
}
