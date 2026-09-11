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
    <aside className="hidden lg:flex flex-col w-[248px] shrink-0 h-screen sticky top-0 border-r border-white/[0.06] bg-background px-3 py-5 z-40">
      <Link href="/" className="flex items-center gap-2.5 px-3 mb-7">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center font-display font-bold text-white text-base shadow-lg shadow-primary/30">
          P
        </div>
        <span className="text-xl font-display font-bold tracking-tight text-foreground">
          Peeny
        </span>
      </Link>

      <div className="relative mb-5 px-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
        <input
          type="search"
          placeholder="Search"
          className="w-full rounded-full bg-surface border border-white/[0.08] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
      </div>

      <nav className="flex-1 space-y-0.5">
        {mainNav.map(({ href, label, icon: Icon, auth }) => {
          if (auth && !isAuthed) return null;
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-foreground/75 hover:bg-white/[0.04] hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-white/[0.06] space-y-3">
        {loading ? (
          <div className="px-3 py-2 text-xs text-muted">Loading…</div>
        ) : isAuthed ? (
          <>
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.04] transition-colors"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/30"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-surface-elevated ring-2 ring-primary/20 flex items-center justify-center text-sm font-bold text-foreground">
                  {(profile?.display_name || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">
                  {profile?.display_name || "Creator"}
                </p>
                <p className="text-xs text-muted truncate">
                  @{profile?.username || "user"}
                </p>
              </div>
            </Link>
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-muted hover:bg-white/[0.04] hover:text-foreground transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Log out
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all shadow-lg shadow-primary/25"
          >
            <LogIn className="h-4 w-4" />
            Log in
          </Link>
        )}
        <div className="px-3 pt-1 text-[11px] text-muted/70 space-y-0.5">
          <p>© 2026 Peeny</p>
          <p>AI video for African creators</p>
        </div>
      </div>
    </aside>
  );
}
