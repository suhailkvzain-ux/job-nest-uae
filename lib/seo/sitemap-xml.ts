/**
 * Hand-rolled sitemap XML serialization, shared by every sitemap route
 * under `app/sitemap*.xml/`. Next.js's built-in `sitemap.ts` file
 * convention only produces one flat `<urlset>` at `/sitemap.xml` (or,
 * via `generateSitemaps()`, numbered `/sitemap/0.xml`-style children) —
 * neither gives literally-named child sitemaps like `/sitemap-jobs.xml`,
 * which is what an enterprise setup (and Search Console's per-sitemap
 * indexing reports) benefits from: a job-only sitemap can be resubmitted
 * or monitored independently of the categories/companies/locations
 * ones. Hand-writing Route Handlers is the standard way to get that
 * exact URL shape.
 */

export interface SitemapUrlEntry {
  loc: string;
  lastModified?: Date;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Builds one `<urlset>` sitemap (a leaf sitemap listing real page URLs). */
export function buildUrlsetXml(entries: SitemapUrlEntry[]): string {
  const urlNodes = entries
    .map((entry) => {
      const parts = [`    <loc>${escapeXml(entry.loc)}</loc>`];
      if (entry.lastModified) parts.push(`    <lastmod>${entry.lastModified.toISOString()}</lastmod>`);
      if (entry.changeFrequency) parts.push(`    <changefreq>${entry.changeFrequency}</changefreq>`);
      if (typeof entry.priority === "number") parts.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlNodes}\n</urlset>`;
}

/** Builds a `<sitemapindex>` — a sitemap of sitemaps, one entry per child sitemap URL. */
export function buildSitemapIndexXml(sitemapUrls: { loc: string; lastModified?: Date }[]): string {
  const nodes = sitemapUrls
    .map((entry) => {
      const parts = [`    <loc>${escapeXml(entry.loc)}</loc>`];
      if (entry.lastModified) parts.push(`    <lastmod>${entry.lastModified.toISOString()}</lastmod>`);
      return `  <sitemap>\n${parts.join("\n")}\n  </sitemap>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${nodes}\n</sitemapindex>`;
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      // Cached at the edge/CDN for an hour, matching this project's
      // existing `revalidate = 60`-ish freshness expectations for
      // content pages — a sitemap doesn't need to be regenerated on
      // every single crawl request.
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
