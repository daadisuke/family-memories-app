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

/**
 * POST /api/photos/upload-url-signed
 * Generate a signed upload URL for client-side upload
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

    const body = await request.json();
    const { fileName, fileType } = body;

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "BadRequest", message: "ファイル名とタイプが必要です" },
        { status: 400 }
      );
    }

    // Generate unique filename and storage path
    const fileExt = fileName.split(".").pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const storagePath = `${session.user.familyId}/${session.user.id}/${uniqueFileName}`;

    // Create signed upload URL (valid for 10 minutes)
    const { data, error } = await supabase.storage
      .from("photos")
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
      console.error("Error creating signed upload URL:", error);
      return NextResponse.json(
        { error: "InternalServerError", message: "署名付きURLの生成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      storagePath,
      originalFileName: fileName,
    });
  } catch (error) {
    console.error("Error in POST /api/photos/upload-url-signed:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
