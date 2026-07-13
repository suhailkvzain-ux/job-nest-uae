import { getSiteMetadataDefaults } from "@/lib/seo/site-metadata";
import { buildUrlsetXml, xmlResponse } from "@/lib/seo/sitemap-xml";

export const revalidate = 3600;

const STATIC_ROUTES: { path: string; changeFrequency: "daily" | "weekly" | "monthly"; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1.0 },
  { path: "/jobs", changeFrequency: "daily", priority: 0.9 },
  { path: "/categories", changeFrequency: "weekly", priority: 0.7 },
  { path: "/locations", changeFrequency: "weekly", priority: 0.7 },
  { path: "/companies", changeFrequency: "weekly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.3 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.3 },
];

/** The site's core, always-public pages — home, the four directory indexes, and the four static content pages. */
export async function GET() {
  const defaults = await getSiteMetadataDefaults();
  const now = new Date();

  const xml = buildUrlsetXml(
    STATIC_ROUTES.map((route) => ({
      loc: `${defaults.baseUrl}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
  );

  return xmlResponse(xml);
}
