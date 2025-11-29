/**
 * AI tagging service that communicates with FastAPI backend
 */

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

interface TagResponse {
  success: boolean;
  tags: string[];
  message?: string;
}

interface GeminiStatusResponse {
  available: boolean;
}

/**
 * Generate tags for a photo using FastAPI backend (Gemini API)
 * @param imageUrl - Public URL of the image
 * @returns Array of generated tags
 */
export async function generatePhotoTags(imageUrl: string): Promise<string[]> {
  try {
    const response = await fetch(`${FASTAPI_URL}/api/v1/photos/generate-tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image_url: imageUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("FastAPI error:", response.status, errorData);
      return [];
    }

    const data: TagResponse = await response.json();

    if (data.success && data.tags) {
      console.log(`Generated ${data.tags.length} tags for image:`, data.tags);
      return data.tags;
    }

    return [];
  } catch (error) {
    console.error("Error calling FastAPI for tag generation:", error);
    return [];
  }
}

/**
 * Check if Gemini API is available via FastAPI backend
 */
export async function checkGeminiAvailable(): Promise<boolean> {
  try {
    const response = await fetch(
      `${FASTAPI_URL}/api/v1/photos/gemini-status`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const data: GeminiStatusResponse = await response.json();
    return data.available;
  } catch (error) {
    // FastAPI server might not be running
    console.warn("FastAPI server not available:", error);
    return false;
  }
}

/**
 * Synchronous check - for backwards compatibility
 * This checks if FASTAPI_URL is configured
 */
export function isGeminiAvailable(): boolean {
  return !!FASTAPI_URL;
}
