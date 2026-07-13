import Link from "next/link";

import { FeaturedBadge, NewBadge, VerifiedBadge } from "@/components/badges/status-badges";
import { ApplyButtons } from "@/components/jobs/apply-buttons";
import { CompanyInitial } from "@/components/jobs/job-card";
import { JobMeta } from "@/components/jobs/job-meta";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { JobWithRelations } from "@/services/jobs.service";
import { truncate } from "@/utils/format";

/**
 * Job card for the /jobs listing — unlike the homepage's whole-card-is-a-
 * link `JobCard`, this variant needs multiple independent interactive
 * elements (View Details, Apply on Website, Apply via Email), so only the
 * title itself is a link rather than wrapping the entire card.
 */
export function JobListCard({ job }: { job: JobWithRelations }) {
  return (
    <Card className="transition-shadow hover:shadow-soft-lg">
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 rounded-2xl">
              <CompanyInitial name={job.company.name} />
            </Avatar>
            <div className="flex flex-col">
              <Link
                href={`/jobs/${job.slug}`}
                className="font-semibold leading-tight text-foreground hover:text-primary hover:underline"
              >
                {job.title}
              </Link>
              <span className="text-sm text-muted-foreground">{job.company.name}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {job.featured && <FeaturedBadge />}
          {job.verified && <VerifiedBadge />}
          {job.publishedAt && <NewBadge postedAt={job.publishedAt} />}
        </div>

        <p className="text-sm text-muted-foreground">{truncate(job.description, 160)}</p>

        <JobMeta job={job} />

        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
          <Link
            href={`/jobs/${job.slug}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            View Details
          </Link>
          <ApplyButtons officialWebsite={job.officialWebsite} officialEmail={job.officialEmail} />
        </div>
      </CardContent>
    </Card>
  );
}
