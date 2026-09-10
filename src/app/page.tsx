"use client";

import { useState, useRef, useEffect } from "react";
import { mockVideos } from "@/lib/mock-data";
import { formatNumber, formatNaira } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  BadgeCheck,
  Music2,
  Plus,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DesktopSidebar } from "@/components/DesktopSidebar";

export default function FeedPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [muted, setMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const isJumping = useRef(false);

  const videos = mockVideos;
  const current = videos[currentIndex];

  // Mobile: IntersectionObserver for scroll-snap
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const slides = root.querySelectorAll("[data-video-slide]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(idx)) setCurrentIndex(idx);
          }
        });
      },
      { root, threshold: [0.6] }
    );

    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        goTo(currentIndex + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        goTo(currentIndex - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentIndex]);

  const goTo = (index: number) => {
    if (index < 0 || index >= videos.length || isJumping.current) return;
    isJumping.current = true;
    setCurrentIndex(index);

    // Mobile scroll-snap
    const root = containerRef.current;
    const target = root?.querySelector(
      `[data-index="${index}"]`
    ) as HTMLElement | null;
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setTimeout(() => {
      isJumping.current = false;
    }, 400);
  };

  const toggleLike = (id: string) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex h-[100dvh] w-full bg-black overflow-hidden">
      {/* ========== DESKTOP SIDEBAR ========== */}
      <DesktopSidebar />

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex min-w-0 relative">
        {/* ---- MOBILE: full-screen scroll-snap feed ---- */}
        <div
          ref={containerRef}
          className="lg:hidden h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
          style={{
            scrollSnapType: "y mandatory",
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorY: "contain",
            touchAction: "pan-y",
          }}
        >
          {videos.map((video, i) => (
            <MobileSlide
              key={video.id}
              video={video}
              index={i}
              isActive={i === currentIndex}
              liked={!!liked[video.id]}
              muted={muted}
              onToggleMute={() => setMuted((m) => !m)}
              onToggleLike={() => toggleLike(video.id)}
            />
          ))}
        </div>

        {/* ---- DESKTOP: centered phone-frame + side actions ---- */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-6 px-6">
          {/* Video frame (phone-like) */}
          <div className="relative h-[min(860px,92vh)] w-[min(420px,28vw)] max-w-[420px] rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl shadow-black/50 ring-1 ring-white/10">
            {current && (
              <>
                <img
                  src={current.thumbnailUrl}
                  alt={current.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />

                {/* Mute */}
                <button
                  onClick={() => setMuted((m) => !m)}
                  className="absolute top-3 left-3 z-20 rounded-full bg-black/50 p-2 backdrop-blur-sm"
                >
                  {muted ? (
                    <VolumeX className="h-4 w-4 text-white" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-white" />
                  )}
                </button>

                {/* Bottom caption inside frame */}
                <div className="absolute bottom-4 left-3 right-3 z-20">
                  <Link
                    href={`/profile?u=${current.creator.username}`}
                    className="flex items-center gap-1.5 mb-1.5"
                  >
                    <span className="font-bold text-white text-sm">
                      @{current.creator.username}
                    </span>
                    {current.creator.isVerified && (
                      <BadgeCheck className="h-4 w-4 text-accent" />
                    )}
                  </Link>
                  <p className="text-white text-sm leading-snug line-clamp-2 mb-2">
                    {current.title}
                  </p>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-success/20 border border-success/40 px-2.5 py-0.5 mb-2">
                    <span className="text-[11px] font-semibold text-success">
                      Earned {formatNaira(current.earnings)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Music2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs truncate">
                      Original sound · {current.creator.displayName}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right action column (TikTok desktop style) */}
          <div className="flex flex-col items-center gap-5 py-4">
            {/* Avatar */}
            {current && (
              <Link
                href={`/profile?u=${current.creator.username}`}
                className="relative"
              >
                <div className="h-12 w-12 rounded-full border-2 border-white bg-zinc-700 flex items-center justify-center text-lg font-bold text-white">
                  {current.creator.displayName.charAt(0)}
                </div>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-primary p-0.5">
                  <Plus className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                </div>
              </Link>
            )}

            <ActionBtn
              icon={
                <Heart
                  className={cn(
                    "h-7 w-7",
                    current && liked[current.id]
                      ? "fill-red-500 text-red-500"
                      : "text-white"
                  )}
                />
              }
              label={
                current
                  ? formatNumber(
                      current.likes + (liked[current.id] ? 1 : 0)
                    )
                  : "0"
              }
              onClick={() => current && toggleLike(current.id)}
            />
            <ActionBtn
              icon={<MessageCircle className="h-7 w-7 text-white" />}
              label={current ? formatNumber(current.comments) : "0"}
            />
            <ActionBtn
              icon={<Bookmark className="h-6 w-6 text-white" />}
              label="Save"
            />
            <ActionBtn
              icon={<Share2 className="h-6 w-6 text-white" />}
              label="Share"
            />

            {/* Up / Down */}
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => goTo(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
              >
                <ChevronUp className="h-5 w-5" />
              </button>
              <button
                onClick={() => goTo(currentIndex + 1)}
                disabled={currentIndex >= videos.length - 1}
                className="rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop top-right actions */}
        <div className="hidden lg:flex absolute top-4 right-6 items-center gap-3 z-30">
          <button className="rounded-full border border-white/20 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/5">
            Get Coins
          </button>
          <button className="rounded-full border border-white/20 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/5">
            Get App
          </button>
          <button className="rounded-full bg-primary px-5 py-1.5 text-sm font-semibold text-white hover:bg-primary/90">
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Mobile full-screen slide ---------- */
function MobileSlide({
  video,
  index,
  isActive,
  liked,
  muted,
  onToggleMute,
  onToggleLike,
}: {
  video: (typeof mockVideos)[0];
  index: number;
  isActive: boolean;
  liked: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onToggleLike: () => void;
}) {
  return (
    <section
      data-video-slide
      data-index={index}
      className="relative h-[100dvh] w-full snap-start snap-always shrink-0"
    >
      <img
        src={video.thumbnailUrl}
        alt={video.title}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/75 pointer-events-none" />

      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-3 safe-top pointer-events-none">
        <span className="text-sm font-semibold text-white/90 tracking-wide">
          Peeny
        </span>
        <button
          onClick={onToggleMute}
          className="rounded-full bg-black/40 p-2 backdrop-blur-sm pointer-events-auto"
        >
          {muted ? (
            <VolumeX className="h-5 w-5 text-white" />
          ) : (
            <Volume2 className="h-5 w-5 text-white" />
          )}
        </button>
      </div>

      <div className="absolute right-3 bottom-36 z-20 flex flex-col items-center gap-5">
        <Link
          href={`/profile?u=${video.creator.username}`}
          className="relative"
        >
          <div className="h-12 w-12 rounded-full border-2 border-white bg-zinc-700 flex items-center justify-center text-lg font-bold text-white">
            {video.creator.displayName.charAt(0)}
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-primary p-0.5">
            <Plus className="h-3.5 w-3.5 text-white" strokeWidth={3} />
          </div>
        </Link>

        <button
          onClick={onToggleLike}
          className="flex flex-col items-center gap-0.5"
        >
          <Heart
            className={cn(
              "h-8 w-8",
              liked ? "fill-red-500 text-red-500" : "text-white"
            )}
          />
          <span className="text-xs font-semibold text-white">
            {formatNumber(video.likes + (liked ? 1 : 0))}
          </span>
        </button>

        <button className="flex flex-col items-center gap-0.5">
          <MessageCircle className="h-8 w-8 text-white" />
          <span className="text-xs font-semibold text-white">
            {formatNumber(video.comments)}
          </span>
        </button>

        <button className="flex flex-col items-center gap-0.5">
          <Bookmark className="h-7 w-7 text-white" />
        </button>

        <button className="flex flex-col items-center gap-0.5">
          <Share2 className="h-7 w-7 text-white" />
        </button>
      </div>

      <div className="absolute bottom-20 left-0 right-16 z-20 px-4 pointer-events-none">
        <Link
          href={`/profile?u=${video.creator.username}`}
          className="flex items-center gap-1.5 mb-2 pointer-events-auto"
        >
          <span className="font-bold text-white text-[15px]">
            @{video.creator.username}
          </span>
          {video.creator.isVerified && (
            <BadgeCheck className="h-4 w-4 text-accent" />
          )}
        </Link>
        <p className="text-white text-sm leading-snug line-clamp-2 mb-2">
          {video.title}
          {video.description && (
            <span className="text-white/80"> · {video.description}</span>
          )}
        </p>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-success/20 border border-success/40 px-2.5 py-1 mb-2">
          <span className="text-xs font-semibold text-success">
            Earned {formatNaira(video.earnings)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-white/90">
          <Music2 className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs truncate">
            Original sound · {video.creator.displayName}
          </span>
        </div>
      </div>
    </section>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 group"
    >
      <div className="rounded-full bg-white/10 p-3 group-hover:bg-white/20 transition-colors">
        {icon}
      </div>
      <span className="text-xs font-semibold text-white/90">{label}</span>
    </button>
  );
}
