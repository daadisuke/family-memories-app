from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.services.gemini import generate_photo_tags, is_gemini_available

router = APIRouter()


class TagRequest(BaseModel):
    """Request model for tag generation."""

    image_url: str


class TagResponse(BaseModel):
    """Response model for tag generation."""

    success: bool
    tags: List[str]
    message: Optional[str] = None


class GeminiStatusResponse(BaseModel):
    """Response model for Gemini status."""

    available: bool


@router.get("/gemini-status", response_model=GeminiStatusResponse)
async def get_gemini_status():
    """Check if Gemini API is available."""
    return GeminiStatusResponse(available=is_gemini_available())


@router.post("/generate-tags", response_model=TagResponse)
async def generate_tags(request: TagRequest):
    """
    Generate AI tags for a photo.

    Args:
        request: TagRequest containing the image URL

    Returns:
        TagResponse with generated tags
    """
    if not is_gemini_available():
        raise HTTPException(
            status_code=503,
            detail="AI機能が設定されていません (Gemini API key not configured)",
        )

    if not request.image_url:
        raise HTTPException(
            status_code=400,
            detail="image_url is required",
        )

    tags = await generate_photo_tags(request.image_url)

    if not tags:
        return TagResponse(
            success=True,
            tags=[],
            message="AI処理が完了しましたが、タグを生成できませんでした",
        )

    return TagResponse(
        success=True,
        tags=tags,
        message=f"{len(tags)}個のタグを生成しました",
    )
