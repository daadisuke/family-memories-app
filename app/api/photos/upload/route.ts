import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPhoto } from "@/lib/db";
import { uploadPhoto, validatePhotoFile, isVideoFile } from "@/lib/storage/photos";
import { extractDateTaken, extractGPSLocation } from "@/lib/utils/exif";

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

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "BadRequest", message: "ファイルが指定されていません" },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validatePhotoFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "BadRequest", message: validation.error },
        { status: 400 }
      );
    }

    const isVideo = isVideoFile(file);

    // Extract EXIF metadata for images only (撮影日と位置情報を取得)
    let takenAt: string | null = null;
    let location: { latitude: number; longitude: number } | null = null;

    if (!isVideo) {
      const results = await Promise.all([
        extractDateTaken(file),
        extractGPSLocation(file),
      ]);
      takenAt = results[0];
      location = results[1];
    }

    // Get video metadata from FormData if it's a video
    // (Client will send these in the FormData)
    const videoDuration = isVideo ? formData.get("videoDuration") : null;
    const videoWidth = isVideo ? formData.get("videoWidth") : null;
    const videoHeight = isVideo ? formData.get("videoHeight") : null;

    // Upload to storage
    const { path, error: uploadError } = await uploadPhoto(
      file,
      session.user.familyId,
      session.user.id
    );

    if (uploadError || !path) {
      return NextResponse.json(
        { error: "InternalServerError", message: uploadError || "アップロードに失敗しました" },
        { status: 500 }
      );
    }

    // Create photo/video record in database
    const { photo, error: dbError } = await createPhoto({
      userId: session.user.id,
      familyId: session.user.familyId,
      storagePath: path,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      takenAt: takenAt || undefined, // EXIFから取得した撮影日、取得できない場合はundefined
      location: location || undefined, // EXIFから取得した位置情報、取得できない場合はundefined
      // Video metadata
      videoDuration: videoDuration ? parseInt(videoDuration as string) : undefined,
      width: videoWidth ? parseInt(videoWidth as string) : undefined,
      height: videoHeight ? parseInt(videoHeight as string) : undefined,
    });

    if (dbError || !photo) {
      return NextResponse.json(
        { error: "InternalServerError", message: dbError || "写真情報の保存に失敗しました" },
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
    console.error("Error in POST /api/photos/upload:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
