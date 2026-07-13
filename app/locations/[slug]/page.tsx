import { MapPinned } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EntityJobsFilterSidebar } from "@/components/filters/entity-jobs-filter-sidebar";
import { MobileFilterDrawer } from "@/components/filters/mobile-filter-drawer";
import { JobsResults } from "@/components/jobs/jobs-results";
import { JobsSearchBar } from "@/components/jobs/jobs-search-bar";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { RelatedLocationsSection } from "@/components/locations/related-locations-section";
import { AdPlaceholder } from "@/components/shared/ad-placeholder";
import { EntityDetailHeader } from "@/components/shared/entity-detail-header";
import { JsonLd } from "@/components/shared/json-ld";
import { StickySidebar } from "@/components/shared/sticky-sidebar";
import { siteConfig } from "@/constants/site";
import { countActiveFilters, parseJobsSearchParams, type RawSearchParams } from "@/lib/jobs-url";
import { constructMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import type { JobSort } from "@/lib/validations/job";
import { filterJobs } from "@/services/jobs.service";
import { getLocationBySlug, getLocationJobCount, getRelatedLocations } from "@/services/locations.service";

export const revalidate = 60;

const ENTITY_SORT_OPTIONS: { label: string; value: JobSort }[] = [
  { label: "Newest", value: "newest" },
  { label: "Highest Salary", value: "salary_desc" },
  { label: "A–Z", value: "az" },
];

interface LocationDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}

export async function generateMetadata({ params }: LocationDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);

  if (!location) {
    return constructMetadata({ title: "Location Not Found", noIndex: true, path: `/locations/${slug}` });
  }

  return constructMetadata({
    title: `Jobs in ${location.name}`,
    description: `Browse verified job vacancies in ${location.name}, UAE. Apply directly on the employer's official website or email — Job Nest UAE.`,
    path: `/locations/${location.slug}`,
  });
}

/** Location landing page — same pre-scoped `/jobs` pattern as the category detail page, scoped to `locationSlugs` instead. */
export default async function LocationDetailPage({ params, searchParams }: LocationDetailPageProps) {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);

  if (!location) {
    notFound();
  }

  const urlFilters = parseJobsSearchParams(await searchParams);
  const queryFilters = { ...urlFilters, locationSlugs: [location.slug] };
  const basePath = `/locations/${location.slug}`;

  const [results, totalJobs, relatedLocations] = await Promise.all([
    filterJobs(queryFilters),
    getLocationJobCount(location.id),
    getRelatedLocations(location.id),
  ]);

  const activeFilterCount = countActiveFilters(urlFilters);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: siteConfig.url },
          { name: "Locations", url: `${siteConfig.url}/locations` },
          { name: location.name, url: `${siteConfig.url}${basePath}` },
        ])}
      />

      <EntityDetailHeader
        breadcrumbItems={[{ label: "Locations", href: "/locations" }, { label: location.name }]}
        title={`Jobs in ${location.name}`}
        description={`Verified job vacancies in ${location.name}, UAE, updated daily.`}
        totalJobs={totalJobs}
        icon={MapPinned}
      />

      <JobsSearchBar />

      <Section spacing="compact">
        <Container className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4 lg:hidden">
            <MobileFilterDrawer activeCount={activeFilterCount}>
              <EntityJobsFilterSidebar initialFilters={urlFilters} />
            </MobileFilterDrawer>
          </div>

          <AdPlaceholder size="leaderboard" className="mx-auto hidden sm:flex" />
          <AdPlaceholder size="banner" className="mx-auto flex sm:hidden" />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block" aria-label="Job filters">
              <StickySidebar>
                <EntityJobsFilterSidebar initialFilters={urlFilters} />
              </StickySidebar>
            </aside>

            <div className="min-w-0">
              <JobsResults
                results={results}
                filters={urlFilters}
                basePath={basePath}
                sortOptions={ENTITY_SORT_OPTIONS}
              />
            </div>
          </div>

          <AdPlaceholder size="leaderboard" className="mx-auto hidden sm:flex" />

          {relatedLocations.length > 0 && <RelatedLocationsSection locations={relatedLocations} />}
        </Container>
      </Section>
    </>
  );
}
