import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { trackEmailClickAction, trackShareClickAction, trackWebsiteClickAction } from "@/actions/analytics.actions";
import { JobDetails } from "@/components/jobs/job-details";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { AdPlaceholder } from "@/components/shared/ad-placeholder";
import { JsonLd } from "@/components/shared/json-ld";
import { siteConfig } from "@/constants/site";
import { constructMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jobPostingJsonLd, organizationJsonLd } from "@/lib/seo/json-ld";
import { getJobBySlug, getRelatedJobs, incrementViewCount } from "@/services/jobs.service";
import { truncate } from "@/utils/format";

interface JobDetailPageProps {
  params: Promise<{ slug: string }>;
}

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
    return constructMetadata({ title: "Job Not Found", noIndex: true, path: `/jobs/${slug}` });
  }

  const title = job.metaTitle ?? `${job.title} at ${job.company.name}`;
  const description =
    job.metaDescription ??
    `${truncate(job.description, 150)} Apply directly on ${job.company.name}'s official website or email — Job Nest UAE.`;

  return constructMetadata({
    title,
    description,
    path: `/jobs/${job.slug}`,
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

  const [relatedJobs] = await Promise.all([
    getRelatedJobs(job.id, 6),
    incrementViewCount(job.id).catch(() => undefined),
  ]);

  const jobUrl = `${siteConfig.url}/jobs/${job.slug}`;

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: siteConfig.url },
          { name: "All Jobs", url: `${siteConfig.url}/jobs` },
          { name: job.title, url: jobUrl },
        ])}
      />
      <JsonLd data={jobPostingJsonLd(job, jobUrl)} />

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
          <AdPlaceholder size="leaderboard" className="mx-auto hidden sm:flex" />
          <AdPlaceholder size="banner" className="mx-auto flex sm:hidden" />

          <JobDetails
            job={job}
            relatedJobs={relatedJobs}
            jobUrl={jobUrl}
            middleAd={<AdPlaceholder size="leaderboard" className="mx-auto" />}
            onWebsiteClick={trackWebsiteClickAction.bind(null, job.id)}
            onEmailClick={trackEmailClickAction.bind(null, job.id)}
            onShare={trackShareClickAction.bind(null, job.id)}
          />

          <AdPlaceholder size="leaderboard" className="mx-auto hidden sm:flex" />
          <AdPlaceholder size="banner" className="mx-auto flex sm:hidden" />
        </Container>
      </Section>
    </>
  );
}
