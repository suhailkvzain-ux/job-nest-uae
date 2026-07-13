/**
 * Builds an absolute canonical URL from a resolved base domain and a
 * page path. Kept as a pure, synchronous function — the base domain
 * (which may come from Settings' Canonical Domain override, or the
 * static `NEXT_PUBLIC_SITE_URL` fallback) is resolved once by the
 * caller (`generateMetadata()`), so this helper stays trivially
 * reusable and testable without needing to know about Settings at all.
 *
 * Every dynamic listing page in this project (`/jobs`, category/
 * location detail pages with their own filter/sort query params)
 * already serializes its query string in a fixed, deterministic key
 * order (see `lib/jobs-url.ts`'s `buildJobsQueryString`) before it
 * ever reaches this function — so two requests for the same filter
 * combination, regardless of the order query params arrived in,
 * always produce the same canonical URL. That determinism is what
 * actually prevents duplicate-content issues for faceted navigation;
 * this function just assembles the final absolute string.
 */
export function buildCanonicalUrl(baseUrl: string, path = "/"): string {
  const normalizedBase = baseUrl.replace(/\/$/, "");
  if (!path || path === "/") {
    return `${normalizedBase}/`;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
