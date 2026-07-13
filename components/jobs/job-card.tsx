import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { FeaturedBadge, NewBadge, VerifiedBadge } from "@/components/badges/status-badges";
import { JobMeta } from "@/components/jobs/job-meta";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { JobWithRelations } from "@/services/jobs.service";
import { truncate } from "@/utils/format";

export function CompanyInitial({ name }: { name: string }) {
  return (
    <AvatarFallback className="rounded-2xl">
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

/** Standard job card — the default card used in job grids/lists. */
export function JobCard({ job, className }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.slug}`} className="block h-full">
      <Card className={cn("group flex h-full flex-col transition-all hover:-translate-y-0.5 hover:shadow-soft-lg", className)}>
        <CardContent className="flex flex-1 flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 rounded-2xl">
                <CompanyInitial name={job.company.name} />
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold leading-tight text-foreground group-hover:text-primary">
                  {job.title}
                </span>
                <span className="text-sm text-muted-foreground">{job.company.name}</span>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {job.featured && <FeaturedBadge />}
            {job.verified && <VerifiedBadge />}
            {job.publishedAt && <NewBadge postedAt={job.publishedAt} />}
          </div>

          <p className="text-sm text-muted-foreground">{truncate(job.description, 120)}</p>

          <JobMeta job={job} className="mt-auto pt-1" />
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
            <span className="truncate font-medium text-foreground group-hover:text-primary">{job.title}</span>
            <span className="truncate text-xs text-muted-foreground">
              {job.company.name} · {job.location.name}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/** Elevated variant for the homepage's "Featured Jobs" section. */
export function FeaturedJobCard({ job, className }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.slug}`} className="block h-full">
      <Card
        className={cn(
          "group relative flex h-full flex-col overflow-hidden border-primary/20 bg-brand-gradient-soft transition-all hover:-translate-y-1 hover:shadow-soft-xl",
          className,
        )}
      >
        <CardContent className="flex flex-1 flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <FeaturedBadge />
            <ArrowUpRight className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 rounded-2xl border border-white/60 shadow-soft">
              <CompanyInitial name={job.company.name} />
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold leading-tight text-foreground">{job.title}</span>
              <span className="text-sm text-muted-foreground">{job.company.name}</span>
            </div>
          </div>

          <JobMeta job={job} className="mt-auto pt-1" />
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
          <span className="font-medium leading-tight text-foreground group-hover:text-primary">{job.title}</span>
          <span className="text-xs text-muted-foreground">{job.company.name}</span>
          <JobMeta job={job} className="pt-1" />
        </CardContent>
      </Card>
    </Link>
  );
}
