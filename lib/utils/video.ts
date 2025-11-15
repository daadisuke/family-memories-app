/**
 * Video metadata extraction utilities
 */

export interface VideoMetadata {
  duration: number | null; // in seconds
  width: number | null;
  height: number | null;
  codec: string | null;
}

/**
 * Extract video metadata from a video file
 * This uses the HTML5 video element to extract basic metadata
 */
export async function extractVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);

        resolve({
          duration: Math.round(video.duration) || null,
          width: video.videoWidth || null,
          height: video.videoHeight || null,
          codec: null, // Codec info is not easily accessible via HTML5 video element
        });
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        resolve({
          duration: null,
          width: null,
          height: null,
          codec: null,
        });
      };

      video.src = URL.createObjectURL(file);
    } catch (error) {
      console.error("Error extracting video metadata:", error);
      resolve({
        duration: null,
        width: null,
        height: null,
        codec: null,
      });
    }
  });
}

/**
 * Generate a thumbnail from video file
 * This creates a canvas element and captures the first frame
 * Returns a Blob that can be uploaded to storage
 */
export async function generateVideoThumbnail(
  file: File,
  maxWidth: number = 640
): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(null);
        return;
      }

      video.preload = "metadata";
      video.muted = true;

      video.onloadeddata = () => {
        // Seek to 1 second into the video (or beginning if shorter)
        video.currentTime = Math.min(1, video.duration);
      };

      video.onseeked = () => {
        try {
          // Calculate thumbnail dimensions maintaining aspect ratio
          const aspectRatio = video.videoWidth / video.videoHeight;
          const width = Math.min(maxWidth, video.videoWidth);
          const height = width / aspectRatio;

          canvas.width = width;
          canvas.height = height;

          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0, width, height);

          // Convert canvas to blob
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(video.src);
              resolve(blob);
            },
            "image/jpeg",
            0.8 // Quality
          );
        } catch (error) {
          console.error("Error generating thumbnail:", error);
          URL.revokeObjectURL(video.src);
          resolve(null);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        resolve(null);
      };

      video.src = URL.createObjectURL(file);
    } catch (error) {
      console.error("Error in generateVideoThumbnail:", error);
      resolve(null);
    }
  });
}

/**
 * Format video duration in human-readable format (MM:SS or HH:MM:SS)
 */
export function formatVideoDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
