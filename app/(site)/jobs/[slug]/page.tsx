import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { trackEmailClickAction, trackShareClickAction, trackWebsiteClickAction } from "@/actions/analytics.actions";
import { AdSlot } from "@/components/ads/ad-slot";
import { JobDetails } from "@/components/jobs/job-details";
import { JobViewTracker } from "@/components/jobs/job-view-tracker";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { JsonLd } from "@/components/shared/json-ld";
import { generateMetadata as buildMetadata } from "@/lib/seo";
import { buildBreadcrumbSchema, buildJobPostingSchema, buildOrganizationSchema } from "@/lib/seo/json-ld";
import { getSiteMetadataDefaults } from "@/lib/seo/site-metadata";
import { getJobBySlug, getRelatedJobs } from "@/services/jobs.service";
import { truncate } from "@/utils/format";

interface JobDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Phase 15: safe to ISR-cache now that view tracking fires from the
// client (`<JobViewTracker>`) instead of inside this Server Component's
// own render — see `trackJobViewAction`'s doc comment for why that
// previously forced this route fully dynamic.
export const revalidate = 60;

/**
 * React `cache()` de-dupes this exact call within a single request, so
 * `generateMetadata` and the page component (which both need the same
 * job) only hit the database once per render — the standard Next.js
 * pattern for sharing data between the two without a second round trip.
 */
const getJob = cache(async (slug: string) => getJobBySlug(slug));

/** A published job whose deadline has passed is treated as gone, same as draft/archived/deleted. */
function isExpired(applicationDeadline: Date | null): boolean {
  return Boolean(applicationDeadline && applicationDeadline.getTime() < Date.now());
}

async function getVisibleJob(slug: string) {
  const job = await getJob(slug);
  if (!job || job.status !== "PUBLISHED" || isExpired(job.applicationDeadline)) {
    return null;
  }
  return job;
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getVisibleJob(slug);

  if (!job) {
    return buildMetadata({ title: "Job Not Found", noIndex: true, path: `/jobs/${slug}` });
  }

  const title = job.metaTitle ?? `${job.title} at ${job.company.name}`;
  const description =
    job.metaDescription ??
    `${truncate(job.description, 150)} Apply directly on ${job.company.name}'s official website or email — Job Nest UAE.`;

  return buildMetadata({
    title,
    description,
    path: `/jobs/${job.slug}`,
    // Falls back to `title`/`description` above when the admin hasn't
    // set a separate Open Graph override for this job.
    ogTitle: job.ogTitle ?? undefined,
    ogDescription: job.ogDescription ?? undefined,
  });
}

/**
 * Single Job Details page — displays one verified UAE vacancy end to
 * end (header, full content, sticky apply card, company info, share,
 * related jobs) and always sends the candidate to the employer's own
 * site/email. Draft, archived, soft-deleted, scheduled, and
 * past-deadline jobs all 404 via the same `getVisibleJob` check used by
 * both `generateMetadata` and the page body.
 */
export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { slug } = await params;
  const job = await getVisibleJob(slug);

  if (!job) {
    notFound();
  }

  const [relatedJobs, organizationSchema, defaults] = await Promise.all([
    getRelatedJobs(job.id, 6),
    buildOrganizationSchema(),
    getSiteMetadataDefaults(),
  ]);
  const jobUrl = `${defaults.baseUrl}/jobs/${job.slug}`;

  return (
    <>
      <JobViewTracker jobId={job.id} />
      <JsonLd data={organizationSchema} />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", url: defaults.baseUrl },
          { name: "All Jobs", url: `${defaults.baseUrl}/jobs` },
          { name: job.title, url: jobUrl },
        ])}
      />
      <JsonLd data={buildJobPostingSchema(job, jobUrl)} />

      <Section spacing="compact" className="border-b border-border/60 bg-surface pt-6">
        <Container>
          <Breadcrumb
            items={[
              { label: "All Jobs", href: "/jobs" },
              { label: job.title },
            ]}
          />
        </Container>
      </Section>

      <Section spacing="compact">
        <Container className="flex flex-col gap-8">
          <AdSlot position="SINGLE_JOB_TOP" />

          <JobDetails
            job={job}
            relatedJobs={relatedJobs}
            jobUrl={jobUrl}
            middleAd={<AdSlot position="SINGLE_JOB_MIDDLE" />}
            onWebsiteClick={trackWebsiteClickAction.bind(null, job.id)}
            onEmailClick={trackEmailClickAction.bind(null, job.id)}
            onShare={trackShareClickAction.bind(null, job.id)}
          />

          <AdSlot position="SINGLE_JOB_BOTTOM" />
        </Container>
      </Section>
    </>
  );
}
