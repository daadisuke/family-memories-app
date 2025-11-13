import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPhotoById, getAdjacentPhotoIds } from "@/lib/db/photos";
import { getSignedPhotoUrl } from "@/lib/storage/photos";

export async function GET(
  request: Request,
  { params }: { params: { photoId: string } }
) {
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

    const { photoId } = params;

    // Get photo details
    const photo = await getPhotoById(photoId, session.user.familyId);

    if (!photo) {
      return NextResponse.json(
        { error: "NotFound", message: "写真が見つかりませんでした" },
        { status: 404 }
      );
    }

    // Generate signed URL
    const { url } = await getSignedPhotoUrl(photo.storage_path);

    // Get adjacent photo IDs for navigation
    const { previousId, nextId } = await getAdjacentPhotoIds(
      photoId,
      session.user.familyId
    );

    return NextResponse.json({
      photo: {
        id: photo.id,
        fileName: photo.file_name,
        url: url || "",
        uploadedAt: photo.uploaded_at,
        takenAt: photo.taken_at,
        width: photo.width,
        height: photo.height,
        tags: photo.tags,
        description: photo.description,
      },
      previousPhotoId: previousId,
      nextPhotoId: nextId,
    });
  } catch (error) {
    console.error("Error in GET /api/photos/[photoId]:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
