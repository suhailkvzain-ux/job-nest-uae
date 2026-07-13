import { getSiteMetadataDefaults } from "@/lib/seo/site-metadata";
import { buildSitemapIndexXml, xmlResponse } from "@/lib/seo/sitemap-xml";

export const revalidate = 3600;

/**
 * `/sitemap.xml` — the sitemap index, referencing five child sitemaps
 * (pages, jobs, categories, locations, companies) rather than one flat
 * file. Splitting by content type is standard practice for a site whose
 * job/company/category/location counts will keep growing indefinitely:
 * each child sitemap can be resubmitted, monitored, and diagnosed in
 * Google Search Console independently — if job indexing coverage drops,
 * for instance, `sitemap-jobs.xml`'s own report shows that immediately,
 * without it being mixed in with static-page or company-page rows.
 * This is the one URL actually referenced from `robots.txt`.
 */
export async function GET() {
  const defaults = await getSiteMetadataDefaults();
  const now = new Date();

  const childSitemaps = [
    "sitemap-pages.xml",
    "sitemap-jobs.xml",
    "sitemap-categories.xml",
    "sitemap-locations.xml",
    "sitemap-companies.xml",
  ];

  const xml = buildSitemapIndexXml(
    childSitemaps.map((name) => ({
      loc: `${defaults.baseUrl}/${name}`,
      lastModified: now,
    })),
  );

  return xmlResponse(xml);
}
