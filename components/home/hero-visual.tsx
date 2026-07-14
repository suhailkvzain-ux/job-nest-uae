import { Briefcase, CheckCircle2, ScanSearch, TrendingUp } from "lucide-react";

import type { HomeStats } from "@/services/stats.service";

interface HeroVisualProps {
  stats: HomeStats;
}

/**
 * Floating "dashboard card" cluster for the dark hero banner —
 * three white cards stacked/offset on top of the navy gradient,
 * plus small rotated tag chips scattered around them. Modeled on
 * the reference's "info card over dark banner" composition, but
 * every number/label here is real platform data (from `HomeStats`)
 * rather than a fabricated example — no invented job/company names.
 */
export function HeroVisual({ stats }: HeroVisualProps) {
  return (
    <div className="relative mx-auto hidden h-[420px] w-full max-w-md lg:block" aria-hidden="true">
      {/* Rotated tag chips */}
      <span className="absolute -left-2 top-2 -rotate-6 rounded-lg bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70 ring-1 ring-white/15 backdrop-blur-sm">
        Verified
      </span>
      <span className="absolute right-6 top-28 rotate-3 rounded-lg bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70 ring-1 ring-white/15 backdrop-blur-sm">
        No Fees
      </span>
      <span className="absolute bottom-32 left-2 -rotate-3 rounded-lg bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70 ring-1 ring-white/15 backdrop-blur-sm">
        UAE-Wide
      </span>

      {/* Card 1 — live jobs counter (top) */}
      <div className="absolute right-2 top-0 w-60 rounded-2xl bg-card p-4 shadow-soft-xl ring-1 ring-black/5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white">
            <Briefcase className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="text-lg font-semibold text-foreground">{stats.totalJobs}+</p>
            <p className="text-[11px] text-muted-foreground">Verified openings live</p>
          </div>
        </div>
      </div>

      {/* Card 2 — scanning employers (middle, offset left) */}
      <div className="absolute left-0 top-[168px] w-64 rounded-2xl bg-card p-4 shadow-soft-xl ring-1 ring-black/5">
        <div className="mb-2.5 flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-badge-blue text-badge-blue-foreground">
            <ScanSearch className="h-4 w-4" />
          </span>
          <p className="text-xs font-semibold text-foreground">Checking official sources</p>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-2/3 rounded-full bg-brand-gradient" />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">{stats.totalCompanies}+ employers tracked</p>
      </div>

      {/* Card 3 — verified sourcing (bottom right) */}
      <div className="absolute bottom-0 right-6 w-56 rounded-2xl bg-card p-4 shadow-soft-xl ring-1 ring-black/5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-badge-green text-badge-green-foreground">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">Sourced from employer</p>
            <p className="text-[11px] text-muted-foreground">Direct apply, zero fees</p>
          </div>
        </div>
      </div>

      {/* Small trend accent */}
      <div className="absolute bottom-20 left-16 flex h-11 w-11 items-center justify-center rounded-full bg-badge-purple text-badge-purple-foreground shadow-soft-lg ring-4 ring-slate-900/40">
        <TrendingUp className="h-5 w-5" />
      </div>
    </div>
  );
}
