"use client";

import { mockCreators, mockVideos } from "@/lib/mock-data";
import { formatNumber, formatNaira } from "@/lib/utils";
import { BadgeCheck, Settings, Share2, Grid3X3 } from "lucide-react";

export default function ProfilePage() {
  const user = mockCreators[0]; // mock logged-in user
  const userVideos = mockVideos.filter((v) => v.creator.id === user.id);

  return (
    <div className="mx-auto max-w-lg">
      {/* Cover + avatar */}
      <div className="relative h-28 bg-gradient-to-br from-primary/40 via-purple-600/30 to-accent/20">
        <div className="absolute -bottom-10 left-4">
          <div className="h-20 w-20 rounded-full border-4 border-background bg-zinc-800 flex items-center justify-center text-2xl font-bold">
            {user.displayName.charAt(0)}
          </div>
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          <button className="rounded-full bg-black/40 p-2 backdrop-blur-sm">
            <Share2 className="h-4 w-4" />
          </button>
          <button className="rounded-full bg-black/40 p-2 backdrop-blur-sm">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-12">
        {/* Name + verified */}
        <div className="flex items-center gap-1.5">
          <h1 className="text-lg font-bold">{user.displayName}</h1>
          {user.isVerified && (
            <BadgeCheck className="h-5 w-5 text-accent" />
          )}
        </div>
        <p className="text-sm text-muted">@{user.username}</p>
        {user.bio && (
          <p className="mt-2 text-sm text-muted leading-relaxed">{user.bio}</p>
        )}

        {/* Stats */}
        <div className="mt-4 flex gap-6">
          <div>
            <p className="font-bold">{formatNumber(user.followers)}</p>
            <p className="text-xs text-muted">Followers</p>
          </div>
          <div>
            <p className="font-bold">{userVideos.length}</p>
            <p className="text-xs text-muted">Videos</p>
          </div>
          <div>
            <p className="font-bold text-success">
              {formatNaira(
                userVideos.reduce((sum, v) => sum + v.earnings, 0)
              )}
            </p>
            <p className="text-xs text-muted">Earned</p>
          </div>
        </div>

        {/* Tier badge */}
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary capitalize">
          {user.tier} Creator
        </div>

        {/* Videos grid */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Grid3X3 className="h-4 w-4 text-muted" />
            <h2 className="text-sm font-semibold">Series & Videos</h2>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {userVideos.map((video) => (
              <div
                key={video.id}
                className="relative aspect-[9/14] overflow-hidden rounded-lg bg-zinc-900"
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-1 left-1 right-1">
                  <p className="text-[10px] font-medium text-white line-clamp-1 drop-shadow">
                    {formatNumber(video.views)} views
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
