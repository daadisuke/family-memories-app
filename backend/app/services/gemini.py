import base64
import httpx
import google.generativeai as genai
from typing import List

from app.config import settings

# Initialize Gemini API
if settings.google_gemini_api_key:
    genai.configure(api_key=settings.google_gemini_api_key)

# Use Gemini 1.5 Flash for free tier
MODEL_NAME = "gemini-1.5-flash"

# Tag generation prompt
TAG_GENERATION_PROMPT = """この写真を分析し、検索に役立つタグを5-10個生成してください。

ルール：
- 日本語で出力
- 人物（例：子供、家族、赤ちゃん）、場所（例：公園、海、自宅）、イベント（例：誕生日、旅行、お出かけ）、季節（例：春、夏）、雰囲気（例：笑顔、楽しい）などを含める
- 簡潔な単語で出力（1-3語程度）
- カンマ区切りで出力（例：笑顔, 公園, 夏, 家族）
- 説明文や余計な文章は不要、タグのみを出力

出力形式：
タグ1, タグ2, タグ3, ..."""


def is_gemini_available() -> bool:
    """Check if Gemini API is available."""
    return bool(settings.google_gemini_api_key)


async def generate_photo_tags(image_url: str) -> List[str]:
    """
    Generate tags for a photo using Google Gemini API.

    Args:
        image_url: Public URL of the image

    Returns:
        List of generated tags
    """
    if not is_gemini_available():
        print("Gemini API not initialized. Skipping AI tagging.")
        return []

    try:
        # Fetch the image
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url, follow_redirects=True)
            if response.status_code != 200:
                raise Exception(f"Failed to fetch image: {response.status_code}")

            image_data = response.content
            content_type = response.headers.get("content-type", "image/jpeg")

        # Convert to base64
        base64_image = base64.b64encode(image_data).decode("utf-8")

        # Initialize model
        model = genai.GenerativeModel(MODEL_NAME)

        # Generate tags using vision capabilities
        result = model.generate_content(
            [
                TAG_GENERATION_PROMPT,
                {
                    "mime_type": content_type,
                    "data": base64_image,
                },
            ]
        )

        text = result.text

        # Parse the comma-separated tags
        tags = [
            tag.strip()
            for tag in text.split(",")
            if tag.strip() and len(tag.strip()) <= 50
        ][:10]  # Limit to 10 tags

        print(f"Generated {len(tags)} tags for image: {tags}")
        return tags

    except Exception as e:
        print(f"Error generating tags with Gemini: {e}")
        return []
