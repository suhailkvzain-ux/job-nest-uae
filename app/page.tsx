import type { Metadata } from "next";

import { AdPlaceholderSection } from "@/components/home/ad-placeholder-section";
import { CategoryGridSection } from "@/components/home/category-grid-section";
import { CtaSection } from "@/components/home/cta-section";
import { FeaturedJobsSection } from "@/components/home/featured-jobs-section";
import { HeroSection } from "@/components/home/hero-section";
import { LatestJobsSection } from "@/components/home/latest-jobs-section";
import { LocationGridSection } from "@/components/home/location-grid-section";
import { PopularCompaniesSection } from "@/components/home/popular-companies-section";
import { WhyJobNestSection } from "@/components/home/why-jobnest-section";
import { JsonLd } from "@/components/shared/json-ld";
import { siteConfig } from "@/constants/site";
import { constructMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { getCategoriesWithJobCounts } from "@/services/categories.service";
import { getCompaniesWithJobCounts } from "@/services/companies.service";
import { getFeaturedJobs, getLatestJobs } from "@/services/jobs.service";
import { getLocationsWithJobCounts } from "@/services/locations.service";
import { getHomeStats } from "@/services/stats.service";

// ISR — homepage data (job counts, latest listings) is refreshed every
// 60 seconds rather than on every request, so traffic spikes hit the
// Next.js cache instead of the database.
export const revalidate = 60;

export const metadata: Metadata = constructMetadata({
  title: "Find Verified Jobs Across the UAE",
  description:
    "Job Nest UAE is a job discovery platform publishing only verified vacancies sourced directly from official employers across Dubai, Abu Dhabi, Sharjah, and the rest of the UAE. Browse freely — apply directly on the employer's own site or email.",
  path: "/",
});

/**
 * Homepage — fully server-rendered from live data (Prisma via the
 * `services/` layer), no dummy content. Every section degrades to a
 * purpose-built empty state when its underlying data is empty, and every
 * query runs in parallel via `Promise.all` to keep time-to-first-byte
 * low despite the number of sections.
 */
export default async function HomePage() {
  const [featuredJobs, latestJobs, categories, locations, companies, stats] = await Promise.all([
    getFeaturedJobs(6),
    getLatestJobs({ page: 1, pageSize: 12 }),
    getCategoriesWithJobCounts(),
    getLocationsWithJobCounts(),
    getCompaniesWithJobCounts(8),
    getHomeStats(),
  ]);

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", url: siteConfig.url }])} />

      <HeroSection
        locations={locations.map((l) => ({ name: l.name, slug: l.slug }))}
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
        stats={stats}
      />
      <FeaturedJobsSection jobs={featuredJobs} />
      <LatestJobsSection initialJobs={latestJobs} />
      <AdPlaceholderSection />
      <CategoryGridSection categories={categories} />
      <LocationGridSection locations={locations} />
      <PopularCompaniesSection companies={companies} />
      <WhyJobNestSection />
      <CtaSection />
    </>
  );
}
