import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPhotosByFamilyId } from "@/lib/db";
import { getPhotoUrl } from "@/lib/storage/photos";

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
        { error: "BadRequest", message: "家族グループに所属していません" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = (searchParams.get("sortBy") || "uploaded_at") as "uploaded_at" | "taken_at" | "created_at";
    const order = (searchParams.get("order") || "desc") as "asc" | "desc";

    const photos = await getPhotosByFamilyId(session.user.familyId, {
      limit,
      offset,
      sortBy,
      order,
    });

    const photosWithUrls = photos.map((photo) => ({
      id: photo.id,
      fileName: photo.file_name,
      url: getPhotoUrl(photo.storage_path),
      uploadedAt: photo.uploaded_at,
      takenAt: photo.taken_at,
      width: photo.width,
      height: photo.height,
      tags: photo.tags,
      description: photo.description,
    }));

    return NextResponse.json({
      photos: photosWithUrls,
      count: photosWithUrls.length,
      hasMore: photosWithUrls.length === limit,
    });
  } catch (error) {
    console.error("Error in GET /api/photos:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
