import { getSiteMetadataDefaults } from "@/lib/seo/site-metadata";
import { buildUrlsetXml, xmlResponse } from "@/lib/seo/sitemap-xml";
import { getAllCategories } from "@/services/categories.service";

export const revalidate = 3600;

/** Every category detail page — categories are reference data shown even with zero live jobs (same "every row is a real page" rule the `/categories` directory itself follows), so all of them are indexable landing pages. */
export async function GET() {
  const [defaults, categories] = await Promise.all([getSiteMetadataDefaults(), getAllCategories()]);

  const xml = buildUrlsetXml(
    categories.map((category) => ({
      loc: `${defaults.baseUrl}/categories/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "daily",
      priority: 0.6,
    })),
  );

  return xmlResponse(xml);
}
