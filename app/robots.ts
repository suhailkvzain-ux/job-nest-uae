import type { MetadataRoute } from "next";

import { getSiteMetadataDefaults } from "@/lib/seo/site-metadata";

/**
 * `/robots.txt` — allows indexing of every public page and explicitly
 * blocks the admin panel, any private/internal API routes, and the
 * admin-only job preview route, then points crawlers at the sitemap
 * index (`/sitemap.xml`, which itself references the five child
 * sitemaps — see `app/sitemap.xml/route.ts`). Sourced from
 * `getSiteMetadataDefaults()` so the referenced sitemap always matches
 * whatever canonical domain is configured in `/admin/settings`.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const defaults = await getSiteMetadataDefaults();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/",
          "/api/private",
          "/*/preview",
          "/*?preview=",
        ],
      },
    ],
    sitemap: `${defaults.baseUrl}/sitemap.xml`,
    host: defaults.baseUrl,
  };
}
