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
  // Hide on feed — interactions live on the video; optional: keep pill visible
  const isFeed = pathname === "/";

  return (
    <nav
      className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom pointer-events-none",
        isFeed ? "pb-3" : "pb-3"
      )}
    >
      <div className="mx-auto max-w-md px-4 pointer-events-auto">
        <div className="nav-pill flex items-center justify-around rounded-full px-2 py-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-full px-3.5 py-1.5 transition-all",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted hover:text-foreground"
                )}
              >
                <Icon
                  className={cn("h-[20px] w-[20px]", isActive && "stroke-[2.5px]")}
                />
                <span className="text-[10px] font-medium tracking-wide">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
