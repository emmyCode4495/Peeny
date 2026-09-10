"use client";

import { Video } from "@/types";
import { formatNumber, formatNaira, timeAgo } from "@/lib/utils";
import { Heart, MessageCircle, Eye, BadgeCheck, Play } from "lucide-react";
import Link from "next/link";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-card border border-border">
      {/* Thumbnail */}
      <div className="relative aspect-[9/14] overflow-hidden bg-zinc-900">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
            <Play className="h-8 w-8 fill-white text-white" />
          </div>
        </div>

        {/* Duration */}
        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
          {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}
        </span>

        {/* AI badge */}
        {video.isAIGenerated && (
          <span className="absolute top-2 left-2 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            AI
          </span>
        )}

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold text-white leading-snug">
            {video.title}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="text-xs text-white/80">
              @{video.creator.username}
            </span>
            {video.creator.isVerified && (
              <BadgeCheck className="h-3.5 w-3.5 text-accent" />
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between px-3 py-2.5 text-xs text-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {formatNumber(video.views)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {formatNumber(video.likes)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {formatNumber(video.comments)}
          </span>
        </div>
        <span className="font-medium text-success">
          {formatNaira(video.earnings)}
        </span>
      </div>
    </article>
  );
}
