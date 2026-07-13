import { EmploymentTypeBadge } from "@/components/badges/status-badges";
import {
  ExperienceBadge,
  LocationBadge,
  PostedTimeBadge,
  SalaryBadge,
} from "@/components/jobs/job-meta-badges";
import { cn } from "@/lib/utils";
import type { JobWithRelations } from "@/services/jobs.service";

/**
 * Composed row of a job's key facts — employment type, salary,
 * experience, location, and posted time. Used on both job cards and the
 * job detail header, so the same facts always render in the same order.
 */
export function JobMeta({ job, className }: { job: JobWithRelations; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <EmploymentTypeBadge type={job.employmentType} />
      <SalaryBadge min={job.salaryMin} max={job.salaryMax} currency={job.salaryCurrency} />
      <ExperienceBadge experience={job.experience} />
      <LocationBadge location={job.location.name} />
      {job.publishedAt && <PostedTimeBadge date={job.publishedAt} />}
    </div>
  );
}
