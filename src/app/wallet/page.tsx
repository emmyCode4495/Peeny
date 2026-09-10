"use client";

import { formatNaira, formatNumber } from "@/lib/utils";
import { creditPacks } from "@/lib/mock-data";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  BadgeCheck,
  Copy,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function WalletPage() {
  const credits = 42;
  const balanceNgn = 187500;
  const totalEarned = 412000;
  const connected = false; // mock – will be real Solana later

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-8">
      <header className="mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Wallet
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Earnings in NGN · Credits · Solana
        </p>
      </header>

      {/* Balance cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl bg-card border border-border p-4">
          <p className="text-xs text-muted mb-1">Available Balance</p>
          <p className="text-xl font-bold">{formatNaira(balanceNgn)}</p>
          <p className="text-[11px] text-muted mt-1">≈ $112 USDC</p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4">
          <p className="text-xs text-muted mb-1">Credits</p>
          <p className="text-xl font-bold text-primary">{credits}</p>
          <p className="text-[11px] text-muted mt-1">for Genny Studio</p>
        </div>
      </div>

      {/* Total earned */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 p-4 mb-6">
        <p className="text-xs text-muted mb-1">Total Earned (All time)</p>
        <p className="text-2xl font-bold">{formatNaira(totalEarned)}</p>
        <p className="text-xs text-muted mt-1">
          From {formatNumber(284000)} views across 12 videos
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <button className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-white">
          <ArrowDownLeft className="h-4 w-4" />
          Withdraw
        </button>
        <button className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-semibold">
          <ArrowUpRight className="h-4 w-4" />
          Buy Credits
        </button>
      </div>

      {/* Solana connection */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold mb-3">Solana Wallet</h2>
        {connected ? (
          <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400" />
              <div>
                <p className="text-sm font-medium">Phantom</p>
                <p className="text-xs text-muted font-mono">7xK...9pQ</p>
              </div>
            </div>
            <button className="text-muted hover:text-foreground">
              <Copy className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button className="w-full rounded-2xl border border-dashed border-primary/50 bg-primary/5 py-4 text-sm font-semibold text-primary flex items-center justify-center gap-2">
            <Zap className="h-4 w-4" />
            Connect Solana Wallet
          </button>
        )}
        <p className="text-[11px] text-muted mt-2 text-center">
          Pay with SOL / USDC · Instant settlement · Low fees
        </p>
      </section>

      {/* Credit packs */}
      <section>
        <h2 className="text-sm font-semibold mb-3">Buy Credits</h2>
        <div className="space-y-2.5">
          {creditPacks.map((pack) => (
            <div
              key={pack.id}
              className={cn(
                "flex items-center justify-between rounded-2xl border p-4",
                pack.popular
                  ? "border-primary/60 bg-primary/5"
                  : "border-border bg-card"
              )}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{pack.credits} credits</span>
                  {pack.popular && (
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted mt-0.5">{pack.label} pack</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">
                  {formatNaira(pack.priceNgn)}
                </p>
                {pack.priceUsdc && (
                  <p className="text-[11px] text-muted">
                    or ${pack.priceUsdc} USDC
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verification upsell */}
      <section className="mt-8 rounded-2xl border border-accent/30 bg-accent/5 p-4">
        <div className="flex items-start gap-3">
          <BadgeCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm">Get Verified · Earn more</h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Pro creators get higher CPM, wider reach, and priority in the feed.
              From ₦7,500/month.
            </p>
            <button className="mt-3 text-xs font-semibold text-accent flex items-center gap-1">
              View plans <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
