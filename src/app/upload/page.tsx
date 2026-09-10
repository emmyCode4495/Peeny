"use client";

import { useState } from "react";
import { Upload, Film, Tag, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  "shorts",
  "animation",
  "narrative",
  "music",
  "educational",
  "comedy",
  "cultural",
];

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("shorts");
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-8">
      <header className="mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Share your AI video or animation and start earning
        </p>
      </header>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        className={cn(
          "mb-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-12 transition-colors",
          dragOver
            ? "border-primary bg-primary/10"
            : "border-border bg-card"
        )}
      >
        <div className="rounded-full bg-zinc-800 p-4 mb-3">
          <Film className="h-8 w-8 text-muted" />
        </div>
        <p className="text-sm font-medium">Drop your video here</p>
        <p className="text-xs text-muted mt-1">MP4, WebM · max 500MB</p>
        <button className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">
          Choose file
        </button>
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
          placeholder="Tell viewers what this video is about..."
          className="w-full min-h-[80px] rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="text-xs font-medium text-muted mb-2 block flex items-center gap-1">
          <Tag className="h-3.5 w-3.5" /> Category
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
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

      {/* AI generated toggle */}
      <div className="mb-8 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI Generated</span>
        </div>
        <div className="h-6 w-11 rounded-full bg-primary relative">
          <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
        </div>
      </div>

      <button
        disabled={!title.trim()}
        className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-40"
      >
        Publish & Start Earning
      </button>
    </div>
  );
}
