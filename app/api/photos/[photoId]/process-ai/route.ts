import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPhotoById, updatePhoto } from "@/lib/db/photos";
import { getPhotoUrl } from "@/lib/storage/photos";
import { generatePhotoTags, isGeminiAvailable } from "@/lib/ai/gemini";

/**
 * POST /api/photos/[photoId]/process-ai
 * Process a photo with AI to generate tags
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.familyId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "ログインが必要です" },
        { status: 401 }
      );
    }

    // Check if Gemini API is available
    if (!isGeminiAvailable()) {
      return NextResponse.json(
        { error: "ServiceUnavailable", message: "AI機能が設定されていません" },
        { status: 503 }
      );
    }

    const { photoId } = await params;

    // Get photo and verify ownership
    const photo = await getPhotoById(photoId, session.user.familyId);
    if (!photo) {
      return NextResponse.json(
        { error: "NotFound", message: "写真が見つかりませんでした" },
        { status: 404 }
      );
    }

    // Check if it's a video (skip AI processing for videos)
    if (photo.mime_type?.startsWith("video/")) {
      return NextResponse.json(
        { error: "InvalidMediaType", message: "動画はAI処理の対象外です" },
        { status: 400 }
      );
    }

    // Get public URL for the image
    const imageUrl = getPhotoUrl(photo.storage_path);

    // Generate tags using Gemini
    const tags = await generatePhotoTags(imageUrl);

    if (tags.length === 0) {
      // Update ai_processed flag even if no tags were generated
      await updatePhoto(photoId, { aiProcessed: true });
      return NextResponse.json({
        success: true,
        message: "AI処理が完了しましたが、タグを生成できませんでした",
        tags: [],
      });
    }

    // Update photo with generated tags
    const { success, error } = await updatePhoto(photoId, {
      tags: tags,
      aiProcessed: true,
    });

    if (!success) {
      return NextResponse.json(
        { error: "UpdateFailed", message: error || "タグの保存に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "AI処理が完了しました",
      tags: tags,
    });
  } catch (error) {
    console.error("Error in process-ai:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: "AI処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
