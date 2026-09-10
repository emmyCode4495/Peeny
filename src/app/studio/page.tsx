"use client";

import { useState } from "react";
import { Sparkles, Film, Mic, Image as ImageIcon, Wand2, ChevronRight } from "lucide-react";
import { cn, formatNaira } from "@/lib/utils";
import { creditPacks } from "@/lib/mock-data";

const modes = [
  {
    id: "text2video",
    title: "Text to Video",
    description: "Describe a scene and generate a short AI video",
    icon: Wand2,
    credits: 8,
  },
  {
    id: "image2video",
    title: "Image to Video",
    description: "Animate a still image into motion",
    icon: ImageIcon,
    credits: 10,
  },
  {
    id: "narrative",
    title: "Full Narrative Scene",
    description: "Multi-scene story with characters & narration",
    icon: Film,
    credits: 35,
  },
  {
    id: "voiceover",
    title: "Voice & Lip Sync",
    description: "Add realistic voiceover or lip-sync to your video",
    icon: Mic,
    credits: 12,
  },
];

export default function StudioPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedMode, setSelectedMode] = useState("text2video");
  const credits = 42; // mock

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-8">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Genny Studio
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Create AI videos & full narrative scenes
            </p>
          </div>
          <div className="rounded-full bg-card border border-border px-3 py-1.5 text-sm font-medium">
            <span className="text-primary">{credits}</span> credits
          </div>
        </div>
      </header>

      {/* Mode selector */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-muted mb-3">Choose mode</h2>
        <div className="grid grid-cols-1 gap-2.5">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const active = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all",
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:bg-card-hover"
                )}
              >
                <div
                  className={cn(
                    "rounded-xl p-2.5",
                    active ? "bg-primary/20 text-primary" : "bg-zinc-800 text-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{mode.title}</span>
                    <span className="text-xs text-muted">{mode.credits} cr</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">
                    {mode.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Prompt */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-muted mb-2">Prompt</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A young woman in Lagos traffic turns into an anime character as danfo buses fly past under neon lights..."
          className="w-full min-h-[120px] rounded-2xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </section>

      {/* Generate button */}
      <button
        disabled={!prompt.trim()}
        className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Generate · {modes.find((m) => m.id === selectedMode)?.credits} credits
      </button>

      {/* Credit packs teaser */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Need more credits?</h2>
          <button className="text-xs text-primary flex items-center gap-0.5">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {creditPacks.slice(0, 2).map((pack) => (
            <div
              key={pack.id}
              className={cn(
                "rounded-2xl border p-3.5",
                pack.popular
                  ? "border-primary/60 bg-primary/5"
                  : "border-border bg-card"
              )}
            >
              <div className="text-lg font-bold">{pack.credits}</div>
              <div className="text-xs text-muted">credits</div>
              <div className="mt-2 text-sm font-semibold text-primary">
                {formatNaira(pack.priceNgn)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
