"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatNumber, formatNaira } from "@/lib/utils";
import {
  BadgeCheck,
  Settings,
  Share2,
  Grid3X3,
  Loader2,
  Camera,
  LogOut,
} from "lucide-react";
import type { Profile, Post } from "@/types/database";
import Link from "next/link";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const usernameParam = searchParams.get("u");
  const { user, profile: myProfile, loading: authLoading, signOut, refreshProfile } =
    useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwn, setIsOwn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (usernameParam) {
          const res = await fetch(`/api/profile/${usernameParam}`);
          if (res.ok) {
            const data = await res.json();
            setProfile(data.profile);
            setPosts(data.posts ?? []);
            setIsFollowing(data.is_following);
            setIsOwn(data.is_own);
          } else {
            setProfile(null);
          }
        } else if (myProfile) {
          // Own profile
          setProfile(myProfile);
          setIsOwn(true);
          const res = await fetch(
            `/api/posts?user_id=${myProfile.id}`
          );
          if (res.ok) {
            const data = await res.json();
            setPosts(data.posts ?? []);
          }
        } else if (!authLoading && !user) {
          router.push("/login");
          return;
        }
      } catch {
        // keep empty
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) load();
  }, [usernameParam, myProfile, user, authLoading, router]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isOwn) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        await refreshProfile();
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile || isOwn) return;
    const method = isFollowing ? "DELETE" : "POST";
    setIsFollowing(!isFollowing);
    setProfile((p) =>
      p
        ? {
            ...p,
            followers_count: p.followers_count + (isFollowing ? -1 : 1),
          }
        : p
    );
    await fetch(`/api/profile/follow/${profile.id}`, { method });
  };

  if (loading || authLoading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-white font-semibold">Profile not found</p>
        <Link href="/" className="text-sm text-primary">
          Back to Feed
        </Link>
      </div>
    );
  }

  const totalEarned = posts.reduce(
    (sum, p) => sum + Number(p.earnings_ngn || 0),
    0
  );

  return (
    <div className="mx-auto max-w-lg pb-24">
      {/* Cover */}
      <div className="relative h-28 bg-gradient-to-br from-primary/40 via-purple-600/30 to-accent/20">
        <div className="absolute -bottom-10 left-4">
          <div className="relative">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="h-20 w-20 rounded-full border-4 border-background object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-full border-4 border-background bg-zinc-800 flex items-center justify-center text-2xl font-bold">
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
            )}
            {isOwn && (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5 shadow-lg"
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                ) : (
                  <Camera className="h-3.5 w-3.5 text-white" />
                )}
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          <button className="rounded-full bg-black/40 p-2 backdrop-blur-sm">
            <Share2 className="h-4 w-4 text-white" />
          </button>
          {isOwn && (
            <>
              <button className="rounded-full bg-black/40 p-2 backdrop-blur-sm">
                <Settings className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={() => signOut()}
                className="rounded-full bg-black/40 p-2 backdrop-blur-sm"
                title="Sign out"
              >
                <LogOut className="h-4 w-4 text-white" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="px-4 pt-12">
        <div className="flex items-center gap-1.5">
          <h1 className="text-lg font-bold">{profile.display_name}</h1>
          {profile.is_verified && (
            <BadgeCheck className="h-5 w-5 text-accent" />
          )}
        </div>
        <p className="text-sm text-muted">@{profile.username}</p>
        {profile.bio && (
          <p className="mt-2 text-sm text-muted leading-relaxed">{profile.bio}</p>
        )}

        <div className="mt-4 flex gap-6">
          <div>
            <p className="font-bold">{formatNumber(profile.followers_count)}</p>
            <p className="text-xs text-muted">Followers</p>
          </div>
          <div>
            <p className="font-bold">{formatNumber(profile.following_count)}</p>
            <p className="text-xs text-muted">Following</p>
          </div>
          <div>
            <p className="font-bold">{posts.length}</p>
            <p className="text-xs text-muted">Videos</p>
          </div>
          <div>
            <p className="font-bold text-success">{formatNaira(totalEarned)}</p>
            <p className="text-xs text-muted">Earned</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary capitalize">
            {profile.tier} Creator
          </span>
          {!isOwn && user && (
            <button
              onClick={handleFollow}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                isFollowing
                  ? "border border-white/20 text-white"
                  : "bg-primary text-white"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
          {isOwn && (
            <Link
              href="/login"
              className="text-xs text-muted underline"
              onClick={(e) => {
                if (user) e.preventDefault();
              }}
            >
              {user ? "" : "Log in to edit"}
            </Link>
          )}
        </div>

        {/* Videos grid */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Grid3X3 className="h-4 w-4 text-muted" />
            <h2 className="text-sm font-semibold">Series & Videos</h2>
          </div>
          {posts.length === 0 ? (
            <p className="text-sm text-muted py-8 text-center">
              No videos yet.
              {isOwn && (
                <>
                  {" "}
                  <Link href="/upload" className="text-primary">
                    Upload one
                  </Link>
                </>
              )}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="relative aspect-[9/14] overflow-hidden rounded-lg bg-zinc-900"
                >
                  <img
                    src={post.thumbnail_url}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1 right-1">
                    <p className="text-[10px] font-medium text-white line-clamp-1 drop-shadow">
                      {formatNumber(post.views_count)} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
