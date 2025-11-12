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

export interface Family {
  id: string;
  name: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  created_at: string;
}

/**
 * Get family by ID
 */
export async function getFamilyById(familyId: string): Promise<Family | null> {
  const { data, error } = await supabase
    .from("families")
    .select("*")
    .eq("id", familyId)
    .single();

  if (error) {
    console.error("Error fetching family:", error);
    return null;
  }

  return data;
}

/**
 * Get family members
 */
export async function getFamilyMembers(
  familyId: string
): Promise<FamilyMember[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, image, role, created_at")
    .eq("family_id", familyId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching family members:", error);
    return [];
  }

  return data || [];
}

/**
 * Create a new family
 * Note: created_by parameter kept for future use when column is added to database
 */
export async function createFamily(
  name: string,
  createdBy: string
): Promise<{ family: Family | null; error: string | null }> {
  const { data: family, error: familyError } = await supabase
    .from("families")
    .insert({
      name,
      // TODO: Uncomment when created_by column is added via migration
      // created_by: createdBy,
    })
    .select()
    .single();

  if (familyError) {
    console.error("Error creating family:", familyError);
    return { family: null, error: familyError.message || "家族グループの作成に失敗しました" };
  }

  return { family, error: null };
}

/**
 * Update user's family ID
 */
export async function updateUserFamily(
  userId: string,
  familyId: string,
  role: string = "member"
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase
    .from("users")
    .update({ family_id: familyId, role })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user family:", error);
    return { success: false, error: "ユーザー情報の更新に失敗しました" };
  }

  return { success: true, error: null };
}

/**
 * Delete family (admin only)
 */
export async function deleteFamily(
  familyId: string
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase.from("families").delete().eq("id", familyId);

  if (error) {
    console.error("Error deleting family:", error);
    return { success: false, error: "家族グループの削除に失敗しました" };
  }

  return { success: true, error: null };
}
