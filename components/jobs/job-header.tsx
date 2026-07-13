import { FeaturedBadge, NewBadge, VerifiedBadge } from "@/components/badges/status-badges";
import { JobMeta } from "@/components/jobs/job-meta";
import {
  DeadlineBadge,
  EducationBadge,
  LanguagesBadge,
  NationalityBadge,
  VacanciesBadge,
  VisaStatusBadge,
} from "@/components/jobs/job-meta-badges";
import { Heading } from "@/components/typography/heading";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { JobWithRelations } from "@/services/jobs.service";

/**
 * Job detail page header — title, company, Verified/Featured/New
 * badges, and every quick fact called out in the spec. The primary
 * `JobMeta` row (Employment Type / Salary / Experience / Location /
 * Posted Time) is shared with job cards elsewhere on the site; the
 * second row below adds the detail-page-only facts (Education, Visa
 * Status, Nationality, Languages, Vacancies, Application Deadline) —
 * each badge quietly renders nothing when the underlying field is empty,
 * so the row never shows an empty/placeholder chip.
 */
export function JobHeader({ job }: { job: JobWithRelations }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 rounded-2xl border border-border/60 shadow-soft">
          <AvatarFallback className="rounded-2xl text-lg">
            {job.company.name
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {job.featured && <FeaturedBadge />}
            {job.verified && <VerifiedBadge />}
            {job.publishedAt && <NewBadge postedAt={job.publishedAt} />}
          </div>
          <Heading level="h2" as="h1">
            {job.title}
          </Heading>
          <p className="text-muted-foreground">{job.company.name}</p>
        </div>
      </div>

      <JobMeta job={job} />

      <div className="flex flex-wrap items-center gap-2">
        <EducationBadge education={job.education} />
        <VisaStatusBadge visaStatus={job.visaStatus} />
        <NationalityBadge nationality={job.nationality} />
        <LanguagesBadge languages={job.languages} />
        <VacanciesBadge vacancies={job.vacancies} />
        <DeadlineBadge deadline={job.applicationDeadline} />
      </div>
    </div>
  );
}
