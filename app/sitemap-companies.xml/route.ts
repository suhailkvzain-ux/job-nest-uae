import { getSiteMetadataDefaults } from "@/lib/seo/site-metadata";
import { buildUrlsetXml, xmlResponse } from "@/lib/seo/sitemap-xml";
import { getAllCompaniesWithJobCounts } from "@/services/companies.service";

export const revalidate = 3600;

/** Every company with at least one live published job — `getAllCompaniesWithJobCounts()` already excludes companies with zero current openings, so this sitemap only ever lists real, non-empty company pages. */
export async function GET() {
  const [defaults, companies] = await Promise.all([getSiteMetadataDefaults(), getAllCompaniesWithJobCounts()]);

  const xml = buildUrlsetXml(
    companies.map((company) => ({
      loc: `${defaults.baseUrl}/companies/${company.slug}`,
      lastModified: company.updatedAt,
      changeFrequency: "daily",
      priority: 0.6,
    })),
  );

  return xmlResponse(xml);
}
