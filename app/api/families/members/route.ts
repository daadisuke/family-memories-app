import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getFamilyMembers,
  removeUserFromFamily,
  updateUserRole,
  getFamilyMemberById,
} from "@/lib/db";

/**
 * GET /api/families/members
 * Get all members of the current user's family
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
        { error: "NotFound", message: "家族グループに所属していません" },
        { status: 404 }
      );
    }

    const members = await getFamilyMembers(session.user.familyId);

    return NextResponse.json({
      members,
    });
  } catch (error) {
    console.error("Error in GET /api/families/members:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/families/members
 * Remove a member from the family (admin only)
 * Body: { userId: string }
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
        { error: "NotFound", message: "家族グループに所属していません" },
        { status: 404 }
      );
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden", message: "管理者権限が必要です" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "BadRequest", message: "ユーザーIDが必要です" },
        { status: 400 }
      );
    }

    // Prevent user from removing themselves
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "BadRequest", message: "自分自身を削除することはできません" },
        { status: 400 }
      );
    }

    // Verify the user belongs to the same family
    const targetUser = await getFamilyMemberById(userId);
    if (!targetUser || targetUser.id !== userId) {
      return NextResponse.json(
        { error: "NotFound", message: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // Remove user from family
    const { success, error: removeError } = await removeUserFromFamily(userId);

    if (!success) {
      return NextResponse.json(
        { error: "InternalServerError", message: removeError || "メンバーの削除に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "メンバーを削除しました",
      userId,
    });
  } catch (error) {
    console.error("Error in DELETE /api/families/members:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/families/members
 * Update member role (admin only)
 * Body: { userId: string, role: "admin" | "member" }
 */
export async function PATCH(request: Request) {
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
        { error: "NotFound", message: "家族グループに所属していません" },
        { status: 404 }
      );
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden", message: "管理者権限が必要です" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "BadRequest", message: "ユーザーIDが必要です" },
        { status: 400 }
      );
    }

    if (!role || !["admin", "member"].includes(role)) {
      return NextResponse.json(
        { error: "BadRequest", message: "有効な役割を指定してください（admin または member）" },
        { status: 400 }
      );
    }

    // Verify the user belongs to the same family
    const targetUser = await getFamilyMemberById(userId);
    if (!targetUser || targetUser.id !== userId) {
      return NextResponse.json(
        { error: "NotFound", message: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // Update user role
    const { success, error: updateError } = await updateUserRole(userId, role);

    if (!success) {
      return NextResponse.json(
        { error: "InternalServerError", message: updateError || "役割の更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "役割を更新しました",
      userId,
      role,
    });
  } catch (error) {
    console.error("Error in PATCH /api/families/members:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
