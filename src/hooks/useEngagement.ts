"use client";

import { useCallback, useRef } from "react";

/** Stable guest session id for view dedupe (later) */
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("peeny_sid");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("peeny_sid", id);
  }
  return id;
}

/**
 * TikTok-style view:
 * Call recordView only after the video has been the active slide
 * AND has played for at least minWatchMs (default 2000).
 * Logged-in users: counted once per post forever.
 */
export function useEngagement() {
  const viewedThisSession = useRef<Set<string>>(new Set());

  const recordView = useCallback(async (postId: string) => {
    if (viewedThisSession.current.has(postId)) return;
    viewedThisSession.current.add(postId);

    try {
      await fetch(`/api/posts/${postId}/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: getSessionId() }),
      });
    } catch {
      // allow retry next time
      viewedThisSession.current.delete(postId);
    }
  }, []);

  const toggleSave = useCallback(
    async (postId: string, currentlySaved: boolean) => {
      const res = await fetch(`/api/posts/${postId}/save`, {
        method: currentlySaved ? "DELETE" : "POST",
      });
      if (res.status === 401) throw new Error("login_required");
      if (!res.ok) throw new Error("save_failed");
      return !currentlySaved;
    },
    []
  );

  const recordShare = useCallback(async (postId: string, title?: string) => {
    const res = await fetch(`/api/posts/${postId}/share`, { method: "POST" });
    const data = await res.json().catch(() => ({}));

    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/?v=${postId}`
        : data.share_url;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: title || "Peeny",
          url,
        });
      } catch {
        /* user cancelled */
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }

    return data.shares_count as number | undefined;
  }, []);

  return { recordView, toggleSave, recordShare };
}
