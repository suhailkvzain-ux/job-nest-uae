"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { buildAdminJobsQueryString } from "@/lib/admin-jobs-url";
import type { AdminJobSearchInput } from "@/lib/validations/admin-job";
import type { AdminJobStatusCounts } from "@/services/jobs.service";
import { formatNumber } from "@/utils/format";

interface AdminJobsStatusTabsProps {
  filters: AdminJobSearchInput;
  counts: AdminJobStatusCounts;
}

type TabKey = "all" | "draft" | "published" | "expired";

/**
 * All / Draft / Published / Expired count tabs above the admin Jobs
 * table, matching the reference spec's stats-tab pattern. Each tab is a
 * plain link that rewrites the URL's `status`/`expired` params (via the
 * same `buildAdminJobsQueryString` every other filter control uses) and
 * resets to page 1 — no client state, so it composes correctly with the
 * existing search/filter/sort controls instead of fighting them.
 * "Expired" isn't a stored status (see `getAdminJobStatusCounts`), so it
 * sets the `expired=true` facet instead of `status`.
 */
export function AdminJobsStatusTabs({ filters, counts }: AdminJobsStatusTabsProps) {
  const pathname = usePathname();

  const activeTab: TabKey = filters.expired
    ? "expired"
    : filters.status === "DRAFT"
      ? "draft"
      : filters.status === "PUBLISHED"
        ? "published"
        : "all";

  const tabs: { key: TabKey; label: string; count: number; href: string }[] = [
    {
      key: "all",
      label: "All",
      count: counts.all,
      href: `${pathname}${buildAdminJobsQueryString({ ...filters, status: undefined, expired: undefined, page: 1 })}`,
    },
    {
      key: "draft",
      label: "Draft",
      count: counts.draft,
      href: `${pathname}${buildAdminJobsQueryString({ ...filters, status: "DRAFT", expired: undefined, page: 1 })}`,
    },
    {
      key: "published",
      label: "Published",
      count: counts.published,
      href: `${pathname}${buildAdminJobsQueryString({ ...filters, status: "PUBLISHED", expired: undefined, page: 1 })}`,
    },
    {
      key: "expired",
      label: "Expired",
      count: counts.expired,
      href: `${pathname}${buildAdminJobsQueryString({ ...filters, status: undefined, expired: true, page: 1 })}`,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-card p-1.5">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
            activeTab === tab.key
              ? "bg-brand-gradient text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {tab.label}
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs",
              activeTab === tab.key ? "bg-white/20" : "bg-muted text-muted-foreground",
            )}
          >
            {formatNumber(tab.count)}
          </span>
        </Link>
      ))}
    </div>
  );
}
