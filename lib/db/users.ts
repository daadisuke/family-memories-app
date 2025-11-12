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

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  family_id: string | null;
  role: string;
  email_verified: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = not found
    console.error("Error fetching user by email:", error);
    return null;
  }

  return data;
}

/**
 * Create a new user
 */
export async function createUser(userData: {
  email: string;
  name?: string;
  image?: string;
  emailVerified?: Date;
}): Promise<{ user: User | null; error: string | null }> {
  const { data, error } = await supabase
    .from("users")
    .insert({
      email: userData.email,
      name: userData.name || null,
      image: userData.image || null,
      email_verified: userData.emailVerified?.toISOString() || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating user:", error);
    return { user: null, error: "ユーザーの作成に失敗しました" };
  }

  return { user: data, error: null };
}

/**
 * Update user information
 */
export async function updateUser(
  userId: string,
  updates: {
    name?: string;
    image?: string;
    familyId?: string;
    role?: string;
  }
): Promise<{ success: boolean; error: string | null }> {
  const updateData: Record<string, any> = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.image !== undefined) updateData.image = updates.image;
  if (updates.familyId !== undefined) updateData.family_id = updates.familyId;
  if (updates.role !== undefined) updateData.role = updates.role;

  const { error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", userId);

  if (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "ユーザー情報の更新に失敗しました" };
  }

  return { success: true, error: null };
}

/**
 * Delete user
 */
export async function deleteUser(
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase.from("users").delete().eq("id", userId);

  if (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "ユーザーの削除に失敗しました" };
  }

  return { success: true, error: null };
}

/**
 * Get users by family ID
 */
export async function getUsersByFamilyId(familyId: string): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching users by family:", error);
    return [];
  }

  return data || [];
}
