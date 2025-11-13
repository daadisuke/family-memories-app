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

export interface FamilyInvitation {
  id: string;
  family_id: string;
  email: string;
  token: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  created_by: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * 招待を作成
 */
export async function createInvitation(
  familyId: string,
  email: string,
  createdBy: string
): Promise<{ invitation: FamilyInvitation | null; error: string | null }> {
  // 有効期限を7日後に設定
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data: invitation, error } = await supabase
    .from("family_invitations")
    .insert({
      family_id: familyId,
      email: email.toLowerCase(),
      created_by: createdBy,
      expires_at: expiresAt.toISOString(),
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating invitation:", error);
    return { invitation: null, error: "招待の作成に失敗しました" };
  }

  return { invitation, error: null };
}

/**
 * 家族グループの招待一覧を取得
 */
export async function getInvitationsByFamily(
  familyId: string
): Promise<FamilyInvitation[]> {
  const { data, error } = await supabase
    .from("family_invitations")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invitations:", error);
    return [];
  }

  return data || [];
}

/**
 * トークンで招待を取得
 */
export async function getInvitationByToken(
  token: string
): Promise<FamilyInvitation | null> {
  const { data, error } = await supabase
    .from("family_invitations")
    .select("*")
    .eq("token", token)
    .single();

  if (error) {
    console.error("Error fetching invitation by token:", error);
    return null;
  }

  return data;
}

/**
 * 招待を受諾（ユーザーを家族グループに追加）
 */
export async function acceptInvitation(
  token: string,
  userId: string
): Promise<{ success: boolean; error: string | null; familyId?: string }> {
  // トークンで招待を取得
  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    return { success: false, error: "招待が見つかりません" };
  }

  // ステータスチェック
  if (invitation.status !== "pending") {
    return { success: false, error: "この招待は既に使用されています" };
  }

  // 有効期限チェック
  const now = new Date();
  const expiresAt = new Date(invitation.expires_at);
  if (now > expiresAt) {
    // 期限切れの場合、ステータスを更新
    await supabase
      .from("family_invitations")
      .update({ status: "expired" })
      .eq("token", token);

    return { success: false, error: "この招待は有効期限切れです" };
  }

  // ユーザーの現在の情報を取得
  const { data: user } = await supabase
    .from("users")
    .select("email, family_id")
    .eq("id", userId)
    .single();

  if (!user) {
    return { success: false, error: "ユーザーが見つかりません" };
  }

  // メールアドレスが一致するかチェック
  if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return {
      success: false,
      error: "この招待は別のメールアドレス宛です",
    };
  }

  // 既に家族グループに所属している場合
  if (user.family_id) {
    return {
      success: false,
      error: "既に別の家族グループに所属しています",
    };
  }

  // トランザクション: ユーザーを家族に追加 & 招待を受諾済みに更新
  const { error: updateUserError } = await supabase
    .from("users")
    .update({
      family_id: invitation.family_id,
      role: "member",
    })
    .eq("id", userId);

  if (updateUserError) {
    console.error("Error updating user:", updateUserError);
    return { success: false, error: "家族グループへの参加に失敗しました" };
  }

  const { error: updateInvitationError } = await supabase
    .from("family_invitations")
    .update({ status: "accepted" })
    .eq("token", token);

  if (updateInvitationError) {
    console.error("Error updating invitation:", updateInvitationError);
    // ユーザーは追加されたが、招待ステータスの更新に失敗（継続）
  }

  return { success: true, error: null, familyId: invitation.family_id };
}

/**
 * 招待を削除（取り消し）
 */
export async function deleteInvitation(
  invitationId: string
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase
    .from("family_invitations")
    .delete()
    .eq("id", invitationId);

  if (error) {
    console.error("Error deleting invitation:", error);
    return { success: false, error: "招待の削除に失敗しました" };
  }

  return { success: true, error: null };
}

/**
 * 招待をキャンセル（ステータス更新）
 */
export async function cancelInvitation(
  invitationId: string
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase
    .from("family_invitations")
    .update({ status: "cancelled" })
    .eq("id", invitationId);

  if (error) {
    console.error("Error cancelling invitation:", error);
    return { success: false, error: "招待のキャンセルに失敗しました" };
  }

  return { success: true, error: null };
}
