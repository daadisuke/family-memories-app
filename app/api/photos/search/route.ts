import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { searchPhotos, getPhotoCountBySearch, SearchCriteria } from "@/lib/db/photos";
import { getSignedPhotoUrl } from "@/lib/storage/photos";

/**
 * GET /api/photos/search
 * Search photos with multiple criteria
 *
 * Query parameters:
 * - tags: comma-separated tags (e.g., "family,vacation")
 * - dateFrom: ISO date string (e.g., "2024-01-01")
 * - dateTo: ISO date string (e.g., "2024-12-31")
 * - keyword: search keyword for description and filename
 * - limit: number of photos per page (default: 50, max: 100)
 * - offset: pagination offset (default: 0)
 * - sortBy: uploaded_at | taken_at | created_at (default: uploaded_at)
 * - order: asc | desc (default: desc)
 */
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    const tagsParam = searchParams.get("tags");
    const tags = tagsParam ? tagsParam.split(",").map((t) => t.trim()).filter((t) => t) : undefined;

    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;
    const keyword = searchParams.get("keyword") || undefined;

    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 50;

    const offsetParam = searchParams.get("offset");
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    const sortBy = (searchParams.get("sortBy") as "uploaded_at" | "taken_at" | "created_at") || "uploaded_at";
    const order = (searchParams.get("order") as "asc" | "desc") || "desc";

    // Validate date format if provided
    if (dateFrom && isNaN(Date.parse(dateFrom))) {
      return NextResponse.json(
        { error: "BadRequest", message: "dateFromの形式が不正です（ISO日付形式を使用してください）" },
        { status: 400 }
      );
    }

    if (dateTo && isNaN(Date.parse(dateTo))) {
      return NextResponse.json(
        { error: "BadRequest", message: "dateToの形式が不正です（ISO日付形式を使用してください）" },
        { status: 400 }
      );
    }

    // Build search criteria
    const searchCriteria: SearchCriteria = {
      familyId: session.user.familyId,
      tags,
      dateFrom,
      dateTo,
      keyword,
      limit,
      offset,
      sortBy,
      order,
    };

    // Search photos
    const photos = await searchPhotos(searchCriteria);

    // Get total count (for pagination)
    const totalCount = await getPhotoCountBySearch({
      familyId: session.user.familyId,
      tags,
      dateFrom,
      dateTo,
      keyword,
    });

    // Generate signed URLs for all photos
    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => {
        const { url } = await getSignedPhotoUrl(photo.storage_path);

        return {
          id: photo.id,
          fileName: photo.file_name,
          url: url || "",
          uploadedAt: photo.uploaded_at,
          takenAt: photo.taken_at,
          width: photo.width,
          height: photo.height,
          tags: photo.tags,
          description: photo.description,
        };
      })
    );

    return NextResponse.json({
      photos: photosWithUrls,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + photos.length < totalCount,
      },
      searchCriteria: {
        tags: tags || [],
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        keyword: keyword || null,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/photos/search:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
