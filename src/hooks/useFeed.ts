"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Post } from "@/types/database";
import { useRealtimeFeed } from "./useRealtimeFeed";

export function useFeed(category?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const fetching = useRef(false);
  /** Prevent double-tap / double-click from like + unlike in one gesture */
  const likeInFlight = useRef<Set<string>>(new Set());
  /** Source of truth for liked state during rapid taps */
  const likedRef = useRef<Map<string, boolean>>(new Map());

  const load = useCallback(
    async (cursor?: string | null, replace = false) => {
      if (fetching.current) return;
      fetching.current = true;
      if (replace) {
        setLoading(true);
        setError(null);
      }

      try {
        const params = new URLSearchParams();
        if (cursor) params.set("cursor", cursor);
        if (category && category !== "all") params.set("category", category);

        const res = await fetch(`/api/posts?${params}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Failed to load feed (${res.status})`);
        }

        const data = await res.json();
        const items: Post[] = data.posts ?? [];

        items.forEach((p) => {
          likedRef.current.set(p.id, !!p.liked_by_me);
        });

        setPosts((prev) => (replace || !cursor ? items : [...prev, ...items]));
        setNextCursor(data.next_cursor ?? null);
        setError(null);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load feed";
        setError(message);
        if (!cursor) {
          setPosts([]);
          setNextCursor(null);
        }
      } finally {
        setLoading(false);
        fetching.current = false;
      }
    },
    [category]
  );

  useEffect(() => {
    load(null, true);
  }, [load]);

  useRealtimeFeed(
    useCallback((post: Post) => {
      setPosts((prev) => {
        if (prev.some((p) => p.id === post.id)) return prev;
        likedRef.current.set(post.id, !!post.liked_by_me);
        return [post, ...prev];
      });
    }, []),
    useCallback((postId: string, likesCount: number) => {
      // Only update count — never flip liked_by_me from realtime
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likes_count: Math.max(0, likesCount) }
            : p
        )
      );
    }, [])
  );

  const loadMore = () => {
    if (nextCursor) load(nextCursor);
  };

  const toggleLike = useCallback(async (postId: string) => {
    if (likeInFlight.current.has(postId)) return;
    likeInFlight.current.add(postId);

    const wasLiked = likedRef.current.get(postId) ?? false;
    const nextLiked = !wasLiked;
    likedRef.current.set(postId, nextLiked);

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const delta = nextLiked ? 1 : -1;
        return {
          ...p,
          liked_by_me: nextLiked,
          likes_count: Math.max(0, Number(p.likes_count || 0) + delta),
        };
      })
    );

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: nextLiked ? "POST" : "DELETE",
      });
      if (!res.ok) throw new Error("Like failed");
    } catch {
      // Revert
      likedRef.current.set(postId, wasLiked);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const delta = wasLiked ? 1 : -1;
          // undo: we had applied nextLiked delta, reverse it
          return {
            ...p,
            liked_by_me: wasLiked,
            likes_count: Math.max(
              0,
              Number(p.likes_count || 0) + (nextLiked ? -1 : 1)
            ),
          };
        })
      );
    } finally {
      likeInFlight.current.delete(postId);
    }
  }, []);

  return {
    posts,
    loading,
    error,
    nextCursor,
    loadMore,
    toggleLike,
    refresh: () => load(null, true),
  };
}
