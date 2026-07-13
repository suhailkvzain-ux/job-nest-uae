"use client";

import { Briefcase } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { adminNav } from "@/constants/admin-nav";
import { siteConfig } from "@/constants/site";
import { cn } from "@/lib/utils";

/**
 * Sidebar nav content — shared verbatim between the desktop fixed aside
 * and the mobile slide-over drawer (same split `MobileFilterDrawer`
 * already uses on the public site: one source of truth for the menu,
 * two surfaces to render it in).
 */
export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <Link href="/admin/dashboard" className="flex items-center gap-2 px-1 font-semibold tracking-tight">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-soft">
          <Briefcase className="h-4.5 w-4.5" strokeWidth={2.25} />
        </span>
        <span className="text-base">{siteConfig.shortName} Admin</span>
      </Link>

      <nav aria-label="Admin navigation" className="flex flex-1 flex-col gap-1">
        {adminNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-gradient text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 pt-3">
        <AdminLogoutButton variant="full" />
      </div>
    </div>
  );
}
