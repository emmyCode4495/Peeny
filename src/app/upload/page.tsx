"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Upload, Film, Tag, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
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

  const onThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setThumbFile(f);
    setThumbPreview(URL.createObjectURL(f));
  };

  const onVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setVideoFile(f);
    // Auto-generate a simple preview from video if no thumb
    if (!thumbPreview) {
      const url = URL.createObjectURL(f);
      // For MVP we still need a thumbnail image – user should pick one
      // or we could extract a frame later
    }
  };

  async function getSignedUrl(type: "video" | "thumbnail", file: File) {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        filename: file.name,
        contentType: file.type,
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
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) throw new Error("Upload to storage failed");
  }

  const handlePublish = async () => {
    if (!title.trim() || !videoFile) {
      setError("Title and video are required");
      return;
    }
    // Thumbnail: use provided or a placeholder
    setUploading(true);
    setError(null);

    try {
      setProgress("Uploading video…");
      const videoSigned = await getSignedUrl("video", videoFile);
      await uploadToSignedUrl(videoSigned.signed_url, videoFile);

      let thumbnailUrl = videoSigned.public_url; // fallback
      if (thumbFile) {
        setProgress("Uploading thumbnail…");
        const thumbSigned = await getSignedUrl("thumbnail", thumbFile);
        await uploadToSignedUrl(thumbSigned.signed_url, thumbFile);
        thumbnailUrl = thumbSigned.public_url;
      } else if (thumbPreview) {
        thumbnailUrl = thumbPreview;
      }

      setProgress("Publishing…");
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          video_url: videoSigned.public_url,
          thumbnail_url: thumbnailUrl,
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
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Share your AI video and start earning
        </p>
      </header>

      {/* Video picker */}
      <div
        onClick={() => videoRef.current?.click()}
        className="mb-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card py-10 cursor-pointer hover:border-primary/50 transition-colors"
      >
        <div className="rounded-full bg-zinc-800 p-4 mb-3">
          <Film className="h-8 w-8 text-muted" />
        </div>
        <p className="text-sm font-medium">
          {videoFile ? videoFile.name : "Choose video"}
        </p>
        <p className="text-xs text-muted mt-1">MP4, WebM · max ~500MB</p>
        <input
          ref={videoRef}
          type="file"
          accept="video/mp4,video/webm"
          className="hidden"
          onChange={onVideoChange}
        />
      </div>

      {/* Thumbnail */}
      <div className="mb-4">
        <label className="text-xs font-medium text-muted mb-1.5 block">
          Thumbnail (recommended)
        </label>
        <div className="flex items-center gap-3">
          {thumbPreview ? (
            <img
              src={thumbPreview}
              alt="Thumb"
              className="h-20 w-14 rounded-lg object-cover"
            />
          ) : (
            <div className="h-20 w-14 rounded-lg bg-zinc-800" />
          )}
          <button
            type="button"
            onClick={() => thumbRef.current?.click()}
            className="rounded-full border border-border px-4 py-2 text-xs font-medium"
          >
            Choose image
          </button>
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
        <label className="text-xs font-medium text-muted mb-1.5 block">
          Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your video a catchy title"
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="text-xs font-medium text-muted mb-1.5 block">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell viewers what this is about…"
          className="w-full min-h-[80px] rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      {/* Category */}
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
                  : "bg-card border border-border text-muted"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* AI toggle */}
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
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
        disabled={uploading || !title.trim() || !videoFile}
        className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2"
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
    </div>
  );
}
