import { ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";

import { EmploymentTypeBadge, FeaturedBadge, NewBadge } from "@/components/badges/status-badges";
import { JobMeta } from "@/components/jobs/job-meta";
import { SalaryBadge } from "@/components/jobs/job-meta-badges";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { JobWithRelations } from "@/services/jobs.service";
import { formatJobLocation } from "@/utils/format";

const AVATAR_TINTS = [
  "bg-blue-100 text-blue-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700",
];

function tintForName(name: string) {
  const sum = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_TINTS[sum % AVATAR_TINTS.length];
}

export function CompanyInitial({ name }: { name: string }) {
  return (
    <AvatarFallback className={cn("rounded-xl font-semibold", tintForName(name))}>
      {name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()}
    </AvatarFallback>
  );
}

export interface JobCardProps {
  job: JobWithRelations;
  className?: string;
}

/**
 * Standard job card — the default card used in job grids/lists. Kept
 * intentionally compact (no description snippet, no bookmark/save
 * button) so two of these fit per row on mobile without turning the
 * homepage into a long scroll: logo + title/company, one salary +
 * employment-type line, one location line.
 */
export function JobCard({ job, className }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.slug}`} className="block h-full">
      <Card
        className={cn(
          "group relative flex h-full flex-col transition-all hover:-translate-y-0.5 hover:shadow-soft-lg",
          className,
        )}
      >
        <div className="absolute right-2 top-2 flex items-center gap-1">
          {job.publishedAt && <NewBadge postedAt={job.publishedAt} className="px-1.5 py-0.5 text-[10px]" />}
          <SaveJobButton jobId={job.id} className="bg-card/80 backdrop-blur-sm" />
        </div>
        <CardContent className="flex flex-1 flex-col gap-2.5 p-3.5 sm:gap-3 sm:p-5">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <Avatar className="h-9 w-9 shrink-0 rounded-xl sm:h-11 sm:w-11 sm:rounded-2xl">
              <CompanyInitial name={job.company.name} />
            </Avatar>
            <div className="flex min-w-0 flex-col pt-0.5">
              <span className="truncate text-sm font-semibold leading-tight text-foreground group-hover:text-primary sm:text-base">
                {job.title}
              </span>
              <span className="truncate text-xs text-muted-foreground sm:text-sm">{job.company.name}</span>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-1 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <SalaryBadge
                min={job.salaryMin}
                max={job.salaryMax}
                currency={job.salaryCurrency}
                className="px-1.5 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-xs"
              />
              <EmploymentTypeBadge type={job.employmentType} className="px-1.5 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-xs" />
            </div>
            <span className="flex items-center gap-1 truncate text-[11px] text-muted-foreground sm:text-xs">
              <MapPin className="h-3 w-3 shrink-0" /> {formatJobLocation(job)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/** Denser variant for narrow lists / sidebars (e.g. related jobs rail). */
export function CompactJobCard({ job, className }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.slug}`} className="block">
      <Card className={cn("group transition-shadow hover:shadow-soft-lg", className)}>
        <CardContent className="flex items-center gap-3 p-4">
          <Avatar className="h-10 w-10 rounded-xl">
            <CompanyInitial name={job.company.name} />
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-medium text-foreground group-hover:text-primary">
              {job.title}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {job.company.name} · {formatJobLocation(job)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/** Elevated variant for the homepage's "Featured/Top Jobs" swipeable row — compact so several fit per swipe. */
export function FeaturedJobCard({ job, className }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.slug}`} className="block h-full">
      <Card
        className={cn(
          "group relative flex h-full flex-col overflow-hidden border-primary/20 bg-brand-gradient-soft transition-all hover:-translate-y-1 hover:shadow-soft-xl",
          className,
        )}
      >
        <CardContent className="flex flex-1 flex-col gap-2.5 p-4 sm:gap-4 sm:p-6">
          <div className="flex items-center justify-between">
            <FeaturedBadge className="px-1.5 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-xs" />
            <div className="flex items-center gap-1">
              <SaveJobButton jobId={job.id} />
              <ArrowUpRight className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Avatar className="h-10 w-10 rounded-xl border border-white/60 shadow-soft sm:h-12 sm:w-12 sm:rounded-2xl">
              <CompanyInitial name={job.company.name} />
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold leading-tight text-foreground sm:text-base">{job.title}</span>
              <span className="truncate text-xs text-muted-foreground sm:text-sm">{job.company.name}</span>
            </div>
          </div>

          <JobMeta job={job} className="mt-auto pt-1 [&>*]:text-[10px] sm:[&>*]:text-xs" />
        </CardContent>
      </Card>
    </Link>
  );
}

/** Minimal variant for "similar jobs" rails on the job detail page. */
export function SimilarJobCard({ job, className }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.slug}`} className="block">
      <Card className={cn("group transition-shadow hover:shadow-soft", className)}>
        <CardContent className="flex flex-col gap-2 p-5">
          <span className="font-medium leading-tight text-foreground group-hover:text-primary">
            {job.title}
          </span>
          <span className="text-xs text-muted-foreground">{job.company.name}</span>
          <JobMeta job={job} className="pt-1" />
        </CardContent>
      </Card>
    </Link>
  );
}
