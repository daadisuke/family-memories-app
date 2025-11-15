"use client";

import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  url: string;
  poster?: string; // Thumbnail URL
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
}

export default function VideoPlayer({
  url,
  poster,
  className = "",
  autoPlay = false,
  muted = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set initial properties
    if (autoPlay) {
      video.play().catch((error) => {
        console.error("Auto-play failed:", error);
      });
    }
  }, [autoPlay]);

  return (
    <video
      ref={videoRef}
      src={url}
      poster={poster}
      controls
      className={className}
      muted={muted}
      preload="metadata"
      style={{
        maxWidth: "100%",
        maxHeight: "80vh",
        width: "100%",
        height: "auto",
      }}
    >
      お使いのブラウザは動画再生に対応していません。
    </video>
  );
}
