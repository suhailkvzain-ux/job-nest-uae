"use server";

import { isRateLimited } from "@/lib/rate-limit";
import { recordAnalyticsEvent } from "@/services/analytics-events.service";

/**
 * Public, unauthenticated page-view tracking — every visitor's browser
 * calls this once per route change via `PageViewTracker`, mounted once
 * in `app/(site)/layout.tsx` so no individual page needs its own
 * wiring. No `requireAdmin()` gate here by design, same as Phase 11's
 * ad-analytics actions: an anonymous visitor browsing the site is
 * exactly the expected caller.
 *
 * Also opportunistically captures the spec's "optional" Search Queries
 * metric: if the tracked path is the jobs listing with a `?search=`
 * param, a second `SEARCH_QUERY` event is recorded alongside the page
 * view, rather than adding a second call site to the search box itself.
 */
export async function trackPageViewAction(fullPath: string): Promise<void> {
  // One shared per-IP ceiling covers both the page-view beacon and the
  // opportunistic search-query capture below — generous enough for
  // real browsing (every route change fires this once), tight enough
  // to blunt a scripted flood of fake page views / search terms.
  if (await isRateLimited("track-page-view", 180)) return;

  const [path, queryString] = fullPath.split("?");
  await recordAnalyticsEvent({ type: "PAGE_VIEW", path });

  if (path === "/jobs" && queryString) {
    const params = new URLSearchParams(queryString);
    const search = params.get("search");
    if (search) {
      await recordAnalyticsEvent({ type: "SEARCH_QUERY", path, searchQuery: search });
    }
  }
}
