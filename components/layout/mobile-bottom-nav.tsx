"use client";

import { Bookmark, Briefcase, Home, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Home", href: "/", icon: Home, match: (p: string) => p === "/" },
  { label: "Jobs", href: "/jobs", icon: Briefcase, match: (p: string) => p.startsWith("/jobs") },
  { label: "Saved", href: "/saved", icon: Bookmark, match: (p: string) => p.startsWith("/saved") },
  { label: "Profile", href: "/profile", icon: User, match: (p: string) => p.startsWith("/profile") },
];

/**
 * Fixed bottom tab bar shown on mobile only (`md:hidden`), mirroring
 * the reference app's Home / Jobs / Saved / Profile bar. `<SiteLayout>`
 * adds matching bottom padding to `<main>` on mobile so this bar never
 * overlaps page content or the footer.
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { savedIds } = useSavedJobs();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-header flex items-stretch border-t border-border/60 bg-card/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      {TABS.map((tab) => {
        const active = tab.match(pathname ?? "/");
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span className="relative">
              <Icon className={cn("h-5 w-5", active && "fill-current/10")} strokeWidth={active ? 2.25 : 1.75} />
              {tab.label === "Saved" && savedIds.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-semibold text-primary-foreground">
                  {savedIds.length > 9 ? "9+" : savedIds.length}
                </span>
              )}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
