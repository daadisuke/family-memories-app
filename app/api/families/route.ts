import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    const { data: family, error: familyError } = await supabase
      .from("families")
      .insert({
        name,
        created_by: session.user.id,
      })
      .select()
      .single();

    if (familyError) {
      console.error("Error creating family:", familyError);
      return NextResponse.json(
        { error: "InternalServerError", message: "家族グループの作成に失敗しました" },
        { status: 500 }
      );
    }

    // Update user's family_id
    const { error: updateError } = await supabase
      .from("users")
      .update({ family_id: family.id, role: "admin" })
      .eq("id", session.user.id);

    if (updateError) {
      console.error("Error updating user:", updateError);
      // Rollback: delete the family
      await supabase.from("families").delete().eq("id", family.id);
      return NextResponse.json(
        { error: "InternalServerError", message: "ユーザー情報の更新に失敗しました" },
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

export async function GET(request: Request) {
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
    const { data: family, error: familyError } = await supabase
      .from("families")
      .select("*")
      .eq("id", session.user.familyId)
      .single();

    if (familyError || !family) {
      console.error("Error fetching family:", familyError);
      return NextResponse.json(
        { error: "NotFound", message: "家族グループが見つかりません" },
        { status: 404 }
      );
    }

    // Get family members
    const { data: members, error: membersError } = await supabase
      .from("users")
      .select("id, name, email, image, role, created_at")
      .eq("family_id", session.user.familyId);

    if (membersError) {
      console.error("Error fetching members:", membersError);
      return NextResponse.json(
        { error: "InternalServerError", message: "メンバー情報の取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      family: {
        id: family.id,
        name: family.name,
        createdAt: family.created_at,
        members: members || [],
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
