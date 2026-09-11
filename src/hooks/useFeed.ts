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

  // Realtime new posts + like counts
  useRealtimeFeed(
    useCallback((post: Post) => {
      setPosts((prev) => {
        if (prev.some((p) => p.id === post.id)) return prev;
        return [post, ...prev];
      });
    }, []),
    useCallback((postId: string, likesCount: number) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likes_count: likesCount } : p
        )
      );
    }, [])
  );

  const loadMore = () => {
    if (nextCursor) load(nextCursor);
  };

  const toggleLike = async (postId: string, currentlyLiked: boolean) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const delta = currentlyLiked ? -1 : 1;
        return {
          ...p,
          liked_by_me: !currentlyLiked,
          likes_count: Math.max(0, Number(p.likes_count || 0) + delta),
        };
      })
    );

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: currentlyLiked ? "DELETE" : "POST",
      });
      if (!res.ok) throw new Error("Like failed");
    } catch {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const delta = currentlyLiked ? 1 : -1;
          return {
            ...p,
            liked_by_me: currentlyLiked,
            likes_count: Math.max(0, Number(p.likes_count || 0) + delta),
          };
        })
      );
    }
  };

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
