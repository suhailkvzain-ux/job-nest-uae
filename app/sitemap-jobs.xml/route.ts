import { getSiteMetadataDefaults } from "@/lib/seo/site-metadata";
import { buildUrlsetXml, xmlResponse } from "@/lib/seo/sitemap-xml";
import { getAllPublishedJobSlugsForSitemap } from "@/services/jobs.service";

export const revalidate = 3600;

/** Every job actually visible on the public site right now — published, not soft-deleted, and not past its application deadline. Updates automatically as jobs are published, edited, or expire, since it's generated fresh (subject to the revalidate window) rather than written once at build time. */
export async function GET() {
  const [defaults, jobs] = await Promise.all([getSiteMetadataDefaults(), getAllPublishedJobSlugsForSitemap()]);

  const xml = buildUrlsetXml(
    jobs.map((job) => ({
      loc: `${defaults.baseUrl}/jobs/${job.slug}`,
      lastModified: job.updatedAt,
      changeFrequency: "daily",
      priority: 0.8,
    })),
  );

  return xmlResponse(xml);
}
