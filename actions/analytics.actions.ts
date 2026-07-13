"use server";

import { isRateLimited } from "@/lib/rate-limit";
import { incrementEmailClicks, incrementShareClicks, incrementViewCount, incrementWebsiteClicks } from "@/services/jobs.service";

/**
 * Job detail page analytics — each action is bound with the job's id in
 * the Server Component (`trackWebsiteClickAction.bind(null, job.id)`)
 * before being passed down as a prop to the Client Components that
 * actually render the buttons (`ApplyCard`, `ShareJobCard`). This is the
 * standard Next.js pattern for wiring a Server Action to a client
 * `onClick` without an API route. Failures are swallowed — a dropped
 * analytics event should never block or error out the user's apply/share
 * action.
 *
 * `trackJobViewAction` (Phase 15) follows the exact same client-
 * triggered shape as the click actions below, called once on mount from
 * `<JobViewTracker>` rather than synchronously inside the page's own
 * Server Component render. Previously `incrementViewCount()` was called
 * directly in `JobDetailPage`'s async body — since it transitively reads
 * the visitor-id cookie (`getOrCreateVisitorId()` → `cookies()`), that
 * forced Next.js to treat the *entire* job detail page as fully dynamic
 * (no ISR/route caching at all), even though the job content itself
 * changes infrequently. Moving the increment to a post-hydration client
 * effect — the same pattern already used for website/email/share click
 * tracking — un-taints the page's own render, so `getJobBySlug()`'s
 * actual database read can be cached like every other detail page,
 * while the view count still increments exactly once per real page
 * view.
 */
export async function trackJobViewAction(jobId: string): Promise<void> {
  // Generous per-IP ceilings (well above real browsing behavior) that
  // exist purely to blunt a scripted flood inflating analytics, not to
  // ever affect a real visitor — exceeding one silently no-ops, same as
  // every other failure mode these tracking actions already swallow.
  if (await isRateLimited("track-job-view", 120)) return;
  await incrementViewCount(jobId).catch(() => undefined);
}

export async function trackWebsiteClickAction(jobId: string): Promise<void> {
  if (await isRateLimited("track-website-click", 60)) return;
  await incrementWebsiteClicks(jobId).catch(() => undefined);
}

export async function trackEmailClickAction(jobId: string): Promise<void> {
  if (await isRateLimited("track-email-click", 60)) return;
  await incrementEmailClicks(jobId).catch(() => undefined);
}

export async function trackShareClickAction(jobId: string, channel: string): Promise<void> {
  void channel; // reserved for future per-channel share analytics
  if (await isRateLimited("track-share-click", 60)) return;
  await incrementShareClicks(jobId).catch(() => undefined);
}
