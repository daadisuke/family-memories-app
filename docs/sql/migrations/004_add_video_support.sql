-- Migration: Add video support to photos table
-- Date: 2025-11-15
-- Description: Add columns to support video uploads (duration, codec, thumbnail)

-- Add video-specific columns to photos table
ALTER TABLE photos
ADD COLUMN IF NOT EXISTS video_duration INTEGER, -- Duration in seconds
ADD COLUMN IF NOT EXISTS video_codec TEXT, -- Video codec (e.g., h264, vp9)
ADD COLUMN IF NOT EXISTS thumbnail_path TEXT; -- Path to generated thumbnail

-- Add comment to columns
COMMENT ON COLUMN photos.video_duration IS 'Video duration in seconds (NULL for images)';
COMMENT ON COLUMN photos.video_codec IS 'Video codec information (NULL for images)';
COMMENT ON COLUMN photos.thumbnail_path IS 'Path to video thumbnail in storage (NULL for images)';

-- Create index for filtering by media type (video vs image)
CREATE INDEX IF NOT EXISTS idx_photos_mime_type ON photos(mime_type);

-- Note: The mime_type column already exists and will be used to distinguish between images and videos
-- Video mime types: video/mp4, video/quicktime, video/x-msvideo, video/webm
-- Image mime types: image/jpeg, image/png, image/webp, image/heic
