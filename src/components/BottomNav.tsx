"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusSquare, Sparkles, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Feed", icon: Home },
  { href: "/studio", label: "Studio", icon: Sparkles },
  { href: "/upload", label: "Upload", icon: PlusSquare },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const isFeed = pathname === "/";

  return (
    <nav
      className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom transition-colors",
        isFeed
          ? "bg-transparent border-t border-white/10"
          : "bg-background/95 backdrop-blur-lg border-t border-border"
      )}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors",
                isActive
                  ? isFeed
                    ? "text-white"
                    : "text-primary"
                  : isFeed
                    ? "text-white/60 hover:text-white"
                    : "text-muted hover:text-foreground"
              )}
            >
              <Icon
                className={cn("h-5 w-5", isActive && "stroke-[2.5px]")}
              />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
