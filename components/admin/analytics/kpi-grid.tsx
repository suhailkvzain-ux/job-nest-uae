import { BadgeCheck, CalendarDays, Eye, Globe, Mail, Share2, Users } from "lucide-react";

import { StatCard } from "@/components/admin/stat-card";
import type { KpiSummary } from "@/services/analytics.service";
import { formatNumber } from "@/utils/format";

/**
 * The ten KPI cards from the spec. "Visitors Today/This Week/This Month"
 * are always fixed rolling windows (see `getKpiSummary`'s doc comment)
 * regardless of the page's active date filter, so their captions say so
 * explicitly rather than implying they track the selected range like the
 * other seven cards do.
 */
export function KpiGrid({ kpis }: { kpis: KpiSummary }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard label="Total Visitors" value={formatNumber(kpis.totalVisitors)} icon={Users} hint="Selected period" />
      <StatCard
        label="Visitors Today"
        value={formatNumber(kpis.visitorsToday)}
        icon={CalendarDays}
        hint="Fixed — today"
      />
      <StatCard
        label="Visitors This Week"
        value={formatNumber(kpis.visitorsThisWeek)}
        icon={CalendarDays}
        hint="Fixed — last 7 days"
      />
      <StatCard
        label="Visitors This Month"
        value={formatNumber(kpis.visitorsThisMonth)}
        icon={CalendarDays}
        hint="Fixed — last 30 days"
      />
      <StatCard label="Total Page Views" value={formatNumber(kpis.totalPageViews)} icon={Eye} hint="Selected period" />
      <StatCard
        label="Total Published Jobs"
        value={formatNumber(kpis.totalPublishedJobs)}
        icon={BadgeCheck}
        hint="Current snapshot"
      />
      <StatCard label="Total Job Views" value={formatNumber(kpis.totalJobViews)} icon={Eye} hint="Selected period" />
      <StatCard
        label="Website Apply Clicks"
        value={formatNumber(kpis.websiteApplyClicks)}
        icon={Globe}
        hint="Selected period"
      />
      <StatCard
        label="Email Apply Clicks"
        value={formatNumber(kpis.emailApplyClicks)}
        icon={Mail}
        hint="Selected period"
      />
      <StatCard
        label="Share Clicks"
        value={formatNumber(kpis.shareClicks)}
        icon={Share2}
        hint="Selected period"
      />
    </div>
  );
}
