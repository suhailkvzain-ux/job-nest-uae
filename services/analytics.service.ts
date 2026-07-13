import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";
import type { AnalyticsFilterInput, TopJobsSearchInput } from "@/lib/validations/analytics";
import type { PaginatedResult } from "@/types";

/**
 * Analytics aggregation service — the Phase 12 Analytics Dashboard's
 * entire data layer. Every function here reads from `AnalyticsEvent`
 * (the time-series log) rather than the lifetime counters on
 * `Analytics`/`Advertisement`, so the whole dashboard is coherently
 * scoped to whatever date range the admin has selected — no mixing
 * "this number is all-time, that one is last 30 days" in the same
 * screen. At this project's realistic event volume (a job discovery
 * site, not a high-traffic consumer app), fetching matching rows and
 * aggregating in application code is simpler and just as correct as
 * raw SQL date-bucketing (`date_trunc`) or a rollup table — both
 * documented here as the natural next step if traffic ever outgrows
 * this approach.
 */

export interface DateRange {
  from: Date;
  to: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Turns the page-level filter into concrete `Date` boundaries. `to` is always "now" except for a custom range's explicit end. */
export function resolveDateRange(filter: AnalyticsFilterInput): DateRange {
  const now = new Date();

  if (filter.range === "custom") {
    return {
      from: filter.from ?? new Date(now.getTime() - 30 * DAY_MS),
      to: filter.to ?? now,
    };
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter.range) {
    case "today":
      return { from: startOfToday, to: now };
    case "7d":
      return { from: new Date(now.getTime() - 7 * DAY_MS), to: now };
    case "90d":
      return { from: new Date(now.getTime() - 90 * DAY_MS), to: now };
    case "30d":
    default:
      return { from: new Date(now.getTime() - 30 * DAY_MS), to: now };
  }
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function weekKey(date: Date): string {
  // ISO week key "YYYY-Www" — simple Monday-start bucketing, good enough
  // for a trend chart's x-axis label (not used for any calendar-exact
  // business logic).
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((d.getTime() - firstThursday.getTime()) / DAY_MS - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Every day between `from` and `to` (inclusive), as `YYYY-MM-DD` keys — ensures a chart shows a zero-value point for days with no activity, rather than skipping them. */
function enumerateDays(from: Date, to: Date): string[] {
  const days: string[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  while (cursor.getTime() <= end.getTime()) {
    days.push(dayKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

// ─────────────────────────────────────────────────────────────
// KPI cards
// ─────────────────────────────────────────────────────────────

export interface KpiSummary {
  totalVisitors: number;
  visitorsToday: number;
  visitorsThisWeek: number;
  visitorsThisMonth: number;
  totalPageViews: number;
  totalPublishedJobs: number;
  totalJobViews: number;
  websiteApplyClicks: number;
  emailApplyClicks: number;
  shareClicks: number;
}

async function countDistinctVisitors(from: Date, to: Date): Promise<number> {
  const rows = await prisma.analyticsEvent.findMany({
    where: { type: "PAGE_VIEW", createdAt: { gte: from, lte: to }, visitorId: { not: null } as never },
    select: { visitorId: true },
    distinct: ["visitorId"],
  });
  return rows.length;
}

/**
 * The dashboard's ten KPI cards. "Total Visitors"/"Total Page Views"/
 * "Total Job Views"/the three apply-click counts all respect the
 * selected date range (switching the filter updates them) — the
 * "Visitors Today/This Week/This Month" trio are deliberately fixed
 * rolling windows regardless of the active filter, since they're
 * already time-scoped by their own name. "Total Published Jobs" is a
 * current snapshot (a job's published status isn't a point-in-time
 * event to filter by a date range).
 */
export async function getKpiSummary(filter: AnalyticsFilterInput): Promise<KpiSummary> {
  const { from, to } = resolveDateRange(filter);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalVisitors,
    visitorsToday,
    visitorsThisWeek,
    visitorsThisMonth,
    totalPageViews,
    totalPublishedJobs,
    totalJobViews,
    websiteApplyClicks,
    emailApplyClicks,
    shareClicks,
  ] = await Promise.all([
    countDistinctVisitors(from, to),
    countDistinctVisitors(startOfToday, now),
    countDistinctVisitors(new Date(now.getTime() - 7 * DAY_MS), now),
    countDistinctVisitors(new Date(now.getTime() - 30 * DAY_MS), now),
    prisma.analyticsEvent.count({ where: { type: "PAGE_VIEW", createdAt: { gte: from, lte: to } } }),
    prisma.job.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    prisma.analyticsEvent.count({ where: { type: "JOB_VIEW", createdAt: { gte: from, lte: to } } }),
    prisma.analyticsEvent.count({ where: { type: "WEBSITE_CLICK", createdAt: { gte: from, lte: to } } }),
    prisma.analyticsEvent.count({ where: { type: "EMAIL_CLICK", createdAt: { gte: from, lte: to } } }),
    prisma.analyticsEvent.count({ where: { type: "SHARE_CLICK", createdAt: { gte: from, lte: to } } }),
  ]);

  return {
    totalVisitors,
    visitorsToday,
    visitorsThisWeek,
    visitorsThisMonth,
    totalPageViews,
    totalPublishedJobs,
    totalJobViews,
    websiteApplyClicks,
    emailApplyClicks,
    shareClicks,
  };
}

// ─────────────────────────────────────────────────────────────
// Charts
// ─────────────────────────────────────────────────────────────

export interface SeriesPoint {
  label: string;
  value: number;
}

async function visitorSeriesFor(from: Date, to: Date, bucket: (d: Date) => string): Promise<SeriesPoint[]> {
  const rows = await prisma.analyticsEvent.findMany({
    where: { type: "PAGE_VIEW", createdAt: { gte: from, lte: to }, visitorId: { not: null } as never },
    select: { createdAt: true, visitorId: true },
  });

  const byBucket = new Map<string, Set<string>>();
  for (const row of rows) {
    const key = bucket(row.createdAt);
    const set = byBucket.get(key) ?? new Set<string>();
    if (row.visitorId) set.add(row.visitorId);
    byBucket.set(key, set);
  }

  return Array.from(byBucket.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, visitors]) => ({ label, value: visitors.size }));
}

/** Daily Visitors — fixed at the last 30 days regardless of the page's active filter, per the spec's own "(Last 30 Days)" label. */
export async function getDailyVisitorsSeries(): Promise<SeriesPoint[]> {
  const to = new Date();
  const from = new Date(to.getTime() - 29 * DAY_MS);
  const series = await visitorSeriesFor(from, to, dayKey);
  const seriesMap = new Map(series.map((p) => [p.label, p.value]));
  return enumerateDays(from, to).map((day) => ({ label: day, value: seriesMap.get(day) ?? 0 }));
}

/** Weekly Visitors — last 12 weeks. */
export async function getWeeklyVisitorsSeries(): Promise<SeriesPoint[]> {
  const to = new Date();
  const from = new Date(to.getTime() - 12 * 7 * DAY_MS);
  return visitorSeriesFor(from, to, weekKey);
}

/** Monthly Visitors — last 12 months. */
export async function getMonthlyVisitorsSeries(): Promise<SeriesPoint[]> {
  const to = new Date();
  const from = new Date(to.getFullYear(), to.getMonth() - 11, 1);
  return visitorSeriesFor(from, to, monthKey);
}

async function eventCountSeries(
  types: ("JOB_VIEW" | "WEBSITE_CLICK" | "EMAIL_CLICK")[],
  from: Date,
  to: Date,
): Promise<SeriesPoint[]> {
  const rows = await prisma.analyticsEvent.findMany({
    where: { type: { in: types }, createdAt: { gte: from, lte: to } },
    select: { createdAt: true },
  });

  const byDay = new Map<string, number>();
  for (const row of rows) {
    const key = dayKey(row.createdAt);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }

  return enumerateDays(from, to).map((day) => ({ label: day, value: byDay.get(day) ?? 0 }));
}

/** Job Views Trend — daily job-view count over the selected range. */
export async function getJobViewsTrend(filter: AnalyticsFilterInput): Promise<SeriesPoint[]> {
  const { from, to } = resolveDateRange(filter);
  return eventCountSeries(["JOB_VIEW"], from, to);
}

/** Apply Click Trend — daily Website + Email apply clicks combined, over the selected range. */
export async function getApplyClickTrend(filter: AnalyticsFilterInput): Promise<SeriesPoint[]> {
  const { from, to } = resolveDateRange(filter);
  return eventCountSeries(["WEBSITE_CLICK", "EMAIL_CLICK"], from, to);
}

/** New Jobs Published — daily count of jobs whose `publishedAt` falls in the selected range, regardless of current status (a job later archived was still "published" on that day). */
export async function getNewJobsPublishedTrend(filter: AnalyticsFilterInput): Promise<SeriesPoint[]> {
  const { from, to } = resolveDateRange(filter);
  const rows = await prisma.job.findMany({
    where: { publishedAt: { gte: from, lte: to } },
    select: { publishedAt: true },
  });

  const byDay = new Map<string, number>();
  for (const row of rows) {
    if (!row.publishedAt) continue;
    const key = dayKey(row.publishedAt);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }

  return enumerateDays(from, to).map((day) => ({ label: day, value: byDay.get(day) ?? 0 }));
}

// ─────────────────────────────────────────────────────────────
// Top performing: Jobs / Companies / Categories / Locations
// ─────────────────────────────────────────────────────────────

interface JobEventTotals {
  views: number;
  websiteClicks: number;
  emailClicks: number;
}

function emptyTotals(): JobEventTotals {
  return { views: 0, websiteClicks: 0, emailClicks: 0 };
}

function ctrOf(totals: JobEventTotals): number {
  const applyClicks = totals.websiteClicks + totals.emailClicks;
  if (totals.views === 0) return 0;
  return Math.round((applyClicks / totals.views) * 1000) / 10; // one decimal place
}

/** Builds a `jobId -> {views, websiteClicks, emailClicks}` map from the event log within the given range — the shared base every Top-* aggregation below joins against. */
async function getJobEventTotalsInRange(from: Date, to: Date): Promise<Map<string, JobEventTotals>> {
  const rows = await prisma.analyticsEvent.groupBy({
    by: ["jobId", "type"],
    where: {
      type: { in: ["JOB_VIEW", "WEBSITE_CLICK", "EMAIL_CLICK"] },
      jobId: { not: null } as never,
      createdAt: { gte: from, lte: to },
    },
    _count: true,
  });

  const map = new Map<string, JobEventTotals>();
  for (const row of rows) {
    if (!row.jobId) continue;
    const totals = map.get(row.jobId) ?? emptyTotals();
    const count = row._count;
    if (row.type === "JOB_VIEW") totals.views += count;
    else if (row.type === "WEBSITE_CLICK") totals.websiteClicks += count;
    else if (row.type === "EMAIL_CLICK") totals.emailClicks += count;
    map.set(row.jobId, totals);
  }
  return map;
}

export interface TopJobRow {
  id: string;
  title: string;
  slug: string;
  companyName: string;
  views: number;
  websiteClicks: number;
  emailClicks: number;
  ctr: number;
  publishedAt: Date | null;
}

/** Top Performing Jobs table — search + sort + paginate, scoped to the selected date range. */
export async function getTopJobs(
  filter: AnalyticsFilterInput,
  search: TopJobsSearchInput,
): Promise<PaginatedResult<TopJobRow>> {
  const { from, to } = resolveDateRange(filter);
  const totalsByJob = await getJobEventTotalsInRange(from, to);

  const jobIds = Array.from(totalsByJob.keys());
  if (jobIds.length === 0) {
    return { items: [], total: 0, page: search.page, pageSize: search.pageSize, totalPages: 0 };
  }

  const jobs = await prisma.job.findMany({
    where: { id: { in: jobIds }, deletedAt: null },
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
      company: { select: { name: true } },
    },
  });

  let rows: TopJobRow[] = jobs.map((job) => {
    const totals = totalsByJob.get(job.id) ?? emptyTotals();
    return {
      id: job.id,
      title: job.title,
      slug: job.slug,
      companyName: job.company.name,
      views: totals.views,
      websiteClicks: totals.websiteClicks,
      emailClicks: totals.emailClicks,
      ctr: ctrOf(totals),
      publishedAt: job.publishedAt,
    };
  });

  if (search.query) {
    const q = search.query.toLowerCase();
    rows = rows.filter(
      (row) => row.title.toLowerCase().includes(q) || row.companyName.toLowerCase().includes(q),
    );
  }

  rows.sort((a, b) => {
    switch (search.sort) {
      case "website_clicks":
        return b.websiteClicks - a.websiteClicks;
      case "email_clicks":
        return b.emailClicks - a.emailClicks;
      case "ctr":
        return b.ctr - a.ctr;
      case "published_date":
        return (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0);
      case "views":
      default:
        return b.views - a.views;
    }
  });

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / search.pageSize));
  const start = (search.page - 1) * search.pageSize;
  const items = rows.slice(start, start + search.pageSize);

  return { items, total, page: search.page, pageSize: search.pageSize, totalPages };
}

export interface TopCompanyRow {
  id: string;
  name: string;
  publishedJobs: number;
  totalViews: number;
  totalApplyClicks: number;
}

export interface TopCategoryRow {
  id: string;
  name: string;
  publishedJobs: number;
  totalViews: number;
}

export interface TopLocationRow {
  id: string;
  name: string;
  publishedJobs: number;
  totalViews: number;
}

/** Shared groundwork for the three "Top {Company,Category,Location}" tables: join per-job event totals up to each job's parent entity, and separately snapshot each entity's currently-published job count (a status count, not date-ranged). */
async function getJobsWithTotalsAndParents(from: Date, to: Date) {
  const totalsByJob = await getJobEventTotalsInRange(from, to);
  const jobIds = Array.from(totalsByJob.keys());
  if (jobIds.length === 0) return { jobs: [], totalsByJob };

  const jobs = await prisma.job.findMany({
    where: { id: { in: jobIds }, deletedAt: null },
    select: {
      id: true,
      companyId: true,
      categoryId: true,
      locationId: true,
      company: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
      location: { select: { id: true, name: true } },
    },
  });

  return { jobs, totalsByJob };
}

export async function getTopCompanies(filter: AnalyticsFilterInput, limit = 10): Promise<TopCompanyRow[]> {
  const { from, to } = resolveDateRange(filter);
  const { jobs, totalsByJob } = await getJobsWithTotalsAndParents(from, to);

  const byCompany = new Map<string, { name: string; views: number; applyClicks: number }>();
  for (const job of jobs) {
    const totals = totalsByJob.get(job.id) ?? emptyTotals();
    const entry = byCompany.get(job.companyId) ?? { name: job.company.name, views: 0, applyClicks: 0 };
    entry.views += totals.views;
    entry.applyClicks += totals.websiteClicks + totals.emailClicks;
    byCompany.set(job.companyId, entry);
  }

  const companyIds = Array.from(byCompany.keys());
  const publishedCounts = await prisma.job.groupBy({
    by: ["companyId"],
    where: { companyId: { in: companyIds }, status: "PUBLISHED", deletedAt: null },
    _count: true,
  });
  const publishedByCompany = new Map(publishedCounts.map((row) => [row.companyId, row._count]));

  return Array.from(byCompany.entries())
    .map(([id, entry]) => ({
      id,
      name: entry.name,
      publishedJobs: publishedByCompany.get(id) ?? 0,
      totalViews: entry.views,
      totalApplyClicks: entry.applyClicks,
    }))
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, limit);
}

export async function getTopCategories(filter: AnalyticsFilterInput, limit = 10): Promise<TopCategoryRow[]> {
  const { from, to } = resolveDateRange(filter);
  const { jobs, totalsByJob } = await getJobsWithTotalsAndParents(from, to);

  const byCategory = new Map<string, { name: string; views: number }>();
  for (const job of jobs) {
    const totals = totalsByJob.get(job.id) ?? emptyTotals();
    const entry = byCategory.get(job.categoryId) ?? { name: job.category.name, views: 0 };
    entry.views += totals.views;
    byCategory.set(job.categoryId, entry);
  }

  const categoryIds = Array.from(byCategory.keys());
  const publishedCounts = await prisma.job.groupBy({
    by: ["categoryId"],
    where: { categoryId: { in: categoryIds }, status: "PUBLISHED", deletedAt: null },
    _count: true,
  });
  const publishedByCategory = new Map(publishedCounts.map((row) => [row.categoryId, row._count]));

  return Array.from(byCategory.entries())
    .map(([id, entry]) => ({
      id,
      name: entry.name,
      publishedJobs: publishedByCategory.get(id) ?? 0,
      totalViews: entry.views,
    }))
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, limit);
}

export async function getTopLocations(filter: AnalyticsFilterInput, limit = 10): Promise<TopLocationRow[]> {
  const { from, to } = resolveDateRange(filter);
  const { jobs, totalsByJob } = await getJobsWithTotalsAndParents(from, to);

  const byLocation = new Map<string, { name: string; views: number }>();
  for (const job of jobs) {
    const totals = totalsByJob.get(job.id) ?? emptyTotals();
    const entry = byLocation.get(job.locationId) ?? { name: job.location.name, views: 0 };
    entry.views += totals.views;
    byLocation.set(job.locationId, entry);
  }

  const locationIds = Array.from(byLocation.keys());
  const publishedCounts = await prisma.job.groupBy({
    by: ["locationId"],
    where: { locationId: { in: locationIds }, status: "PUBLISHED", deletedAt: null },
    _count: true,
  });
  const publishedByLocation = new Map(publishedCounts.map((row) => [row.locationId, row._count]));

  return Array.from(byLocation.entries())
    .map(([id, entry]) => ({
      id,
      name: entry.name,
      publishedJobs: publishedByLocation.get(id) ?? 0,
      totalViews: entry.views,
    }))
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, limit);
}

// ─────────────────────────────────────────────────────────────
// Recent Activity — thin re-export for a single dashboard import surface
// ─────────────────────────────────────────────────────────────

export { getRecentActivity } from "@/services/activity-log.service";

// ─────────────────────────────────────────────────────────────
// Single cached entry point for the whole dashboard
// ─────────────────────────────────────────────────────────────

export interface AnalyticsDashboardData {
  kpis: KpiSummary;
  dailyVisitors: SeriesPoint[];
  weeklyVisitors: SeriesPoint[];
  monthlyVisitors: SeriesPoint[];
  jobViewsTrend: SeriesPoint[];
  applyClickTrend: SeriesPoint[];
  newJobsPublishedTrend: SeriesPoint[];
  topJobs: PaginatedResult<TopJobRow>;
  topCompanies: TopCompanyRow[];
  topCategories: TopCategoryRow[];
  topLocations: TopLocationRow[];
}

async function loadAnalyticsDashboardData(
  filter: AnalyticsFilterInput,
  topJobsSearch: TopJobsSearchInput,
): Promise<AnalyticsDashboardData> {
  const [
    kpis,
    dailyVisitors,
    weeklyVisitors,
    monthlyVisitors,
    jobViewsTrend,
    applyClickTrend,
    newJobsPublishedTrend,
    topJobs,
    topCompanies,
    topCategories,
    topLocations,
  ] = await Promise.all([
    getKpiSummary(filter),
    getDailyVisitorsSeries(),
    getWeeklyVisitorsSeries(),
    getMonthlyVisitorsSeries(),
    getJobViewsTrend(filter),
    getApplyClickTrend(filter),
    getNewJobsPublishedTrend(filter),
    getTopJobs(filter, topJobsSearch),
    getTopCompanies(filter),
    getTopCategories(filter),
    getTopLocations(filter),
  ]);

  return {
    kpis,
    dailyVisitors,
    weeklyVisitors,
    monthlyVisitors,
    jobViewsTrend,
    applyClickTrend,
    newJobsPublishedTrend,
    topJobs,
    topCompanies,
    topCategories,
    topLocations,
  };
}

/**
 * Cached entry point for the whole `/admin/analytics` page — one call
 * fetches every KPI/chart/table the dashboard needs, in parallel.
 * Cached for 60 seconds per unique (filter, top-jobs-search)
 * combination via Next's `unstable_cache`: short enough that the
 * dashboard still feels live and a status change (e.g. publishing a
 * job) shows up within a minute, long enough to absorb repeat loads
 * (multiple admins open the page, a filter click that lands back on an
 * already-viewed range) without re-running eleven aggregation queries
 * on every request. Recent Activity is deliberately fetched outside
 * this cache (see the page) since an admin who just published or
 * edited a job expects to see it in the timeline immediately, not up
 * to 60 seconds later.
 */
export const getAnalyticsDashboardData = unstable_cache(
  loadAnalyticsDashboardData,
  ["analytics-dashboard-data"],
  { revalidate: 60 },
);
