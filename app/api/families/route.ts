import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createFamily,
  updateUserFamily,
  getFamilyById,
  getFamilyMembers,
  deleteFamily,
} from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "認証が必要です" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "BadRequest", message: "家族グループ名が必要です" },
        { status: 400 }
      );
    }

    // Check if user already belongs to a family
    if (session.user.familyId) {
      return NextResponse.json(
        {
          error: "BadRequest",
          message: "既に家族グループに所属しています",
        },
        { status: 400 }
      );
    }

    // Create new family group
    const { family, error: familyError } = await createFamily(
      name,
      session.user.id
    );

    if (familyError || !family) {
      return NextResponse.json(
        { error: "InternalServerError", message: familyError || "家族グループの作成に失敗しました" },
        { status: 500 }
      );
    }

    // Update user's family_id
    const { success, error: updateError } = await updateUserFamily(
      session.user.id,
      family.id,
      "admin"
    );

    if (!success) {
      // Rollback: delete the family
      await deleteFamily(family.id);
      return NextResponse.json(
        { error: "InternalServerError", message: updateError || "ユーザー情報の更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        family: {
          id: family.id,
          name: family.name,
          createdAt: family.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/families:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

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

    // Get family information
    const family = await getFamilyById(session.user.familyId);

    if (!family) {
      return NextResponse.json(
        { error: "NotFound", message: "家族グループが見つかりません" },
        { status: 404 }
      );
    }

    // Get family members
    const members = await getFamilyMembers(session.user.familyId);

    return NextResponse.json({
      family: {
        id: family.id,
        name: family.name,
        createdAt: family.created_at,
        members,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/families:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
