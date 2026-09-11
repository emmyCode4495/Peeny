"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatNaira, formatNumber, cn } from "@/lib/utils";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  BadgeCheck,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface WalletData {
  credits: number;
  balance_ngn: number;
  total_earned: number;
  total_views: number;
  posts_count: number;
  wallet_address: string | null;
  tier: string;
  is_verified: boolean;
}

const CREDIT_PACKS = [
  { id: "p1", credits: 50, priceNgn: 2500, label: "Starter", priceUsdc: 1.5 },
  { id: "p2", credits: 150, priceNgn: 6500, label: "Creator", popular: true, priceUsdc: 4 },
  { id: "p3", credits: 400, priceNgn: 15000, label: "Pro", priceUsdc: 9 },
  { id: "p4", credits: 1000, priceNgn: 32000, label: "Studio", priceUsdc: 19 },
];

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wallet");
      if (res.status === 401) {
        setData(null);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to load wallet");
      }
      setData(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load wallet");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (user) load();
      else {
        setLoading(false);
        setData(null);
      }
    }
  }, [user, authLoading, load]);

  if (authLoading || loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center bg-background">
        <div className="h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center">
          <Wallet className="h-7 w-7 text-primary" />
        </div>
        <p className="font-display font-semibold text-lg text-foreground">
          Log in to view your wallet
        </p>
        <Link
          href="/login"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25"
        >
          Log in
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-display font-semibold text-foreground">
          Couldn&apos;t load wallet
        </p>
        <p className="text-sm text-muted max-w-xs">{error}</p>
        <button
          onClick={load}
          className="mt-2 rounded-full border border-white/15 px-5 py-2 text-sm font-semibold"
        >
          Try again
        </button>
      </div>
    );
  }

  const credits = data?.credits ?? 0;
  const balanceNgn = data?.balance_ngn ?? 0;
  const totalEarned = data?.total_earned ?? 0;
  const totalViews = data?.total_views ?? 0;
  const postsCount = data?.posts_count ?? 0;
  const walletAddress = data?.wallet_address;
  const usdcApprox = balanceNgn > 0 ? (balanceNgn / 1600).toFixed(2) : "0.00";

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-28 bg-background min-h-[100dvh]">
      <header className="mb-6">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2 text-foreground">
          <Wallet className="h-6 w-6 text-primary" />
          Wallet
        </h1>
        <p className="text-xs text-muted mt-1">Earnings · Credits · Solana</p>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="mesh-card-gold rounded-2xl p-4">
          <p className="text-xs text-muted mb-1">Available</p>
          <p className="text-xl font-display font-bold text-gold">
            {formatNaira(balanceNgn)}
          </p>
          <p className="text-[11px] text-muted mt-1">≈ ${usdcApprox} USDC</p>
        </div>
        <div className="mesh-card rounded-2xl p-4">
          <p className="text-xs text-muted mb-1">Credits</p>
          <p className="text-xl font-display font-bold text-gold">{credits}</p>
          <p className="text-[11px] text-muted mt-1">Genny Studio</p>
        </div>
      </div>

      <div className="mesh-card rounded-2xl p-5 mb-6">
        <p className="text-xs text-muted mb-1">Total earned</p>
        <p className="text-3xl font-display font-bold text-foreground">
          {formatNaira(totalEarned)}
        </p>
        <p className="text-xs text-muted mt-2">
          {formatNumber(totalViews)} views · {postsCount} video
          {postsCount === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <button
          disabled={balanceNgn <= 0}
          className="flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-white disabled:opacity-40 shadow-lg shadow-primary/20"
        >
          <ArrowDownLeft className="h-4 w-4" />
          Withdraw
        </button>
        <button className="flex items-center justify-center gap-2 rounded-full glass py-3 text-sm font-semibold text-foreground">
          <ArrowUpRight className="h-4 w-4 text-gold" />
          Buy Credits
        </button>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-display font-semibold mb-3">Solana</h2>
        {walletAddress ? (
          <div className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-gold" />
            <div>
              <p className="text-sm font-medium">Connected</p>
              <p className="text-xs text-muted font-mono">
                {walletAddress.slice(0, 4)}…{walletAddress.slice(-4)}
              </p>
            </div>
          </div>
        ) : (
          <button className="w-full rounded-2xl border border-dashed border-primary/40 bg-primary/5 py-4 text-sm font-semibold text-primary flex items-center justify-center gap-2">
            <Zap className="h-4 w-4" />
            Connect Solana Wallet
          </button>
        )}
      </section>

      <section>
        <h2 className="text-sm font-display font-semibold mb-3">Buy Credits</h2>
        <div className="space-y-2.5">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.id}
              className={cn(
                "flex items-center justify-between rounded-2xl p-4 glass",
                pack.popular && "ring-1 ring-gold/40"
              )}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-foreground">
                    {pack.credits} credits
                  </span>
                  {pack.popular && (
                    <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-gold">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted mt-0.5">{pack.label}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gold">
                  {formatNaira(pack.priceNgn)}
                </p>
                <p className="text-[11px] text-muted">${pack.priceUsdc} USDC</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 mesh-card rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <BadgeCheck className="h-5 w-5 text-mint shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display font-semibold text-sm">
              Get Verified · Earn more
            </h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Higher CPM, wider reach, priority in the feed. From ₦7,500/month.
            </p>
            <button className="mt-3 text-xs font-semibold text-mint flex items-center gap-1">
              View plans <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
