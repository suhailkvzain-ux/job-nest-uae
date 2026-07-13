import { Globe } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ads/ad-slot";
import { RelatedCompaniesSection } from "@/components/companies/related-companies-section";
import { EntityJobsFilterSidebar } from "@/components/filters/entity-jobs-filter-sidebar";
import { MobileFilterDrawer } from "@/components/filters/mobile-filter-drawer";
import { JobsResults } from "@/components/jobs/jobs-results";
import { JobsSearchBar } from "@/components/jobs/jobs-search-bar";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { EntityDetailHeader } from "@/components/shared/entity-detail-header";
import { JsonLd } from "@/components/shared/json-ld";
import { StickySidebar } from "@/components/shared/sticky-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { countActiveFilters, parseJobsSearchParams, type RawSearchParams } from "@/lib/jobs-url";
import { generateMetadata as buildMetadata } from "@/lib/seo";
import { buildBreadcrumbSchema } from "@/lib/seo/json-ld";
import { getSiteMetadataDefaults } from "@/lib/seo/site-metadata";
import type { JobSort } from "@/lib/validations/job";
import { getCompanyBySlug, getCompanyJobCount, getRelatedCompanies } from "@/services/companies.service";
import { filterJobs } from "@/services/jobs.service";

export const revalidate = 60;

const ENTITY_SORT_OPTIONS: { label: string; value: JobSort }[] = [
  { label: "Newest", value: "newest" },
  { label: "Highest Salary", value: "salary_desc" },
  { label: "A–Z", value: "az" },
];

interface CompanyDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}

export async function generateMetadata({ params }: CompanyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) {
    return buildMetadata({ title: "Company Not Found", noIndex: true, path: `/companies/${slug}` });
  }

  return buildMetadata({
    title: `${company.name} Jobs`,
    description:
      company.description ??
      `Browse verified job vacancies at ${company.name} on Job Nest UAE. Apply directly on the employer's official website or email.`,
    path: `/companies/${company.slug}`,
  });
}

/**
 * Company landing page — same pre-scoped `/jobs` pattern as the category/
 * location detail pages, scoped to `companySlugs`. Unlike those two, the
 * header uses a real generated initials avatar (no logo uploads
 * anywhere on this site) and the company's own `description`/`website`
 * fields, which — unlike Category/Location — genuinely exist on the
 * Company model.
 */
export default async function CompanyDetailPage({ params, searchParams }: CompanyDetailPageProps) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const urlFilters = parseJobsSearchParams(await searchParams);
  const queryFilters = { ...urlFilters, companySlugs: [company.slug] };
  const basePath = `/companies/${company.slug}`;

  const [results, totalJobs, relatedCompanies, defaults] = await Promise.all([
    filterJobs(queryFilters),
    getCompanyJobCount(company.id),
    getRelatedCompanies(company.id),
    getSiteMetadataDefaults(),
  ]);

  const activeFilterCount = countActiveFilters(urlFilters);
  const initials = company.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", url: defaults.baseUrl },
          { name: "Companies", url: `${defaults.baseUrl}/companies` },
          { name: company.name, url: `${defaults.baseUrl}${basePath}` },
        ])}
      />

      <EntityDetailHeader
        breadcrumbItems={[{ label: "Companies", href: "/companies" }, { label: company.name }]}
        title={company.name}
        description={company.description}
        totalJobs={totalJobs}
        avatar={
          <Avatar className="h-14 w-14 shrink-0 rounded-2xl border border-border/60 shadow-soft">
            <AvatarFallback className="rounded-2xl text-base">{initials}</AvatarFallback>
          </Avatar>
        }
        meta={
          company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer noopener"
              className="flex w-fit items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Globe className="h-3.5 w-3.5" /> Official website
            </a>
          )
        }
      />

      <JobsSearchBar />

      <Section spacing="compact">
        <Container className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4 lg:hidden">
            <MobileFilterDrawer activeCount={activeFilterCount}>
              <EntityJobsFilterSidebar initialFilters={urlFilters} />
            </MobileFilterDrawer>
          </div>

          <AdSlot position="COMPANY_PAGE" />

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

          <AdSlot position="COMPANY_PAGE" />

          {relatedCompanies.length > 0 && <RelatedCompaniesSection companies={relatedCompanies} />}
        </Container>
      </Section>
    </>
  );
}
