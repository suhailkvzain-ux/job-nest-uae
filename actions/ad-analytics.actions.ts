"use server";

import { isRateLimited } from "@/lib/rate-limit";
import { incrementAdClick, incrementAdImpression } from "@/services/advertisements.service";

/**
 * Public, unauthenticated tracking actions for `AdSlot` — every site
 * visitor's browser calls these, unlike `admin-advertisements.actions.ts`
 * which is admin-only. No `requireAdmin()` gate here by design (an
 * anonymous visitor viewing/clicking an ad is exactly the expected
 * caller), but failures are swallowed the same way Job's click tracking
 * already does: a dropped analytics event must never surface an error
 * to a visitor or block ad rendering/navigation.
 */

export async function trackAdImpressionAction(adId: string): Promise<void> {
  // A page with several ad slots fires this once per slot per view, so
  // the ceiling is higher than a single click-style action's.
  if (await isRateLimited("track-ad-impression", 180)) return;
  await incrementAdImpression(adId).catch(() => undefined);
}

export async function trackAdClickAction(adId: string): Promise<void> {
  if (await isRateLimited("track-ad-click", 60)) return;
  await incrementAdClick(adId).catch(() => undefined);
}
