import type { Metadata } from "next";
import { Suspense } from "react";

import { AnalyticsFilterBar } from "@/components/admin/analytics/analytics-filter-bar";
import { ChartCard } from "@/components/admin/analytics/chart-card";
import { ExportAnalyticsButton } from "@/components/admin/analytics/export-analytics-button";
import { KpiGrid } from "@/components/admin/analytics/kpi-grid";
import { LazyAnalyticsBarChart, LazyAnalyticsLineChart } from "@/components/admin/analytics/lazy-charts";
import { RecentActivityTimeline } from "@/components/admin/analytics/recent-activity-timeline";
import { TopEntitiesTable } from "@/components/admin/analytics/top-entities-table";
import { TopJobsPagination } from "@/components/admin/analytics/top-jobs-pagination";
import { TopJobsSearchBar } from "@/components/admin/analytics/top-jobs-search-bar";
import { TopJobsSortControl } from "@/components/admin/analytics/top-jobs-sort-control";
import { TopJobsTable } from "@/components/admin/analytics/top-jobs-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  parseAnalyticsFilterParams,
  parseTopJobsSearchParams,
  type RawAnalyticsSearchParams,
} from "@/lib/analytics-url";
import { getAnalyticsDashboardData, getRecentActivity } from "@/services/analytics.service";

export const metadata: Metadata = { title: "Analytics | Admin" };
export const dynamic = "force-dynamic";

interface AdminAnalyticsPageProps {
  searchParams: Promise<RawAnalyticsSearchParams>;
}

/**
 * `/admin/analytics` — insights into website performance, visitor
 * activity, and job engagement: which jobs, companies, categories, and
 * locations perform best, per the Phase 12 spec's stated purpose.
 *
 * Data flows through one cached aggregation call
 * (`getAnalyticsDashboardData`, 60s revalidate) so every KPI/chart/table
 * on the page is computed from a single consistent snapshot. Recent
 * Activity is fetched separately, uncached, so it reflects the very
 * latest admin action immediately.
 */
function RecentActivitySkeleton() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-live="polite" aria-label="Loading recent activity">
      <span className="sr-only">Loading recent activity…</span>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  );
}

/**
 * Recent Activity is intentionally fetched uncached, separately from
 * `getAnalyticsDashboardData()`'s single cached snapshot (see the doc
 * comment above), so it always reflects the very latest admin action.
 * Streaming it behind its own `<Suspense>` boundary means that
 * uncached, always-fresh query never blocks the cached KPIs/charts/
 * tables above it from rendering first.
 */
async function RecentActivityAsync() {
  const recentActivity = await getRecentActivity(20);
  return <RecentActivityTimeline items={recentActivity} />;
}

export default async function AdminAnalyticsPage({ searchParams }: AdminAnalyticsPageProps) {
  const rawParams = await searchParams;
  const filter = parseAnalyticsFilterParams(rawParams);
  const topJobsSearch = parseTopJobsSearchParams(rawParams);

  const data = await getAnalyticsDashboardData(filter, topJobsSearch);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Visitor activity and job engagement across the site.
          </p>
        </div>
        <ExportAnalyticsButton kpis={data.kpis} topJobs={data.topJobs.items} />
      </div>

      <AnalyticsFilterBar />

      <KpiGrid kpis={data.kpis} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Daily Visitors" caption="Last 30 days — fixed window">
          <LazyAnalyticsLineChart data={data.dailyVisitors} />
        </ChartCard>
        <ChartCard title="Weekly Visitors" caption="Last 12 weeks — fixed window">
          <LazyAnalyticsLineChart data={data.weeklyVisitors} color="hsl(var(--brand-end))" />
        </ChartCard>
        <ChartCard title="Monthly Visitors" caption="Last 12 months — fixed window">
          <LazyAnalyticsLineChart data={data.monthlyVisitors} />
        </ChartCard>
        <ChartCard title="Job Views Trend" caption="Selected period">
          <LazyAnalyticsLineChart data={data.jobViewsTrend} color="hsl(var(--success))" />
        </ChartCard>
        <ChartCard title="Apply Click Trend" caption="Website + email apply clicks, selected period">
          <LazyAnalyticsLineChart data={data.applyClickTrend} color="hsl(var(--brand-end))" />
        </ChartCard>
        <ChartCard title="New Jobs Published" caption="Selected period">
          <LazyAnalyticsBarChart data={data.newJobsPublishedTrend} />
        </ChartCard>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Top Performing Jobs</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <TopJobsSearchBar />
            <TopJobsSortControl />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TopJobsTable rows={data.topJobs.items} />
          <TopJobsPagination
            basePath="/admin/analytics"
            rawParams={rawParams}
            search={topJobsSearch}
            page={data.topJobs.page}
            totalPages={data.topJobs.totalPages}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <TopEntitiesTable rows={data.topCompanies} nameHeader="Company" emptyLabel="No company activity yet" showApplyClicks />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <TopEntitiesTable rows={data.topCategories} nameHeader="Category" emptyLabel="No category activity yet" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <TopEntitiesTable rows={data.topLocations} nameHeader="Location" emptyLabel="No location activity yet" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<RecentActivitySkeleton />}>
            <RecentActivityAsync />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
