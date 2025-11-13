import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createInvitation,
  getInvitationsByFamily,
  deleteInvitation,
} from "@/lib/db/invitations";

/**
 * GET /api/families/invitations
 * 家族グループの招待一覧を取得
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "認証が必要です" },
        { status: 401 }
      );
    }

    if (!session.user.familyId) {
      return NextResponse.json(
        { error: "BadRequest", message: "家族グループに所属していません" },
        { status: 400 }
      );
    }

    const invitations = await getInvitationsByFamily(session.user.familyId);

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Error in GET /api/families/invitations:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/families/invitations
 * 新しい招待を作成（管理者のみ）
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "認証が必要です" },
        { status: 401 }
      );
    }

    if (!session.user.familyId) {
      return NextResponse.json(
        { error: "BadRequest", message: "家族グループに所属していません" },
        { status: 400 }
      );
    }

    // 管理者権限チェック
    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "管理者のみが招待を作成できます",
        },
        { status: 403 }
      );
    }

    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "BadRequest", message: "メールアドレスが必要です" },
        { status: 400 }
      );
    }

    // メールアドレスの簡易バリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "BadRequest",
          message: "有効なメールアドレスを入力してください",
        },
        { status: 400 }
      );
    }

    const { invitation, error } = await createInvitation(
      session.user.familyId,
      email,
      session.user.id
    );

    if (error || !invitation) {
      return NextResponse.json(
        { error: "InternalServerError", message: error || "招待の作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "招待を作成しました",
        invitation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/families/invitations:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/families/invitations
 * 招待を削除（管理者のみ）
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "認証が必要です" },
        { status: 401 }
      );
    }

    if (!session.user.familyId) {
      return NextResponse.json(
        { error: "BadRequest", message: "家族グループに所属していません" },
        { status: 400 }
      );
    }

    // 管理者権限チェック
    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "管理者のみが招待を削除できます",
        },
        { status: 403 }
      );
    }

    const { invitationId } = await request.json();

    if (!invitationId) {
      return NextResponse.json(
        { error: "BadRequest", message: "招待IDが必要です" },
        { status: 400 }
      );
    }

    const { success, error } = await deleteInvitation(invitationId);

    if (!success) {
      return NextResponse.json(
        { error: "InternalServerError", message: error || "招待の削除に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "招待を削除しました",
      invitationId,
    });
  } catch (error) {
    console.error("Error in DELETE /api/families/invitations:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
