import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { acceptInvitation } from "@/lib/db/invitations";

/**
 * POST /api/families/invitations/[token]/accept
 * 招待を受諾
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "認証が必要です" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: "BadRequest", message: "招待トークンが必要です" },
        { status: 400 }
      );
    }

    const { success, error, familyId } = await acceptInvitation(
      token,
      session.user.id
    );

    if (!success) {
      return NextResponse.json(
        { error: "BadRequest", message: error || "招待の受諾に失敗しました" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "家族グループに参加しました",
      familyId,
    });
  } catch (error) {
    console.error("Error in POST /api/families/invitations/[token]/accept:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
