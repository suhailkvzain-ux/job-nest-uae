import { Layers } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RelatedCategoriesSection } from "@/components/categories/related-categories-section";
import { EntityJobsFilterSidebar } from "@/components/filters/entity-jobs-filter-sidebar";
import { MobileFilterDrawer } from "@/components/filters/mobile-filter-drawer";
import { JobsResults } from "@/components/jobs/jobs-results";
import { JobsSearchBar } from "@/components/jobs/jobs-search-bar";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { AdPlaceholder } from "@/components/shared/ad-placeholder";
import { EntityDetailHeader } from "@/components/shared/entity-detail-header";
import { JsonLd } from "@/components/shared/json-ld";
import { StickySidebar } from "@/components/shared/sticky-sidebar";
import { siteConfig } from "@/constants/site";
import { countActiveFilters, parseJobsSearchParams, type RawSearchParams } from "@/lib/jobs-url";
import { constructMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import type { JobSort } from "@/lib/validations/job";
import { getCategoryBySlug, getCategoryJobCount, getRelatedCategories } from "@/services/categories.service";
import { filterJobs } from "@/services/jobs.service";

export const revalidate = 60;

/** Category/location/company detail pages only offer this 3-option subset of the full `/jobs` sort list, per spec. */
const ENTITY_SORT_OPTIONS: { label: string; value: JobSort }[] = [
  { label: "Newest", value: "newest" },
  { label: "Highest Salary", value: "salary_desc" },
  { label: "A–Z", value: "az" },
];

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}

export async function generateMetadata({ params }: CategoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return constructMetadata({ title: "Category Not Found", noIndex: true, path: `/categories/${slug}` });
  }

  return constructMetadata({
    title: `${category.name} Jobs in the UAE`,
    description: `Browse verified ${category.name} job vacancies across the UAE. Apply directly on the employer's official website or email — Job Nest UAE.`,
    path: `/categories/${category.slug}`,
  });
}

/**
 * Category landing page — effectively a pre-scoped `/jobs` view (same
 * `filterJobs()`/`JobsResults`/pagination machinery) plus a header,
 * related-categories rail, and a trimmed 6-facet filter sidebar. The
 * category itself is never a URL query param here — it's the route
 * segment — so `urlFilters` (parsed straight from the query string)
 * never carries a `categorySlugs` value, keeping every search/filter/
 * sort/pagination link clean (`/categories/marketing?type=full-time`,
 * not `?category=marketing&type=full-time`). `queryFilters` re-adds the
 * category scope only for the actual database query.
 */
export default async function CategoryDetailPage({ params, searchParams }: CategoryDetailPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const urlFilters = parseJobsSearchParams(await searchParams);
  const queryFilters = { ...urlFilters, categorySlugs: [category.slug] };
  const basePath = `/categories/${category.slug}`;

  const [results, totalJobs, relatedCategories] = await Promise.all([
    filterJobs(queryFilters),
    getCategoryJobCount(category.id),
    getRelatedCategories(category.id),
  ]);

  const activeFilterCount = countActiveFilters(urlFilters);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: siteConfig.url },
          { name: "Categories", url: `${siteConfig.url}/categories` },
          { name: category.name, url: `${siteConfig.url}${basePath}` },
        ])}
      />

      <EntityDetailHeader
        breadcrumbItems={[{ label: "Categories", href: "/categories" }, { label: category.name }]}
        title={`${category.name} Jobs`}
        description={`Verified ${category.name} job vacancies across the UAE, updated daily.`}
        totalJobs={totalJobs}
        icon={Layers}
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

          {relatedCategories.length > 0 && <RelatedCategoriesSection categories={relatedCategories} />}
        </Container>
      </Section>
    </>
  );
}
