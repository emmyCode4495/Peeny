"use client";

import { useEffect } from "react";
import type { Post } from "@/types/database";

/**
 * Subscribe to new posts and like-count changes in realtime.
 * Safely no-ops if Supabase env is missing.
 */
export function useRealtimeFeed(
  onNewPost: (post: Post) => void,
  onLikeChange?: (postId: string, likesCount: number) => void
) {
  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return;
    }

    let channel: { unsubscribe: () => void } | null = null;

    (async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const ch = supabase
          .channel("feed-realtime")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "posts" },
            async (payload) => {
              const { data } = await supabase
                .from("posts")
                .select(
                  `
                  *,
                  profile:profiles!posts_user_id_fkey (
                    id, username, display_name, avatar_url, is_verified, tier
                  )
                `
                )
                .eq("id", payload.new.id)
                .single();
              if (data) onNewPost(data as Post);
            }
          )
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "posts" },
            (payload) => {
              if (onLikeChange && payload.new?.id) {
                onLikeChange(payload.new.id, payload.new.likes_count);
              }
            }
          )
          .subscribe();

        channel = ch;
      } catch {
        // Supabase not available
      }
    })();

    return () => {
      channel?.unsubscribe();
    };
  }, [onNewPost, onLikeChange]);
}
