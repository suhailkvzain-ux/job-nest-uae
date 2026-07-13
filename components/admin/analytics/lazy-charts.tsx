"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Recharts is a sizeable client-only dependency — loading it eagerly
 * would bloat the JS every `/admin/analytics` visit ships, even before
 * a single chart is visible. `next/dynamic` with `ssr: false` code-splits
 * the charting bundle into its own chunk and defers fetching it until
 * these components actually mount, satisfying the spec's "lazy-load
 * charts, don't block rendering" requirement. The KPI cards and tables
 * render immediately from the server response; only the chart chunk is
 * deferred.
 */
function ChartSkeleton() {
  return <Skeleton className="h-56 w-full rounded-xl" />;
}

export const LazyAnalyticsLineChart = dynamic(
  () => import("@/components/admin/analytics/analytics-line-chart").then((m) => m.AnalyticsLineChart),
  { ssr: false, loading: ChartSkeleton },
);

export const LazyAnalyticsBarChart = dynamic(
  () => import("@/components/admin/analytics/analytics-bar-chart").then((m) => m.AnalyticsBarChart),
  { ssr: false, loading: ChartSkeleton },
);
