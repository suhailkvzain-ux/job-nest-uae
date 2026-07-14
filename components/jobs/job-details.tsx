import { AdSlot } from "@/components/ads/ad-slot";
import { ApplyCard } from "@/components/jobs/apply-card";
import { CompanyInfoCard } from "@/components/jobs/company-info-card";
import {
  BenefitsList,
  JobDescription,
  RequirementsList,
  ResponsibilitiesList,
} from "@/components/jobs/job-content";
import { JobHeader } from "@/components/jobs/job-header";
import { JobInformationCard } from "@/components/jobs/job-info-card";
import { RelatedJobs } from "@/components/jobs/related-jobs";
import { ShareJobCard } from "@/components/jobs/share-job-card";
import { Divider } from "@/components/layout/divider";
import { Stack } from "@/components/layout/stack";
import { StickySidebar } from "@/components/shared/sticky-sidebar";
import type { JobWithRelations } from "@/services/jobs.service";

interface JobDetailsProps {
  job: JobWithRelations;
  relatedJobs?: JobWithRelations[];
  jobUrl: string;
  /** Rendered between the job content and the related-jobs rail — the spec's "Middle Banner" slot. */
  middleAd?: React.ReactNode;
  onWebsiteClick?: () => void;
  onEmailClick?: () => void;
  onShare?: (channel: string) => void;
}

/**
 * Full job detail page composition — combines every job-domain
 * component into the two-column layout (content + sticky sidebar) used
 * by `/jobs/[slug]`. Exists here as the single place that layout is
 * decided, so the page component itself stays a thin data-fetching
 * wrapper. `onWebsiteClick`/`onEmailClick`/`onShare` are expected to be
 * Server Actions bound with the job's id (see `actions/analytics.actions.ts`),
 * passed straight through from the page.
 */
export function JobDetails({ job, relatedJobs = [], jobUrl, middleAd, onWebsiteClick, onEmailClick, onShare }: JobDetailsProps) {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
      <Stack gap="xl" className="min-w-0">
        <JobHeader job={job} />
        <Divider />
        <JobDescription description={job.description} />
        {job.responsibilities && <ResponsibilitiesList responsibilities={job.responsibilities} />}
        {job.requirements && <RequirementsList requirements={job.requirements} />}
        {job.benefits && <BenefitsList benefits={job.benefits} />}

        {middleAd && (
          <>
            <Divider />
            {middleAd}
          </>
        )}

        {/* Mobile-only Apply card: on small screens this grid stacks into a
            single column, so the sidebar (with its own ApplyCard below)
            would otherwise render entirely *after* Similar Jobs — putting
            the primary CTA underneath a wall of unrelated job cards. This
            duplicate is shown only below `lg`, right before Similar Jobs,
            so mobile visitors see Apply first; the sidebar's copy stays
            `hidden` on mobile (see below) so it isn't shown twice. */}
        <div className="lg:hidden">
          <ApplyCard
            officialWebsite={job.officialWebsite}
            officialEmail={job.officialEmail}
            applicationDeadline={job.applicationDeadline}
            vacancies={job.vacancies}
            jobTitle={job.title}
            onWebsiteClick={onWebsiteClick}
            onEmailClick={onEmailClick}
          />
        </div>

        {relatedJobs.length > 0 && (
          <>
            <Divider />
            <RelatedJobs jobs={relatedJobs} />
          </>
        )}
      </Stack>

      <StickySidebar>
        <Stack gap="md">
          <div className="hidden lg:block">
            <ApplyCard
              officialWebsite={job.officialWebsite}
              officialEmail={job.officialEmail}
              applicationDeadline={job.applicationDeadline}
              vacancies={job.vacancies}
              jobTitle={job.title}
              onWebsiteClick={onWebsiteClick}
              onEmailClick={onEmailClick}
            />
          </div>
          <JobInformationCard job={job} />
          <CompanyInfoCard company={job.company} />
          <ShareJobCard title={job.title} url={jobUrl} onShare={onShare} />
          {/* Desktop Sidebar ad slot — kept at the very bottom of the rail, well
              separated from the Apply buttons by three unrelated cards above it.
              Wrapped in `hidden lg:block` here because the sidebar column itself
              stacks below the main content on mobile (it isn't desktop-only) —
              only this specific slot is, matching the position's own name. */}
          <div className="hidden lg:block">
            <AdSlot position="DESKTOP_SIDEBAR" />
          </div>
        </Stack>
      </StickySidebar>
    </div>
  );
}
