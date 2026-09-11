"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Home,
  Sparkles,
  PlusSquare,
  Wallet,
  User,
  LogIn,
  LogOut,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/", label: "Feed", icon: Home, auth: false },
  { href: "/studio", label: "Studio", icon: Sparkles, auth: false },
  { href: "/upload", label: "Upload", icon: PlusSquare, auth: true },
  { href: "/wallet", label: "Wallet", icon: Wallet, auth: true },
  { href: "/profile", label: "Profile", icon: User, auth: true },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useAuth();
  const isAuthed = !!user;

  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 h-screen sticky top-0 border-r border-white/10 bg-black px-3 py-4 z-40">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 px-3 mb-6">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center font-bold text-white text-base">
          P
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          Peeny
        </span>
      </Link>

      {/* Search */}
      <div className="relative mb-5 px-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
        <input
          type="search"
          placeholder="Search creators & videos"
          className="w-full rounded-full bg-zinc-900 border border-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5">
        {mainNav.map(({ href, label, icon: Icon, auth }) => {
          // Hide auth-only items when logged out
          if (auth && !isAuthed) return null;

          const active =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-white/80 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: auth state */}
      <div className="mt-auto pt-4 border-t border-white/10 space-y-3">
        {loading ? (
          <div className="px-3 py-2 text-xs text-muted">Loading…</div>
        ) : isAuthed ? (
          <>
            {/* User chip */}
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover border border-white/20"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-zinc-800 border border-white/20 flex items-center justify-center text-sm font-bold text-white">
                  {(profile?.display_name || profile?.username || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {profile?.display_name || "Creator"}
                </p>
                <p className="text-xs text-muted truncate">
                  @{profile?.username || "user"}
                </p>
              </div>
            </Link>

            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Log out
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Log in
          </Link>
        )}

        <div className="px-3 pt-2 text-[11px] text-muted/80 space-y-0.5">
          <p>© 2026 Peeny</p>
          <p>AI video for African creators</p>
        </div>
      </div>
    </aside>
  );
}
