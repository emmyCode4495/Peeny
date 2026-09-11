"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FeedVideoProps {
  src: string;
  poster: string;
  active: boolean;
  muted: boolean;
  /** User toggled pause via tap */
  userPaused?: boolean;
  className?: string;
  onReady?: () => void;
}

/**
 * TikTok-style player:
 * - Poster until first frame (no black flash)
 * - active + !userPaused → play; otherwise pause
 */
export function FeedVideo({
  src,
  poster,
  active,
  muted,
  userPaused = false,
  className,
  onReady,
}: FeedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPoster, setShowPoster] = useState(true);
  const [failed, setFailed] = useState(false);

  const revealVideo = () => {
    setShowPoster(false);
    onReady?.();
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.muted = muted;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "true");
    v.setAttribute("webkit-playsinline", "true");
    v.setAttribute("x5-playsinline", "true");

    let poll: ReturnType<typeof setInterval> | null = null;

    const shouldPlay = active && !userPaused;

    if (shouldPlay) {
      const tryPlay = async () => {
        try {
          v.muted = muted;
          await v.play();
        } catch {
          try {
            v.muted = true;
            await v.play();
          } catch {
            /* keep poster */
          }
        }
      };
      tryPlay();

      poll = setInterval(() => {
        if (v.currentTime > 0.05 && !v.paused) {
          setShowPoster(false);
          if (poll) clearInterval(poll);
        }
      }, 100);
      setTimeout(() => {
        if (poll) clearInterval(poll);
        if (v && !v.paused && v.readyState >= 2) setShowPoster(false);
      }, 800);
    } else {
      v.pause();
      if (!active) {
        v.muted = true;
        try {
          v.currentTime = 0;
        } catch {
          /* ignore */
        }
        setShowPoster(true);
      }
      // userPaused + active: keep frame visible, poster off
      if (active && userPaused) {
        setShowPoster(false);
      }
    }

    return () => {
      if (poll) clearInterval(poll);
    };
  }, [active, muted, src, userPaused]);

  return (
    <div className={cn("absolute inset-0 bg-background", className)}>
      <video
        ref={videoRef}
        src={src}
        className="absolute inset-0 z-[1] h-full w-full object-cover"
        style={{ transform: "translateZ(0)", WebkitTransform: "translateZ(0)" }}
        loop
        muted={muted}
        playsInline
        preload={active ? "auto" : "metadata"}
        controls={false}
        disablePictureInPicture
        onLoadedData={() => {
          if (active && videoRef.current && !videoRef.current.paused) {
            revealVideo();
          }
        }}
        onPlaying={() => revealVideo()}
        onTimeUpdate={() => {
          const v = videoRef.current;
          if (v && v.currentTime > 0.05) revealVideo();
        }}
        onError={() => setFailed(true)}
      />

      {(showPoster || failed) && (
        <img
          src={poster}
          alt=""
          draggable={false}
          className="absolute inset-0 z-[2] h-full w-full object-cover"
        />
      )}
    </div>
  );
}
