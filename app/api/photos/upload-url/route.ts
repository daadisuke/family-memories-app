import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPhoto } from "@/lib/db";

/**
 * POST /api/photos/upload-url
 * Create a database record after client-side upload to Supabase Storage
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
    const {
      storagePath,
      fileName,
      fileSize,
      mimeType,
      width,
      height,
      videoDuration,
      videoCodec,
    } = body;

    if (!storagePath || !fileName) {
      return NextResponse.json(
        { error: "BadRequest", message: "必須パラメータが不足しています" },
        { status: 400 }
      );
    }

    // Create photo/video record in database
    const { photo, error: dbError } = await createPhoto({
      userId: session.user.id,
      familyId: session.user.familyId,
      storagePath,
      fileName,
      fileSize: fileSize || undefined,
      mimeType: mimeType || undefined,
      width: width || undefined,
      height: height || undefined,
      videoDuration: videoDuration || undefined,
      videoCodec: videoCodec || undefined,
    });

    if (dbError || !photo) {
      return NextResponse.json(
        { error: "InternalServerError", message: dbError || "情報の保存に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        photo: {
          id: photo.id,
          fileName: photo.file_name,
          uploadedAt: photo.uploaded_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/photos/upload-url:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
