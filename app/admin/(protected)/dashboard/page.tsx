import Link from "next/link";
import { Suspense } from "react";

import { NotificationsPanel } from "@/components/admin/notifications-panel";
import { QuickActions } from "@/components/admin/quick-actions";
import { RecentJobsTable } from "@/components/admin/recent-jobs-table";
import { StatsGrid } from "@/components/admin/stats-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminNotifications, getDashboardStats } from "@/services/dashboard.service";
import { getRecentJobsForAdmin } from "@/services/jobs.service";

export const metadata = { title: "Dashboard | Admin" };

// Always fresh — an admin checking the dashboard expects the current
// counts, not a cached snapshot from up to a minute ago like the public
// site's ISR pages.
export const dynamic = "force-dynamic";

function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" role="status" aria-live="polite" aria-label="Loading stats">
      <span className="sr-only">Loading stats…</span>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-live="polite" aria-label="Loading">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

/** Streamed independently so a slow notifications/audit query never blocks the KPI cards. */
async function StatsGridAsync() {
  const stats = await getDashboardStats();
  return <StatsGrid stats={stats} />;
}

async function NotificationsAsync() {
  const notifications = await getAdminNotifications();
  return <NotificationsPanel notifications={notifications} />;
}

async function RecentJobsAsync() {
  const recentJobs = await getRecentJobsForAdmin(10);
  return <RecentJobsTable jobs={recentJobs} />;
}

/**
 * The admin dashboard — real-time stats, recent jobs, quick actions, and
 * alerts, all wired to live Prisma data via `services/dashboard.service.ts`
 * and `services/jobs.service.ts`. No CRUD here yet, per this phase's
 * scope; every action either works today (View, the quick-action links)
 * or is visibly present-but-disabled with an explanation (Edit/Duplicate/
 * Delete on the Recent Jobs table).
 *
 * Since this route is `force-dynamic` (always fresh, never ISR-cached),
 * every visit re-runs all three queries — each is streamed in behind its
 * own `<Suspense>` boundary so, e.g., a slower Recent Jobs query never
 * blocks the KPI cards or Quick Actions from painting first.
 */
export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={<StatsGridSkeleton />}>
        <StatsGridAsync />
      </Suspense>

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">Quick Actions</h2>
        <QuickActions />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">Alerts</h2>
        <Suspense fallback={<PanelSkeleton />}>
          <NotificationsAsync />
        </Suspense>
      </section>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Recent Jobs</CardTitle>
          <Link href="/admin/jobs" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TableSkeleton />}>
            <RecentJobsAsync />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
