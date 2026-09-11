"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Upload, Film, Tag, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  extractVideoThumbnail,
  compressThumbnailFile,
  formatBytes,
} from "@/lib/media";
import Link from "next/link";
import type { PostCategory } from "@/types/database";

const categories: PostCategory[] = [
  "shorts",
  "animation",
  "narrative",
  "music",
  "educational",
  "comedy",
  "cultural",
];

export default function UploadPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const videoRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<PostCategory>("shorts");
  const [isAI, setIsAI] = useState(true);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [thumbSize, setThumbSize] = useState<string | null>(null);
  const [preparingThumb, setPreparingThumb] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!authLoading && !user) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-white font-semibold">Log in to upload</p>
        <Link
          href="/login"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white"
        >
          Log in
        </Link>
      </div>
    );
  }

  const onVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setVideoFile(f);
    setError(null);
    setPreparingThumb(true);
    try {
      // Auto-generate small thumbnail from video frame
      const { blob, previewUrl } = await extractVideoThumbnail(f);
      if (thumbPreview) URL.revokeObjectURL(thumbPreview);
      setThumbPreview(previewUrl);
      const file = new File([blob], "thumbnail.jpg", { type: "image/jpeg" });
      setThumbFile(file);
      setThumbSize(formatBytes(blob.size));
    } catch (err) {
      console.warn("Auto thumbnail failed", err);
      setError(
        "Could not auto-generate thumbnail. Please pick an image manually."
      );
    } finally {
      setPreparingThumb(false);
    }
  };

  const onThumbChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPreparingThumb(true);
    setError(null);
    try {
      const compressed = await compressThumbnailFile(f);
      if (thumbPreview) URL.revokeObjectURL(thumbPreview);
      setThumbFile(compressed);
      setThumbPreview(URL.createObjectURL(compressed));
      setThumbSize(formatBytes(compressed.size));
    } catch {
      setError("Failed to compress thumbnail");
    } finally {
      setPreparingThumb(false);
    }
  };

  async function getSignedUrl(type: "video" | "thumbnail", file: File) {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        filename: file.name,
        contentType: file.type || (type === "video" ? "video/mp4" : "image/jpeg"),
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to get upload URL");
    }
    return res.json() as Promise<{
      signed_url: string;
      public_url: string;
      path: string;
    }>;
  }

  async function uploadToSignedUrl(signedUrl: string, file: File) {
    const res = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!res.ok) throw new Error("Upload to storage failed");
  }

  const handlePublish = async () => {
    if (!title.trim() || !videoFile) {
      setError("Title and video are required");
      return;
    }
    if (!thumbFile) {
      setError("Thumbnail is required (auto-generated or pick one)");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      setProgress("Uploading video…");
      const videoSigned = await getSignedUrl("video", videoFile);
      await uploadToSignedUrl(videoSigned.signed_url, videoFile);

      setProgress("Uploading thumbnail…");
      const thumbSigned = await getSignedUrl("thumbnail", thumbFile);
      await uploadToSignedUrl(thumbSigned.signed_url, thumbFile);

      setProgress("Publishing…");
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          video_url: videoSigned.public_url,
          thumbnail_url: thumbSigned.public_url,
          category,
          is_ai_generated: isAI,
          duration_seconds: 0,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to publish");
      }

      setProgress("Done!");
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress("");
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-28">
      <header className="mb-6">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Share your AI video and start earning
        </p>
      </header>

      {/* Video picker */}
      <div
        onClick={() => !preparingThumb && videoRef.current?.click()}
        className="mb-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/[0.08] bg-surface py-10 cursor-pointer hover:border-primary/50 transition-colors"
      >
        <div className="rounded-full bg-zinc-800 p-4 mb-3">
          {preparingThumb ? (
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          ) : (
            <Film className="h-8 w-8 text-muted" />
          )}
        </div>
        <p className="text-sm font-medium">
          {preparingThumb
            ? "Generating thumbnail…"
            : videoFile
              ? videoFile.name
              : "Choose video"}
        </p>
        <p className="text-xs text-muted mt-1">MP4, WebM · thumbnail auto-created</p>
        <input
          ref={videoRef}
          type="file"
          accept="video/mp4,video/webm,video/*"
          className="hidden"
          onChange={onVideoChange}
        />
      </div>

      {/* Thumbnail preview (static, compressed) */}
      <div className="mb-4">
        <label className="text-xs font-medium text-muted mb-1.5 block">
          Thumbnail (auto from video · compressed)
        </label>
        <div className="flex items-center gap-3">
          {thumbPreview ? (
            <img
              src={thumbPreview}
              alt="Thumb"
              className="h-24 w-14 rounded-lg object-cover bg-zinc-900"
            />
          ) : (
            <div className="h-24 w-14 rounded-lg bg-zinc-800" />
          )}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => thumbRef.current?.click()}
              disabled={preparingThumb}
              className="rounded-full border border-white/[0.08] px-4 py-2 text-xs font-medium disabled:opacity-50"
            >
              Replace image
            </button>
            {thumbSize && (
              <span className="text-[11px] text-muted">{thumbSize}</span>
            )}
          </div>
          <input
            ref={thumbRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onThumbChange}
          />
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="text-xs font-medium text-muted mb-1.5 block">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your video a catchy title"
          className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="mb-4">
        <label className="text-xs font-medium text-muted mb-1.5 block">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell viewers what this is about…"
          className="w-full min-h-[80px] rounded-xl border border-white/[0.08] bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      <div className="mb-6">
        <label className="text-xs font-medium text-muted mb-2 flex items-center gap-1">
          <Tag className="h-3.5 w-3.5" /> Category
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                category === cat
                  ? "bg-primary text-white"
                  : "bg-surface border border-white/[0.08] text-muted"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/[0.08] bg-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI Generated</span>
        </div>
        <button
          type="button"
          onClick={() => setIsAI((v) => !v)}
          className={cn(
            "h-6 w-11 rounded-full relative transition-colors",
            isAI ? "bg-primary" : "bg-zinc-700"
          )}
        >
          <div
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
              isAI ? "right-0.5" : "left-0.5"
            )}
          />
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handlePublish}
        disabled={uploading || preparingThumb || !title.trim() || !videoFile || !thumbFile}
        className="w-full rounded-full bg-primary py-3.5 shadow-lg shadow-primary/25 text-sm font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {progress || "Uploading…"}
          </>
        ) : (
          "Publish & Start Earning"
        )}
      </button>

      <p className="mt-3 text-center text-[11px] text-muted">
        Feed shows a static image only — no autoplay, no sound.
      </p>
    </div>
  );
}
