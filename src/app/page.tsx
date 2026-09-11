"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useFeed } from "@/hooks/useFeed";
import { useEngagement } from "@/hooks/useEngagement";
import type { Post } from "@/types/database";
import { FeedVideo } from "@/components/FeedVideo";
import { CommentsSheet } from "@/components/CommentsSheet";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function FeedPage() {
  const { posts, loading, error, toggleLike, refresh } = useFeed();
  const { recordView, toggleSave, recordShare } = useEngagement();
  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [userPaused, setUserPaused] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);
  const lastTap = useRef(0);
  const [toast, setToast] = useState<string | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null);

  const mobileRef = useRef<HTMLDivElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const isJumping = useRef(false);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const watchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelLock = useRef(false);

  const current = posts[currentIndex];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // TikTok-style view after 2s active
  useEffect(() => {
    if (watchTimer.current) clearTimeout(watchTimer.current);
    const post = posts[currentIndex];
    if (!post) return;
    watchTimer.current = setTimeout(() => {
      recordView(post.id);
    }, 2000);
    return () => {
      if (watchTimer.current) clearTimeout(watchTimer.current);
    };
  }, [currentIndex, posts, recordView]);

  // New slide → auto-play (clear user pause)
  useEffect(() => {
    setUserPaused(false);
  }, [currentIndex]);

  // Play/pause handled inside FeedVideo

  // Mobile intersection observer
  useEffect(() => {
    const root = mobileRef.current;
    if (!root) return;

    const slides = root.querySelectorAll("[data-video-slide]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(idx)) setCurrentIndex(idx);
          }
        });
      },
      { root, threshold: [0.55] }
    );

    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [posts]);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= posts.length || isJumping.current) return;
      isJumping.current = true;
      setCurrentIndex(index);

      // Mobile scroll-snap
      const mobile = mobileRef.current;
      const target = mobile?.querySelector(
        `[data-index="${index}"]`
      ) as HTMLElement | null;
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });

      setTimeout(() => {
        isJumping.current = false;
      }, 450);
    },
    [posts.length]
  );

  // Desktop + global: wheel / trackpad swipe between videos
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      // Only hijack when over feed area
      if (wheelLock.current || posts.length === 0) return;
      if (Math.abs(e.deltaY) < 25) return;
      e.preventDefault();
      wheelLock.current = true;
      if (e.deltaY > 0) goTo(currentIndex + 1);
      else goTo(currentIndex - 1);
      setTimeout(() => {
        wheelLock.current = false;
      }, 500);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        goTo(currentIndex + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        goTo(currentIndex - 1);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [currentIndex, goTo, posts.length]);

  // Desktop touch swipe
  useEffect(() => {
    const el = desktopRef.current;
    if (!el) return;
    let startY = 0;
    let tracking = false;

    const onStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      tracking = true;
    };
    const onEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const dy = startY - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 50) return;
      if (dy > 0) goTo(currentIndex + 1);
      else goTo(currentIndex - 1);
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [currentIndex, goTo]);

  const setVideoRef = (index: number, el: HTMLVideoElement | null) => {
    if (el) videoRefs.current.set(index, el);
    else videoRefs.current.delete(index);
  };

  const handleLike = (postId: string) => {
    toggleLike(postId);
  };

  const handleVideoTap = (postId: string) => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      // Double tap → like
      lastTap.current = 0;
      if (!posts.find((p) => p.id === postId)?.liked_by_me) {
        toggleLike(postId);
      }
      setHeartBurst(true);
      setTimeout(() => setHeartBurst(false), 600);
      return;
    }
    lastTap.current = now;
    setTimeout(() => {
      if (lastTap.current === now) {
        // Single tap → pause / play
        setUserPaused((p) => !p);
      }
    }, 280);
  };

  const handleSave = async (postId: string) => {
    const was = !!savedMap[postId];
    setSavedMap((m) => ({ ...m, [postId]: !was }));
    try {
      await toggleSave(postId, was);
      showToast(was ? "Removed from saved" : "Saved");
    } catch (err) {
      setSavedMap((m) => ({ ...m, [postId]: was }));
      if (err instanceof Error && err.message === "login_required") {
        showToast("Log in to save videos");
      } else {
        showToast("Could not save");
      }
    }
  };

  const handleShare = async (post: Post) => {
    try {
      await recordShare(post.id, post.title);
      showToast("Link ready to share");
    } catch {
      showToast("Could not share");
    }
  };

  const openComments = (postId: string) => {
    setCommentsPostId(postId);
    setCommentsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center bg-black gap-3 px-6 text-center">
        <p className="text-white font-semibold">Couldn&apos;t load feed</p>
        <p className="text-sm text-muted max-w-xs">{error}</p>
        <button
          onClick={() => refresh()}
          className="mt-2 rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center bg-black gap-3 px-6 text-center">
        <p className="text-white font-semibold">No posts available</p>
        <p className="text-sm text-muted">Be the first to upload an AI video.</p>
        <Link
          href="/upload"
          className="mt-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
        >
          Upload
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-black overflow-hidden relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-surface border border-white/10 px-4 py-2 text-sm font-medium text-foreground shadow-xl">
          {toast}
        </div>
      )}

      {/* ========== MOBILE only (unmounted on desktop to avoid double audio) ========== */}
      {isMobile && (
      <div
        ref={mobileRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        style={{
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorY: "contain",
          touchAction: "pan-y",
        }}
      >
        {posts.map((post, i) => (
          <section
            key={post.id}
            data-video-slide
            data-index={i}
            className="relative h-[100dvh] w-full snap-start snap-always shrink-0 bg-black"
          >
            <FeedVideo
              src={post.video_url}
              poster={post.thumbnail_url}
              active={i === currentIndex}
              muted={muted}
              userPaused={i === currentIndex && userPaused}
            />
            {/* Tap layer: single = pause, double = like */}
            <button
              type="button"
              aria-label="Tap to pause, double-tap to like"
              className="absolute inset-0 z-[8] bg-transparent"
              onClick={(e) => {
                e.preventDefault();
                handleVideoTap(post.id);
              }}
            />
            {i === currentIndex && heartBurst && (
              <div className="absolute inset-0 z-[9] flex items-center justify-center pointer-events-none">
                <Heart className="h-24 w-24 fill-primary text-primary animate-ping opacity-80" />
              </div>
            )}
            {i === currentIndex && userPaused && (
              <div className="absolute inset-0 z-[9] flex items-center justify-center pointer-events-none">
                <div className="rounded-full bg-black/45 p-4 backdrop-blur-sm">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Light gradients only — never cover the whole frame in black */}
            <div className="absolute inset-0 z-[5] bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none" />

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-3 safe-top">
              <span className="text-sm font-display font-bold text-white tracking-tight">Peeny</span>
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                className="rounded-full bg-black/40 p-2 backdrop-blur-sm"
              >
                {muted ? (
                  <VolumeX className="h-5 w-5 text-white" />
                ) : (
                  <Volume2 className="h-5 w-5 text-white" />
                )}
              </button>
            </div>

            {/* Grouped glass action rail */}
            <div className="absolute right-2.5 bottom-36 z-20 action-rail rounded-full py-3 px-1.5 flex flex-col items-center gap-4">
              <Link
                href={`/profile?u=${post.profile?.username}`}
                className="relative"
              >
                <Avatar
                  name={post.profile?.display_name ?? "?"}
                  url={post.profile?.avatar_url}
                  size={48}
                />
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-primary p-0.5">
                  <Plus className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                </div>
              </Link>

              <button
                type="button"
                onClick={() => handleLike(post.id)}
                className="flex flex-col items-center gap-0.5"
              >
                <Heart
                  className={cn(
                    "h-8 w-8",
                    post.liked_by_me
                      ? "fill-red-500 text-red-500"
                      : "text-white"
                  )}
                />
                <span className="text-xs font-semibold text-white">
                  {formatNumber(Math.max(0, post.likes_count))}
                </span>
              </button>

              <button
                type="button"
                onClick={() => openComments(post.id)}
                className="flex flex-col items-center gap-0.5"
              >
                <MessageCircle className="h-8 w-8 text-white" />
                <span className="text-xs font-semibold text-white">
                  {formatNumber(Math.max(0, post.comments_count))}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSave(post.id)}
                className="flex flex-col items-center gap-0.5"
              >
                <Bookmark
                  className={cn(
                    "h-7 w-7",
                    savedMap[post.id]
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-white"
                  )}
                />
                <span className="text-[10px] font-semibold text-white">
                  {savedMap[post.id] ? "Saved" : "Save"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleShare(post)}
                className="flex flex-col items-center gap-0.5"
              >
                <Share2 className="h-7 w-7 text-white" />
                <span className="text-[10px] font-semibold text-white">Share</span>
              </button>
            </div>

            {/* Caption */}
            <div className="absolute bottom-20 left-0 right-16 z-20 px-4 pointer-events-none">
              <Link
                href={`/profile?u=${post.profile?.username}`}
                className="flex items-center gap-1.5 mb-2 pointer-events-auto"
              >
                <span className="font-bold text-white text-[15px]">
                  @{post.profile?.username}
                </span>
                {post.profile?.is_verified && (
                  <BadgeCheck className="h-4 w-4 text-mint" />
                )}
              </Link>
              <p className="text-white text-sm leading-snug line-clamp-2 mb-2">
                {post.title}
              </p>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 border border-gold/35 px-2.5 py-1 mb-2">
                <span className="text-xs font-semibold text-gold">
                  Earned {formatNaira(Number(post.earnings_ngn))}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <Music2 className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs truncate">
                  {formatNumber(Math.max(0, post.views_count))} views ·{" "}
                  {post.profile?.display_name}
                </span>
              </div>
            </div>
          </section>
        ))}
      </div>
      )}

      {/* ========== DESKTOP only ========== */}
      {!isMobile && (
      <div
        ref={desktopRef}
        className="flex flex-1 items-center justify-center gap-6 px-6 h-full"
      >
        <div className="relative h-[min(860px,92vh)] w-[min(420px,28vw)] max-w-[420px] rounded-2xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10">
          {current && (
            <>
              <FeedVideo
                key={current.id}
                src={current.video_url}
                poster={current.thumbnail_url}
                active={true}
                muted={muted}
                userPaused={userPaused}
              />
              <button
                type="button"
                aria-label="Tap to pause, double-tap to like"
                className="absolute inset-0 z-[8] bg-transparent"
                onClick={(e) => {
                  e.preventDefault();
                  handleVideoTap(current.id);
                }}
              />
              {heartBurst && (
                <div className="absolute inset-0 z-[9] flex items-center justify-center pointer-events-none">
                  <Heart className="h-24 w-24 fill-primary text-primary animate-ping opacity-80" />
                </div>
              )}
              {userPaused && (
                <div className="absolute inset-0 z-[9] flex items-center justify-center pointer-events-none">
                  <div className="rounded-full bg-black/45 p-4 backdrop-blur-sm">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 z-[5] bg-gradient-to-b from-black/25 via-transparent to-black/45 pointer-events-none" />

              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                className="absolute top-3 left-3 z-20 rounded-full bg-black/50 p-2"
              >
                {muted ? (
                  <VolumeX className="h-4 w-4 text-white" />
                ) : (
                  <Volume2 className="h-4 w-4 text-white" />
                )}
              </button>

              <div className="absolute bottom-4 left-3 right-3 z-20">
                <Link
                  href={`/profile?u=${current.profile?.username}`}
                  className="flex items-center gap-1.5 mb-1.5"
                >
                  <span className="font-bold text-white text-sm">
                    @{current.profile?.username}
                  </span>
                  {current.profile?.is_verified && (
                    <BadgeCheck className="h-4 w-4 text-mint" />
                  )}
                </Link>
                <p className="text-white text-sm line-clamp-2 mb-2">
                  {current.title}
                </p>
                <div className="inline-flex rounded-full bg-gold/15 border border-gold/35 px-2.5 py-0.5 mb-2">
                  <span className="text-[11px] font-semibold text-gold">
                    Earned {formatNaira(Number(current.earnings_ngn))}
                  </span>
                </div>
                <p className="text-xs text-white/80">
                  {formatNumber(Math.max(0, current.views_count))} views
                </p>
              </div>
            </>
          )}
        </div>

        <div className="action-rail rounded-full py-4 px-2 flex flex-col items-center gap-4">
          {current?.profile && (
            <Link
              href={`/profile?u=${current.profile.username}`}
              className="relative"
            >
              <Avatar
                name={current.profile.display_name}
                url={current.profile.avatar_url}
                size={48}
              />
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
                  current?.liked_by_me
                    ? "fill-red-500 text-red-500"
                    : "text-white"
                )}
              />
            }
            label={
              current ? formatNumber(Math.max(0, current.likes_count)) : "0"
            }
            onClick={() => current && handleLike(current.id)}
          />
          <ActionBtn
            icon={<MessageCircle className="h-7 w-7 text-white" />}
            label={
              current
                ? formatNumber(Math.max(0, current.comments_count))
                : "0"
            }
            onClick={() => current && openComments(current.id)}
          />
          <ActionBtn
            icon={
              <Bookmark
                className={cn(
                  "h-6 w-6",
                  current && savedMap[current.id]
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-white"
                )}
              />
            }
            label={current && savedMap[current.id] ? "Saved" : "Save"}
            onClick={() => current && handleSave(current.id)}
          />
          <ActionBtn
            icon={<Share2 className="h-6 w-6 text-white" />}
            label="Share"
            onClick={() => current && handleShare(current)}
          />

          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 disabled:opacity-30"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(currentIndex + 1)}
              disabled={currentIndex >= posts.length - 1}
              className="rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 disabled:opacity-30"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
          <p className="text-[10px] text-muted text-center max-w-[80px]">
            Scroll or swipe for next
          </p>
        </div>
      </div>
      )}

      <CommentsSheet
        postId={commentsPostId || current?.id || ""}
        open={commentsOpen && !!commentsPostId}
        onClose={() => {
          setCommentsOpen(false);
          setCommentsPostId(null);
        }}
        onCountChange={() => {
          /* count updates on next feed refresh */
        }}
      />
    </div>
  );
}

function Avatar({
  name,
  url,
  size = 40,
}: {
  name: string;
  url?: string | null;
  size?: number;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover border-2 border-white"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full border-2 border-white bg-zinc-700 flex items-center justify-center font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
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
      type="button"
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
