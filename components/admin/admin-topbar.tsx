"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminMobileSidebar } from "@/components/admin/admin-mobile-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminNav } from "@/constants/admin-nav";

/** Looks up the current section's label from the sidebar nav, for the top bar's page title. */
function usePageTitle(): string {
  const pathname = usePathname();
  const match = adminNav.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return match?.label ?? "Admin";
}

/**
 * Sticky top bar — mobile menu trigger + page title on the left, admin
 * email + profile dropdown (with logout) on the right. `adminEmail` is
 * passed down from the Server Component layout, which already has the
 * authenticated Supabase user from `requireAdmin()`.
 */
export function AdminTopbar({ adminEmail }: { adminEmail: string }) {
  const title = usePageTitle();

  return (
    <header className="sticky top-0 z-sticky flex h-16 items-center justify-between border-b border-border/60 bg-card/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <AdminMobileSidebar />
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-muted-foreground sm:inline">{adminEmail}</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Admin account menu"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient-soft text-primary transition-opacity hover:opacity-80"
            >
              <User className="h-4.5 w-4.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{adminEmail}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-1 pb-1">
              <AdminLogoutButton variant="full" />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <AdminLogoutButton variant="icon" className="hidden sm:inline-flex" />
      </div>
    </header>
  );
}
