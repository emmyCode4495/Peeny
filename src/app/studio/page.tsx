"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Sparkles,
  Film,
  Mic,
  Image as ImageIcon,
  Wand2,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn, formatNaira } from "@/lib/utils";
import Link from "next/link";

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

const CREDIT_PACKS = [
  { id: "p1", credits: 50, priceNgn: 2500, label: "Starter" },
  { id: "p2", credits: 150, priceNgn: 6500, label: "Creator", popular: true },
  { id: "p3", credits: 400, priceNgn: 15000, label: "Pro" },
  { id: "p4", credits: 1000, priceNgn: 32000, label: "Studio" },
];

export default function StudioPage() {
  const { user, loading: authLoading } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [selectedMode, setSelectedMode] = useState("text2video");
  const [credits, setCredits] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadCredits = useCallback(async () => {
    if (!user) {
      setCredits(null);
      return;
    }
    setLoadingCredits(true);
    try {
      const res = await fetch("/api/wallet");
      if (res.ok) {
        const data = await res.json();
        setCredits(Number(data.credits ?? 0));
      } else {
        setCredits(0);
      }
    } catch {
      setCredits(0);
    } finally {
      setLoadingCredits(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) loadCredits();
  }, [authLoading, loadCredits]);

  const mode = modes.find((m) => m.id === selectedMode) ?? modes[0];
  const canGenerate =
    !!user && credits !== null && credits >= mode.credits && prompt.trim().length > 0;

  const handleGenerate = () => {
    if (!user) {
      setMessage("Log in to use Genny Studio");
      return;
    }
    if (credits === null || credits < mode.credits) {
      setMessage(
        `You need ${mode.credits} credits. You have ${credits ?? 0}. Buy more from Wallet.`
      );
      return;
    }
    if (!prompt.trim()) {
      setMessage("Enter a prompt first");
      return;
    }
    // AI generation provider not wired yet — show clear state
    setMessage(
      "Generation engine coming next. Credits and modes are live — connect a video model to start generating."
    );
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-28">
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
            {authLoading || loadingCredits ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted inline" />
            ) : user ? (
              <>
                <span className="text-primary">{credits ?? 0}</span>
                <span className="text-muted"> credits</span>
              </>
            ) : (
              <Link href="/login" className="text-primary text-xs font-semibold">
                Log in
              </Link>
            )}
          </div>
        </div>
      </header>

      {!user && !authLoading && (
        <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted">
          <Link href="/login" className="text-primary font-semibold">
            Log in
          </Link>{" "}
          to generate videos and use your credits.
        </div>
      )}

      {/* Mode selector */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-muted mb-3">Choose mode</h2>
        <div className="grid grid-cols-1 gap-2.5">
          {modes.map((m) => {
            const Icon = m.icon;
            const active = selectedMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMode(m.id)}
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
                    active
                      ? "bg-primary/20 text-primary"
                      : "bg-zinc-800 text-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{m.title}</span>
                    <span className="text-xs text-muted">{m.credits} cr</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">
                    {m.description}
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
          placeholder="A young woman in Lagos traffic turns into an anime character as danfo buses fly past under neon lights…"
          className="w-full min-h-[120px] rounded-2xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </section>

      {message && (
        <p className="mb-4 text-sm text-muted bg-card border border-border rounded-xl px-3 py-2">
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!prompt.trim()}
        className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Generate · {mode.credits} credits
        {user && credits !== null && credits < mode.credits && (
          <span className="text-white/70 font-normal">(need more)</span>
        )}
      </button>

      {/* Credit packs → Wallet */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Need more credits?</h2>
          <Link
            href="/wallet"
            className="text-xs text-primary flex items-center gap-0.5"
          >
            Wallet <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {CREDIT_PACKS.slice(0, 2).map((pack) => (
            <Link
              key={pack.id}
              href="/wallet"
              className={cn(
                "rounded-2xl border p-3.5 block",
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
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
