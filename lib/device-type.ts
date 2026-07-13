import type { DeviceType } from "@prisma/client";

/**
 * Coarse device classification from the request's `User-Agent` header —
 * no client-side fingerprinting, no external dependency. Matches the
 * same "mobile vs. everything else" split the site's own responsive ad
 * slots (`AdSlot`) and pre-existing CSS breakpoints already use, so
 * "Desktop" here also covers tablets, consistent with that convention.
 */
export function detectDeviceType(userAgent: string | null | undefined): DeviceType {
  if (!userAgent) return "UNKNOWN";
  return /Mobi|Android|iPhone|iPod/i.test(userAgent) ? "MOBILE" : "DESKTOP";
}
