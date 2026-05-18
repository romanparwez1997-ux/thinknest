"use client";

import { useRef, useEffect } from "react";

interface SecureVideoPlayerProps {
  videoId: string;
  videoUrl: string;
  startAtSeconds?: number;
}

export default function SecureVideoPlayer({ videoId, videoUrl, startAtSeconds = 0 }: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastPingTime = useRef<number>(0);

  useEffect(() => {
    console.log("🟢 [PLAYER MOUNTED] Video ID:", videoId);
    if (videoRef.current && startAtSeconds > 0) {
      videoRef.current.currentTime = startAtSeconds;
    }
  }, [videoId, startAtSeconds]);

  const saveProgress = (currentSeconds: number, totalSeconds: number) => {
    if (!totalSeconds || isNaN(totalSeconds) || currentSeconds === 0) return;
    
    console.log(`🚀 [TRACKER] Firing API Request to /api/progress... (${currentSeconds}s / ${totalSeconds}s)`);

    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoId,
        progressSeconds: currentSeconds,
        totalSeconds: totalSeconds,
      }),
      keepalive: true,
    })
    .then(async (res) => {
      if (!res.ok) {
        console.error(`❌ [BACKEND ERROR] Status ${res.status}:`, await res.text());
      } else {
        console.log("✅ [BACKEND SUCCESS] Progress saved in database!");
      }
    })
    .catch(err => console.error("💥 [NETWORK ERROR]", err));
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const currentSeconds = video.currentTime;
    const totalSeconds = video.duration;

    // Ping the server every 5 seconds
    if (Math.abs(currentSeconds - lastPingTime.current) > 5) {
      lastPingTime.current = currentSeconds;
      saveProgress(currentSeconds, totalSeconds);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black shadow-lg">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        onPlay={() => console.log("▶️ [VIDEO] User clicked PLAY!")}
        onPause={() => console.log("⏸️ [VIDEO] User clicked PAUSE!")}
        onTimeUpdate={handleTimeUpdate}
        className="w-full h-auto aspect-video object-contain"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}