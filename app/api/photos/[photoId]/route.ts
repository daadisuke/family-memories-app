import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPhotoById, getAdjacentPhotoIds, deletePhoto } from "@/lib/db/photos";
import { getSignedPhotoUrl, deletePhotoFromStorage } from "@/lib/storage/photos";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ photoId: string }> }
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

    const { photoId } = await params;

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
        location: photo.location,
        mimeType: photo.mime_type,
        videoDuration: photo.video_duration,
        thumbnailPath: photo.thumbnail_path,
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

/**
 * DELETE /api/photos/[photoId]
 * Delete a photo (all family members can delete)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ photoId: string }> }
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

    const { photoId } = await params;

    // Delete from database (family member check)
    const { photo, error: dbError } = await deletePhoto(
      photoId,
      session.user.familyId
    );

    if (dbError || !photo) {
      if (dbError === "写真が見つかりませんでした") {
        return NextResponse.json(
          { error: "NotFound", message: dbError },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "InternalServerError", message: dbError || "写真の削除に失敗しました" },
        { status: 500 }
      );
    }

    // Delete from storage
    const { error: storageError } = await deletePhotoFromStorage(photo.storage_path);

    if (storageError) {
      console.error("Failed to delete from storage, but DB record was deleted:", storageError);
      // Don't fail the request - DB record is already deleted
      // Storage cleanup can be handled by a background job
    }

    return NextResponse.json({
      message: "写真を削除しました",
      photoId: photo.id,
    });
  } catch (error) {
    console.error("Error in DELETE /api/photos/[photoId]:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
