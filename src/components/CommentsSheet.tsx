"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  X,
  Heart,
  Send,
  Loader2,
  BadgeCheck,
} from "lucide-react";
import { cn, formatNumber, timeAgo } from "@/lib/utils";
import Link from "next/link";

export interface CommentItem {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  parent_id?: string | null;
  likes_count: number;
  liked_by_me?: boolean;
  profile?: {
    username?: string;
    display_name?: string;
    avatar_url?: string | null;
    is_verified?: boolean;
  };
  replies?: CommentItem[];
}

interface CommentsSheetProps {
  postId: string;
  open: boolean;
  onClose: () => void;
  onCountChange?: (delta: number) => void;
}

function Avatar({
  name,
  url,
  size = 36,
}: {
  name: string;
  url?: string | null;
  size?: number;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-surface-elevated flex items-center justify-center font-bold text-foreground shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

function CommentRow({
  comment,
  isReply,
  onReply,
  onToggleLike,
}: {
  comment: CommentItem;
  isReply?: boolean;
  onReply: (c: CommentItem) => void;
  onToggleLike: (c: CommentItem) => void;
}) {
  const name = comment.profile?.display_name || comment.profile?.username || "User";
  const username = comment.profile?.username || "user";

  return (
    <div className={cn("flex gap-3", isReply && "ml-11 mt-3")}>
      <Link href={`/profile?u=${username}`} className="shrink-0">
        <Avatar name={name} url={comment.profile?.avatar_url} size={isReply ? 28 : 36} />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Link
            href={`/profile?u=${username}`}
            className="text-[13px] font-semibold text-foreground hover:underline truncate"
          >
            {name}
          </Link>
          {comment.profile?.is_verified && (
            <BadgeCheck className="h-3.5 w-3.5 text-mint shrink-0" />
          )}
          <span className="text-[11px] text-muted shrink-0">
            {timeAgo(comment.created_at)}
          </span>
        </div>
        <p className="text-[13px] text-foreground/90 leading-relaxed mt-0.5 whitespace-pre-wrap break-words">
          {comment.body}
        </p>
        <div className="flex items-center gap-4 mt-1.5">
          {!isReply && (
            <button
              type="button"
              onClick={() => onReply(comment)}
              className="text-[12px] font-semibold text-muted hover:text-foreground"
            >
              Reply
            </button>
          )}
          <button
            type="button"
            onClick={() => onToggleLike(comment)}
            className="flex items-center gap-1 text-[12px] text-muted hover:text-foreground"
          >
            <Heart
              className={cn(
                "h-3.5 w-3.5",
                comment.liked_by_me && "fill-primary text-primary"
              )}
            />
            {comment.likes_count > 0 && (
              <span className={cn(comment.liked_by_me && "text-primary")}>
                {formatNumber(comment.likes_count)}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CommentsSheet({
  postId,
  open,
  onClose,
  onCountChange,
}: CommentsSheetProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<CommentItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (!res.ok) throw new Error("Failed to load comments");
      const data = await res.json();
      setComments(data.comments ?? []);
    } catch {
      setError("Couldn’t load comments");
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (open) {
      load();
      setText("");
      setReplyTo(null);
      setSending(false);
    }
  }, [open, load]);

  useEffect(() => {
    if (replyTo) inputRef.current?.focus();
  }, [replyTo]);

  const submit = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: text.trim(),
          parent_id: replyTo?.id ?? null,
        }),
      });
      if (res.status === 401) {
        setError("Log in to comment");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to send");
      }
      const data = await res.json();
      const created = data.comment as CommentItem;

      if (replyTo) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyTo.id
              ? {
                  ...c,
                  replies: [...(c.replies || []), { ...created, replies: undefined }],
                }
              : c
          )
        );
      } else {
        setComments((prev) => [{ ...created, replies: [] }, ...prev]);
      }
      onCountChange?.(1);
      setText("");
      setReplyTo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const toggleLike = async (c: CommentItem) => {
    const was = !!c.liked_by_me;
    const apply = (list: CommentItem[]): CommentItem[] =>
      list.map((item) => {
        if (item.id === c.id) {
          return {
            ...item,
            liked_by_me: !was,
            likes_count: Math.max(0, item.likes_count + (was ? -1 : 1)),
          };
        }
        if (item.replies?.length) {
          return { ...item, replies: apply(item.replies) };
        }
        return item;
      });

    setComments((prev) => apply(prev));

    try {
      const res = await fetch(`/api/comments/${c.id}/like`, {
        method: was ? "DELETE" : "POST",
      });
      if (res.status === 401) {
        setComments((prev) => apply(prev)); // revert by toggling again conceptually
        // proper revert:
        setComments((prev) =>
          prev.map((item) => {
            const fix = (x: CommentItem): CommentItem => {
              if (x.id === c.id) {
                return {
                  ...x,
                  liked_by_me: was,
                  likes_count: Math.max(0, x.likes_count + (was ? 1 : -1)),
                };
              }
              return {
                ...x,
                replies: x.replies?.map(fix),
              };
            };
            return fix(item);
          })
        );
        setError("Log in to like comments");
      }
    } catch {
      /* optimistic kept */
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label="Close comments"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-lg max-h-[78vh] sm:max-h-[70vh] flex flex-col rounded-t-2xl sm:rounded-2xl glass-strong shadow-2xl overflow-hidden"
        role="dialog"
        aria-label="Comments"
      >
        {/* Header */}
        <div className="flex items-center justify-center relative px-4 py-3.5 border-b border-white/[0.08]">
          <h3 className="font-display font-semibold text-[15px] text-foreground">
            Comments
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 hover:bg-white/10"
          >
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        {/* List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-5 min-h-[180px]"
        >
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm font-medium text-foreground">No comments yet</p>
              <p className="text-xs text-muted mt-1">Start the conversation</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id}>
                <CommentRow
                  comment={c}
                  onReply={setReplyTo}
                  onToggleLike={toggleLike}
                />
                {c.replies?.map((r) => (
                  <CommentRow
                    key={r.id}
                    comment={r}
                    isReply
                    onReply={setReplyTo}
                    onToggleLike={toggleLike}
                  />
                ))}
              </div>
            ))
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-white/[0.08] px-3 pt-2 pb-3 safe-bottom bg-surface/80">
          {replyTo && (
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs text-muted truncate">
                Replying to{" "}
                <span className="text-foreground font-semibold">
                  @{replyTo.profile?.username || "user"}
                </span>
              </p>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-xs text-primary font-semibold"
              >
                Cancel
              </button>
            </div>
          )}
          {error && (
            <p className="text-xs text-danger mb-2 px-1">{error}</p>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={sending}
              placeholder={
                replyTo ? "Write a reply…" : "Add a comment…"
              }
              className="flex-1 rounded-full bg-background border border-white/[0.1] px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-60"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              maxLength={2000}
            />
            <button
              type="button"
              onClick={submit}
              disabled={sending || !text.trim()}
              className={cn(
                "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold flex items-center gap-1.5 transition-all",
                sending || !text.trim()
                  ? "bg-white/10 text-muted cursor-not-allowed"
                  : "bg-primary text-white shadow-lg shadow-primary/25"
              )}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
