import type { Metadata } from "next";

import { AdSlot } from "@/components/ads/ad-slot";
import { MobileFilterDrawer } from "@/components/filters/mobile-filter-drawer";
import { JobsFilterSidebar } from "@/components/jobs/jobs-filter-sidebar";
import { JobsPageHeader } from "@/components/jobs/jobs-page-header";
import { JobsResults } from "@/components/jobs/jobs-results";
import { JobsSearchBar } from "@/components/jobs/jobs-search-bar";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { JsonLd } from "@/components/shared/json-ld";
import { StickySidebar } from "@/components/shared/sticky-sidebar";
import { buildJobsQueryString, countActiveFilters, parseJobsSearchParams, type RawSearchParams } from "@/lib/jobs-url";
import { generateMetadata as buildMetadata } from "@/lib/seo";
import { buildBreadcrumbSchema } from "@/lib/seo/json-ld";
import { getSiteMetadataDefaults } from "@/lib/seo/site-metadata";
import type { JobSearchInput } from "@/lib/validations/job";
import { getCategoriesWithJobCounts } from "@/services/categories.service";
import { getCompaniesWithJobCounts } from "@/services/companies.service";
import {
  filterJobs,
  getDistinctEducationValues,
  getDistinctVisaStatusValues,
  getPublishedJobsCount,
} from "@/services/jobs.service";
import { getLocationsWithJobCounts } from "@/services/locations.service";
import { humanizeSlug } from "@/utils/format";

// This page's content depends entirely on the query string, so it isn't
// a candidate for static generation — but each distinct filter
// combination is still cached by Next's Data Cache / Full Route Cache
// for a minute at a time, keeping repeat visits (pagination, going back)
// fast without hitting the database on every request.
export const revalidate = 60;

interface JobsPageProps {
  searchParams: Promise<RawSearchParams>;
}

/** Builds a dynamic, human-readable page title from the active filters. */
function buildDynamicTitle(filters: JobSearchInput): string {
  const parts: string[] = [];
  if (filters.query) parts.push(`"${filters.query}"`);
  if (filters.categorySlugs.length > 0) parts.push(filters.categorySlugs.map(humanizeSlug).join(", "));
  parts.push("Jobs");
  parts.push(
    filters.locationSlugs.length > 0 ? `in ${filters.locationSlugs.map(humanizeSlug).join(", ")}` : "in the UAE",
  );
  const base = parts.join(" ");
  return filters.page > 1 ? `${base} — Page ${filters.page}` : base;
}

export async function generateMetadata({ searchParams }: JobsPageProps): Promise<Metadata> {
  const filters = parseJobsSearchParams(await searchParams);
  const title = buildDynamicTitle(filters);

  return buildMetadata({
    title,
    description: `Browse ${title.toLowerCase()} — verified vacancies from official employer sources on Job For UAE. Apply directly on the employer's website or email.`,
    path: `/jobs${buildJobsQueryString(filters)}`,
  });
}

/**
 * All Jobs — the central browse/search/filter hub. Server-rendered from
 * the URL's query string on every request (filters are URL state, not
 * client state), so every combination is a real, shareable, crawlable
 * URL: `/jobs?location=dubai&category=engineering&type=full-time`.
 */
export default async function JobsPage({ searchParams }: JobsPageProps) {
  const filters = parseJobsSearchParams(await searchParams);

  const [results, totalPublished, locations, categories, companies, educationOptions, visaStatusOptions, defaults] =
    await Promise.all([
      filterJobs(filters),
      getPublishedJobsCount(),
      getLocationsWithJobCounts(),
      getCategoriesWithJobCounts(),
      getCompaniesWithJobCounts(100),
      getDistinctEducationValues(),
      getDistinctVisaStatusValues(),
      getSiteMetadataDefaults(),
    ]);

  const activeFilterCount = countActiveFilters(filters);

  const locationOptions = locations.map((l) => ({ name: l.name, slug: l.slug, jobCount: l.jobCount }));
  const categoryOptions = categories.map((c) => ({ name: c.name, slug: c.slug, jobCount: c.jobCount }));
  const companyOptions = companies.map((c) => ({ name: c.name, slug: c.slug, jobCount: c.jobCount }));

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", url: defaults.baseUrl },
          { name: "All Jobs", url: `${defaults.baseUrl}/jobs` },
        ])}
      />

      <JobsPageHeader totalJobs={totalPublished} />
      <JobsSearchBar />

      <Section spacing="compact">
        <Container className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4 lg:hidden">
            <MobileFilterDrawer activeCount={activeFilterCount}>
              <JobsFilterSidebar
                initialFilters={filters}
                locations={locationOptions}
                categories={categoryOptions}
                companies={companyOptions}
                educationOptions={educationOptions}
                visaStatusOptions={visaStatusOptions}
              />
            </MobileFilterDrawer>
          </div>

          <AdSlot position="JOBS_LISTING_TOP" />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block" aria-label="Job filters">
              <StickySidebar>
                <JobsFilterSidebar
                  initialFilters={filters}
                  locations={locationOptions}
                  categories={categoryOptions}
                  companies={companyOptions}
                  educationOptions={educationOptions}
                  visaStatusOptions={visaStatusOptions}
                />
              </StickySidebar>
            </aside>

            <div className="min-w-0">
              <JobsResults results={results} filters={filters} />
            </div>
          </div>

          <AdSlot position="JOBS_LISTING_BOTTOM" />
        </Container>
      </Section>
    </>
  );
}
