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
    chip: "bg-primary/20 text-primary border-primary/30",
  },
  {
    id: "image2video",
    title: "Image to Video",
    description: "Animate a still image into motion",
    icon: ImageIcon,
    credits: 10,
    chip: "bg-mint/15 text-mint border-mint/30",
  },
  {
    id: "narrative",
    title: "Full Narrative Scene",
    description: "Multi-scene story with characters & narration",
    icon: Film,
    credits: 35,
    chip: "bg-gold/15 text-gold border-gold/30",
  },
  {
    id: "voiceover",
    title: "Voice & Lip Sync",
    description: "Add realistic voiceover or lip-sync to your video",
    icon: Mic,
    credits: 12,
    chip: "bg-purple-500/15 text-purple-300 border-purple-400/30",
  },
];

const CREDIT_PACKS = [
  { id: "p1", credits: 50, priceNgn: 2500, label: "Starter" },
  { id: "p2", credits: 150, priceNgn: 6500, label: "Creator", popular: true },
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
      } else setCredits(0);
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

  const handleGenerate = () => {
    if (!user) {
      setMessage("Log in to use Genny Studio");
      return;
    }
    if (credits === null || credits < mode.credits) {
      setMessage(
        `You need ${mode.credits} credits. You have ${credits ?? 0}.`
      );
      return;
    }
    if (!prompt.trim()) {
      setMessage("Enter a prompt first");
      return;
    }
    setMessage(
      "Generation engine coming next. Credits and modes are live."
    );
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-28 min-h-[100dvh] bg-background">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Creators Studio
            </h1>
            <p className="text-xs text-muted mt-1">
              Create AI videos & narrative scenes
            </p>
          </div>
          <div className="rounded-full glass px-3.5 py-1.5 text-sm font-medium">
            {authLoading || loadingCredits ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted inline" />
            ) : user ? (
              <>
                <span className="text-gold font-display font-bold">
                  {credits ?? 0}
                </span>
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
        <div className="mb-6 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-muted">
          <Link href="/login" className="text-primary font-semibold">
            Log in
          </Link>{" "}
          to generate with your credits.
        </div>
      )}

      <section className="mb-6">
        <h2 className="text-sm font-display font-semibold text-muted mb-3">
          Mode
        </h2>
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
                    ? "border-primary/50 bg-primary/10"
                    : "border-white/[0.08] bg-surface hover:bg-surface-elevated"
                )}
              >
                <div
                  className={cn(
                    "rounded-xl p-2.5 border",
                    active ? m.chip : "bg-surface-elevated text-muted border-transparent"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display font-semibold text-sm">
                      {m.title}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                        m.chip
                      )}
                    >
                      {m.credits} cr
                    </span>
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

      <section className="mb-6">
        <h2 className="text-sm font-display font-semibold text-muted mb-2">
          Prompt
        </h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A young woman in Lagos traffic turns into an anime character…"
          className="w-full min-h-[120px] rounded-2xl border border-white/[0.08] bg-surface px-4 py-3 text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
        />
      </section>

      {message && (
        <p className="mb-4 text-sm text-muted glass rounded-xl px-3 py-2">
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!prompt.trim()}
        className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
      >
        <Sparkles className="h-4 w-4" />
        Generate · {mode.credits} credits
      </button>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-display font-semibold">Need credits?</h2>
          <Link
            href="/wallet"
            className="text-xs text-primary flex items-center gap-0.5 font-semibold"
          >
            Wallet <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {CREDIT_PACKS.map((pack) => (
            <Link
              key={pack.id}
              href="/wallet"
              className={cn(
                "rounded-2xl p-3.5 block glass",
                pack.popular && "ring-1 ring-gold/35"
              )}
            >
              <div className="text-lg font-display font-bold text-gold">
                {pack.credits}
              </div>
              <div className="text-xs text-muted">credits</div>
              <div className="mt-2 text-sm font-semibold text-foreground">
                {formatNaira(pack.priceNgn)}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
