import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updatePhotoTags } from "@/lib/db/photos";

/**
 * PATCH /api/photos/[photoId]/tags
 * Add or remove tags from a photo
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ photoId: string }> }
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

    const params = await context.params;
    const { photoId } = params;
    const body = await request.json();
    const { tags, action = "set" } = body;

    // Validate tags
    if (!Array.isArray(tags)) {
      return NextResponse.json(
        { error: "BadRequest", message: "タグは配列で指定してください" },
        { status: 400 }
      );
    }

    // Validate each tag
    for (const tag of tags) {
      if (typeof tag !== "string") {
        return NextResponse.json(
          { error: "BadRequest", message: "タグは文字列で指定してください" },
          { status: 400 }
        );
      }
      if (tag.length === 0 || tag.length > 50) {
        return NextResponse.json(
          {
            error: "BadRequest",
            message: "タグは1〜50文字で指定してください",
          },
          { status: 400 }
        );
      }
      // Check for special characters (allow Japanese, alphanumeric, space, hyphen, underscore)
      if (!/^[\p{L}\p{N}\s\-_]+$/u.test(tag)) {
        return NextResponse.json(
          {
            error: "BadRequest",
            message: "タグに使用できない文字が含まれています",
          },
          { status: 400 }
        );
      }
    }

    // Validate action
    if (!["set", "add", "remove"].includes(action)) {
      return NextResponse.json(
        {
          error: "BadRequest",
          message: "actionはset、add、removeのいずれかを指定してください",
        },
        { status: 400 }
      );
    }

    // Update tags
    const { photo, error } = await updatePhotoTags(
      photoId,
      session.user.familyId,
      tags,
      action as "set" | "add" | "remove"
    );

    if (error) {
      if (error === "写真が見つかりませんでした") {
        return NextResponse.json(
          { error: "NotFound", message: error },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "InternalServerError", message: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      photo: {
        id: photo!.id,
        tags: photo!.tags,
      },
    });
  } catch (error) {
    console.error("Error in PATCH /api/photos/[photoId]/tags:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
