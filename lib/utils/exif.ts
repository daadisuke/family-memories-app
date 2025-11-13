import exifr from "exifr";

/**
 * 写真ファイルからEXIFメタデータの撮影日を抽出します
 * @param file - 画像ファイル（File オブジェクト）
 * @returns 撮影日のISO 8601形式文字列、またはnull（取得できない場合）
 */
export async function extractDateTaken(file: File): Promise<string | null> {
  try {
    // EXIFデータを抽出（DateTimeOriginal, CreateDateを優先的に取得）
    const exifData = await exifr.parse(file, {
      pick: ["DateTimeOriginal", "CreateDate", "DateTime"],
    });

    if (!exifData) {
      console.log("No EXIF data found in file:", file.name);
      return null;
    }

    // DateTimeOriginalが最も正確な撮影日時
    const takenDate =
      exifData.DateTimeOriginal || exifData.CreateDate || exifData.DateTime;

    if (!takenDate) {
      console.log("No date found in EXIF data for file:", file.name);
      return null;
    }

    // DateオブジェクトをISO 8601形式に変換
    if (takenDate instanceof Date) {
      return takenDate.toISOString();
    }

    // 文字列の場合はそのまま返す（exifrが自動的にDateオブジェクトに変換してくれるはず）
    if (typeof takenDate === "string") {
      const parsedDate = new Date(takenDate);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
    }

    console.log("Invalid date format in EXIF data for file:", file.name);
    return null;
  } catch (error) {
    console.error("Error extracting EXIF data from file:", file.name, error);
    return null;
  }
}

/**
 * 写真ファイルから位置情報（GPS）を抽出します（今後の実装用）
 * @param file - 画像ファイル（File オブジェクト）
 * @returns 緯度・経度オブジェクト、またはnull（取得できない場合）
 */
export async function extractGPSLocation(
  file: File
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const exifData = await exifr.parse(file, {
      pick: ["latitude", "longitude"],
      gps: true,
    });

    if (!exifData || !exifData.latitude || !exifData.longitude) {
      return null;
    }

    return {
      latitude: exifData.latitude,
      longitude: exifData.longitude,
    };
  } catch (error) {
    console.error("Error extracting GPS data from file:", file.name, error);
    return null;
  }
}
