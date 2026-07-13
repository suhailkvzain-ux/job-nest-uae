"use server";

import { isRateLimited } from "@/lib/rate-limit";
import { getLatestJobs } from "@/services/jobs.service";

/**
 * Server Action backing the homepage's "Load More" button on Latest
 * Jobs. Called directly from the client component — no API route
 * needed. Returns 12 jobs at a time to match the section's page size.
 *
 * Rate limited generously (well beyond any real "click Load More
 * repeatedly" session) to blunt a scripted actor using this as a free
 * pagination-scraping endpoint. Returns an empty array rather than
 * throwing when exceeded — `LatestJobsSection` already treats a
 * shorter-than-a-full-page response as "no more results" and just stops
 * offering the button, so this degrades silently instead of surfacing
 * an error mid-scroll.
 */
export async function loadMoreLatestJobsAction(page: number) {
  if (await isRateLimited("load-more-jobs", 30)) return [];
  return getLatestJobs({ page, pageSize: 6 });
}
