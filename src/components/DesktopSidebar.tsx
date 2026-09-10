"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Users,
  Clapperboard,
  Radio,
  PlusSquare,
  User,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "For You", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/following", label: "Following", icon: Users },
  { href: "/studio", label: "Short dramas", icon: Clapperboard },
  { href: "/live", label: "LIVE", icon: Radio },
  { href: "/upload", label: "Upload", icon: PlusSquare },
  { href: "/profile", label: "Profile", icon: User },
];

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 h-screen sticky top-0 border-r border-white/10 bg-black px-3 py-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 px-3 mb-5">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-sm">
          P
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          Peeny
        </span>
      </Link>

      {/* Search */}
      <div className="relative mb-5 px-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          type="search"
          placeholder="Search"
          className="w-full rounded-full bg-zinc-900 border border-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-semibold transition-colors",
                active
                  ? "text-primary"
                  : "text-white/80 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} />
              {label}
            </Link>
          );
        })}
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-semibold text-white/80 hover:bg-white/5 hover:text-white">
          <MoreHorizontal className="h-5 w-5" />
          More
        </button>
      </nav>

      {/* Login */}
      <div className="mt-auto px-1 pt-4 border-t border-white/10">
        <button className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
          Log in
        </button>
        <div className="mt-4 px-1 text-[11px] text-muted space-y-1">
          <p>Company</p>
          <p>Program</p>
          <p>Terms & Policies</p>
          <p className="pt-1">© 2026 Peeny</p>
        </div>
      </div>
    </aside>
  );
}
