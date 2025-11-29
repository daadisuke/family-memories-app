import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API client
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GOOGLE_GEMINI_API_KEY is not set. AI tagging will be disabled.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Use Gemini 1.5 Flash for free tier
const MODEL_NAME = "gemini-1.5-flash";

// Tag generation prompt
const TAG_GENERATION_PROMPT = `この写真を分析し、検索に役立つタグを5-10個生成してください。

ルール：
- 日本語で出力
- 人物（例：子供、家族、赤ちゃん）、場所（例：公園、海、自宅）、イベント（例：誕生日、旅行、お出かけ）、季節（例：春、夏）、雰囲気（例：笑顔、楽しい）などを含める
- 簡潔な単語で出力（1-3語程度）
- カンマ区切りで出力（例：笑顔, 公園, 夏, 家族）
- 説明文や余計な文章は不要、タグのみを出力

出力形式：
タグ1, タグ2, タグ3, ...`;

/**
 * Generate tags for a photo using Google Gemini API
 * @param imageUrl - Public URL of the image
 * @returns Array of generated tags
 */
export async function generatePhotoTags(imageUrl: string): Promise<string[]> {
  if (!genAI) {
    console.warn("Gemini API not initialized. Skipping AI tagging.");
    return [];
  }

  try {
    // Fetch the image and convert to base64
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    // Get MIME type from response headers
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";

    // Initialize model
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Generate tags using vision capabilities
    const result = await model.generateContent([
      TAG_GENERATION_PROMPT,
      {
        inlineData: {
          mimeType: contentType,
          data: base64Image,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Parse the comma-separated tags
    const tags = text
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0 && tag.length <= 50) // Filter out empty or too long tags
      .slice(0, 10); // Limit to 10 tags

    console.log(`Generated ${tags.length} tags for image:`, tags);
    return tags;
  } catch (error) {
    console.error("Error generating tags with Gemini:", error);
    return [];
  }
}

/**
 * Check if Gemini API is available
 */
export function isGeminiAvailable(): boolean {
  return genAI !== null;
}
