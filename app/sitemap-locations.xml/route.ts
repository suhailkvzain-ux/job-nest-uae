import { getSiteMetadataDefaults } from "@/lib/seo/site-metadata";
import { buildUrlsetXml, xmlResponse } from "@/lib/seo/sitemap-xml";
import { getAllLocations } from "@/services/locations.service";

export const revalidate = 3600;

/** Every location detail page — same "show every reference row" rule as categories. */
export async function GET() {
  const [defaults, locations] = await Promise.all([getSiteMetadataDefaults(), getAllLocations()]);

  const xml = buildUrlsetXml(
    locations.map((location) => ({
      loc: `${defaults.baseUrl}/locations/${location.slug}`,
      lastModified: location.updatedAt,
      changeFrequency: "daily",
      priority: 0.6,
    })),
  );

  return xmlResponse(xml);
}
