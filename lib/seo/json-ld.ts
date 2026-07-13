import type { EmploymentType } from "@prisma/client";

import { getSiteMetadataDefaults } from "@/lib/seo/site-metadata";
import type { JobWithRelations } from "@/services/jobs.service";

/**
 * Schema.org (JSON-LD) builders. Each returns a plain object — render
 * it with:
 *   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
 * (via the shared `<JsonLd>` component). Kept as pure data builders (no
 * JSX) so they can be unit tested and reused from any route, not just
 * the homepage. Named `build*Schema` per the Phase 14 spec's reusable-
 * helpers convention (`buildJobPostingSchema` is named explicitly in
 * the spec; the others follow the same convention for consistency).
 */

/** Organization schema — identifies Job Nest UAE itself to search engines. Sourced from `/admin/settings` (Website Name, uploaded Logo, Social Media links) via `getSiteMetadataDefaults()`, falling back to `constants/site.ts` for anything not yet configured. */
export async function buildOrganizationSchema() {
  const defaults = await getSiteMetadataDefaults();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: defaults.siteName,
    url: defaults.baseUrl,
    logo: defaults.logo,
    description: defaults.description,
    sameAs: [defaults.social.linkedin, defaults.social.instagram, defaults.social.twitter].filter(Boolean),
  };
}

/**
 * WebSite schema with a SearchAction — lets Google show a sitelinks
 * search box for the site directly in search results.
 */
export async function buildWebsiteSchema() {
  const defaults = await getSiteMetadataDefaults();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: defaults.siteName,
    url: defaults.baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${defaults.baseUrl}/jobs?query={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface BreadcrumbEntry {
  name: string;
  url: string;
}

/** BreadcrumbList schema — pass the full trail including the current page, e.g. Home → Jobs → Interior Designer → Dubai. */
export function buildBreadcrumbSchema(items: BreadcrumbEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Maps this project's `EmploymentType` enum onto schema.org's JobPosting
 * `employmentType` vocabulary (FULL_TIME / PART_TIME / CONTRACTOR /
 * TEMPORARY / INTERN / VOLUNTEER / PER_DIEM / OTHER). Our enum also
 * encodes *where* the work happens (REMOTE/HYBRID) rather than only
 * *how* it's contracted, which schema.org's vocabulary doesn't have a
 * slot for — those two map to FULL_TIME with `jobLocationType:
 * "TELECOMMUTE"` added separately for REMOTE roles below.
 */
const employmentTypeSchemaMap: Record<EmploymentType, string> = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACTOR",
  TEMPORARY: "TEMPORARY",
  INTERNSHIP: "INTERN",
  REMOTE: "FULL_TIME",
  HYBRID: "FULL_TIME",
  FREELANCE: "OTHER",
};

/**
 * Full Schema.org JobPosting structured data for `/jobs/[slug]`. Pass
 * the job (with its `company`/`category`/`location` relations already
 * included) and the canonical URL of the page.
 *
 * `directApply` is explicitly `false` — Job Nest UAE never hosts an
 * application form, every listing sends the candidate to the employer's
 * own site or inbox, which is exactly what Google's `directApply`
 * property is meant to distinguish. `identifier` uses the job's own
 * database id as a stable `PropertyValue`, per Google's JobPosting
 * guidelines. `applicantLocationRequirements` is included only for
 * remote roles ("if applicable", per the spec) since it's otherwise
 * implicit from `jobLocation`.
 */
export function buildJobPostingSchema(job: JobWithRelations, url: string) {
  const isRemote = job.employmentType === "REMOTE";

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    identifier: {
      "@type": "PropertyValue",
      name: "Job Nest UAE",
      value: job.id,
    },
    datePosted: job.publishedAt ? new Date(job.publishedAt).toISOString() : undefined,
    validThrough: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString() : undefined,
    employmentType: employmentTypeSchemaMap[job.employmentType],
    hiringOrganization: {
      "@type": "Organization",
      name: job.company.name,
      sameAs: job.company.website ?? undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location.name,
        addressCountry: "AE",
      },
    },
    ...(isRemote
      ? {
          jobLocationType: "TELECOMMUTE",
          applicantLocationRequirements: {
            "@type": "Country",
            name: "United Arab Emirates",
          },
        }
      : {}),
    ...(job.salaryMin || job.salaryMax
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: job.salaryCurrency,
            value: {
              "@type": "QuantitativeValue",
              minValue: job.salaryMin ?? undefined,
              maxValue: job.salaryMax ?? undefined,
              unitText: "MONTH",
            },
          },
        }
      : {}),
    directApply: false,
    url,
  };
}
