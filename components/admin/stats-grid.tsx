import {
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarClock,
  Eye,
  FileEdit,
  Layers,
  MapPinned,
  MousePointerClick,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "@/services/dashboard.service";
import { formatNumber } from "@/utils/format";

/**
 * The dashboard's full stat-card wall. `Today's Visitors` intentionally
 * renders a "not tracked yet" state rather than a fabricated number —
 * see the README's Phase 8 section for why (the `Analytics` model has
 * no per-day timestamped events, only a running total per job).
 * `Total Visitors` is labeled as job views specifically, since that's
 * the honest, derivable proxy this schema supports.
 */
export function StatsGrid({ stats }: { stats: DashboardStats }) {
  const { jobCounts } = stats;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total Jobs" value={formatNumber(jobCounts.total)} icon={Briefcase} />
        <StatCard label="Published Jobs" value={formatNumber(jobCounts.published)} icon={BadgeCheck} />
        <StatCard label="Draft Jobs" value={formatNumber(jobCounts.draft)} icon={FileEdit} />
        <StatCard label="Scheduled Jobs" value={formatNumber(jobCounts.scheduled)} icon={CalendarClock} />
        <StatCard label="Featured Jobs" value={formatNumber(jobCounts.featured)} icon={Sparkles} />
        <StatCard label="Companies" value={formatNumber(stats.companies)} icon={Building2} />
        <StatCard label="Categories" value={formatNumber(stats.categories)} icon={Layers} />
        <StatCard label="Locations" value={formatNumber(stats.locations)} icon={MapPinned} />
        <StatCard
          label="Today's Visitors"
          value="—"
          icon={Users}
          hint="Needs day-bucketed analytics (not in schema yet)"
        />
        <StatCard
          label="Total Visitors"
          value={formatNumber(stats.totalJobViews)}
          icon={TrendingUp}
          hint="Aggregated job views"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary">
              <Eye className="h-5 w-5" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-medium text-muted-foreground">Most Viewed Job</span>
              {stats.mostViewedJob ? (
                <>
                  <Link
                    href={`/jobs/${stats.mostViewedJob.job.slug}`}
                    target="_blank"
                    className="truncate font-semibold text-foreground hover:text-primary"
                  >
                    {stats.mostViewedJob.job.title}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(stats.mostViewedJob.views)} views
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">No views recorded yet</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary">
              <MousePointerClick className="h-5 w-5" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-medium text-muted-foreground">Most Clicked Job</span>
              {stats.mostClickedJob ? (
                <>
                  <Link
                    href={`/jobs/${stats.mostClickedJob.job.slug}`}
                    target="_blank"
                    className="truncate font-semibold text-foreground hover:text-primary"
                  >
                    {stats.mostClickedJob.job.title}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(stats.mostClickedJob.clicks)} apply clicks
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">No apply clicks recorded yet</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
