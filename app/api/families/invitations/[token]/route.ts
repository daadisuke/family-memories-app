import { NextResponse } from "next/server";
import { getInvitationByToken } from "@/lib/db/invitations";
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

/**
 * GET /api/families/invitations/[token]
 * 招待情報を取得（トークンで）
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const params = await context.params;
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: "BadRequest", message: "招待トークンが必要です" },
        { status: 400 }
      );
    }

    const invitation = await getInvitationByToken(token);

    if (!invitation) {
      return NextResponse.json(
        { error: "NotFound", message: "招待が見つかりません" },
        { status: 404 }
      );
    }

    // 有効期限チェック
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    const isExpired = now > expiresAt;

    // 家族グループ名を取得
    const { data: family } = await supabase
      .from("families")
      .select("name")
      .eq("id", invitation.family_id)
      .single();

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        status: invitation.status,
        expiresAt: invitation.expires_at,
        isExpired,
        familyName: family?.name || "不明な家族グループ",
      },
    });
  } catch (error) {
    console.error("Error in GET /api/families/invitations/[token]:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
