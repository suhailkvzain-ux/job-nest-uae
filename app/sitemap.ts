import type { MetadataRoute } from "next";

import { siteConfig } from "@/constants/site";
import { getAllCategories } from "@/services/categories.service";
import { getAllCompaniesWithJobCounts } from "@/services/companies.service";
import { getAllPublishedJobSlugsForSitemap } from "@/services/jobs.service";
import { getAllLocations } from "@/services/locations.service";

/**
 * Static routes, every published job's own URL, and now (Phase 7) every
 * category/location/company detail page too — each of these directory
 * pages is a real, crawlable landing page in its own right, not just an
 * alternate view of `/jobs`.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/jobs", "/companies", "/categories", "/locations", "/about", "/contact"];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  const [jobs, categories, locations, companies] = await Promise.all([
    getAllPublishedJobSlugsForSitemap(),
    getAllCategories(),
    getAllLocations(),
    getAllCompaniesWithJobCounts(),
  ]);

  const jobEntries: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${siteConfig.url}/jobs/${job.slug}`,
    lastModified: job.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteConfig.url}/categories/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const locationEntries: MetadataRoute.Sitemap = locations.map((location) => ({
    url: `${siteConfig.url}/locations/${location.slug}`,
    lastModified: location.updatedAt,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const companyEntries: MetadataRoute.Sitemap = companies.map((company) => ({
    url: `${siteConfig.url}/companies/${company.slug}`,
    lastModified: company.updatedAt,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [...staticEntries, ...jobEntries, ...categoryEntries, ...locationEntries, ...companyEntries];
}
