import type { Metadata } from "next";
import { Suspense } from "react";

import { AdSlot } from "@/components/ads/ad-slot";
import { CareerResourcesSection } from "@/components/home/career-resources-section";
import { CategoryGridSection } from "@/components/home/category-grid-section";
import { CtaSection } from "@/components/home/cta-section";
import { FeaturedJobsSection } from "@/components/home/featured-jobs-section";
import { HeroSection } from "@/components/home/hero-section";
import {
  FeaturedJobsSkeleton,
  LatestJobsSkeleton,
  PopularCompaniesSkeleton,
} from "@/components/home/home-section-skeletons";
import { LatestJobsSection } from "@/components/home/latest-jobs-section";
import { LocationGridSection } from "@/components/home/location-grid-section";
import { PopularCompaniesSection } from "@/components/home/popular-companies-section";
import { WhyJobNestSection } from "@/components/home/why-jobnest-section";
import { JsonLd } from "@/components/shared/json-ld";
import { generateMetadata as buildMetadata } from "@/lib/seo";
import { buildBreadcrumbSchema, buildOrganizationSchema, buildWebsiteSchema } from "@/lib/seo/json-ld";
import { getSiteMetadataDefaults } from "@/lib/seo/site-metadata";
import { getCategoriesWithJobCounts } from "@/services/categories.service";
import { getCompaniesWithJobCounts } from "@/services/companies.service";
import { getFeaturedJobs, getLatestJobs } from "@/services/jobs.service";
import { getLocationsWithJobCounts } from "@/services/locations.service";
import { getHomeStats } from "@/services/stats.service";

// ISR — homepage data (job counts, latest listings) is refreshed every
// 60 seconds rather than on every request, so traffic spikes hit the
// Next.js cache instead of the database.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Find Verified Jobs Across the UAE",
    description:
      "Job For UAE is a job discovery platform publishing only verified vacancies sourced directly from official employers across Dubai, Abu Dhabi, Sharjah, and the rest of the UAE. Browse freely — apply directly on the employer's own site or email.",
    path: "/",
  });
}

/**
 * Below-the-fold sections that Hero doesn't need are each their own
 * async server component, fetched independently and streamed in behind
 * a `<Suspense>` boundary. This keeps the Hero — the page's LCP element —
 * from ever being blocked on Featured Jobs / Latest Jobs / Popular
 * Companies queries it has no dependency on, satisfying the spec's
 * "streaming for long-running pages" and "progressive rendering"
 * requirements without changing any of the sections' own behavior.
 */
async function FeaturedJobsAsync() {
  const jobs = await getFeaturedJobs(6);
  return <FeaturedJobsSection jobs={jobs} />;
}

async function LatestJobsAsync() {
  const jobs = await getLatestJobs({ page: 1, pageSize: 6 });
  return <LatestJobsSection initialJobs={jobs} />;
}

async function PopularCompaniesAsync() {
  const companies = await getCompaniesWithJobCounts(8);
  return <PopularCompaniesSection companies={companies} />;
}

/**
 * Homepage — fully server-rendered from live data (Prisma via the
 * `services/` layer), no dummy content. Every section degrades to a
 * purpose-built empty state when its underlying data is empty. Hero's
 * own data (locations, categories, stats) is fetched up front since
 * Hero renders first and is the page's LCP element; every other
 * section that doesn't feed Hero streams independently (see the
 * `*Async` components above).
 */
export default async function HomePage() {
  const [categories, locations, stats, organizationSchema, websiteSchema, defaults] = await Promise.all([
    getCategoriesWithJobCounts(),
    getLocationsWithJobCounts(),
    getHomeStats(),
    buildOrganizationSchema(),
    buildWebsiteSchema(),
    getSiteMetadataDefaults(),
  ]);

  // The homepage grid is a short highlight row, not the full category
  // list (that's what `/categories` is for) — capping it here is what
  // keeps the page from growing one tile taller every time an admin
  // adds a category. Hero's search dropdown still gets every category
  // (`categories` itself, uncapped) since a search filter shouldn't
  // silently hide options the full list has.
  const topCategories = [...categories].sort((a, b) => b.jobCount - a.jobCount).slice(0, 10);

  return (
    <>
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <JsonLd data={buildBreadcrumbSchema([{ name: "Home", url: defaults.baseUrl }])} />

      <HeroSection
        locations={locations.map((l) => ({ name: l.name, slug: l.slug }))}
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
        stats={stats}
      />
      <AdSlot position="HOMEPAGE_HERO" className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8" />
      <Suspense fallback={<FeaturedJobsSkeleton />}>
        <FeaturedJobsAsync />
      </Suspense>
      <Suspense fallback={<LatestJobsSkeleton />}>
        <LatestJobsAsync />
      </Suspense>
      <AdSlot position="HOMEPAGE_MIDDLE" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8" />
      <CategoryGridSection categories={topCategories} />
      <LocationGridSection locations={locations} />
      <Suspense fallback={<PopularCompaniesSkeleton />}>
        <PopularCompaniesAsync />
      </Suspense>
      <CareerResourcesSection />
      <WhyJobNestSection />
      <AdSlot position="HOMEPAGE_FOOTER" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8" />
      <CtaSection />
    </>
  );
}
