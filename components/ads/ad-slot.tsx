import { AdImpressionTracker } from "@/components/ads/ad-impression-tracker";
import { cn } from "@/lib/utils";
import type { AdvertisementPosition } from "@/lib/validations/advertisement";
import { getEligibleAdsForPosition } from "@/services/advertisements.service";

interface AdSlotProps {
  position: AdvertisementPosition;
  className?: string;
}

/**
 * The one reusable component every ad placement across the public site
 * renders — home, jobs listing, single job, company/category/location
 * pages all just call `<AdSlot position="..." />`. It automatically:
 *
 * - **Detects position** — the only required prop; everything else is
 *   derived from the database.
 * - **Detects device** — not via user-agent sniffing (unreliable with
 *   caching/ISR) but the same CSS-breakpoint technique this project's
 *   pre-Phase-11 `AdPlaceholder` already used: both a desktop-eligible
 *   and a mobile-eligible ad are fetched and rendered, wrapped in
 *   `hidden sm:flex` / `flex sm:hidden` respectively, so exactly one is
 *   ever visible per viewport.
 * - **Hides expired ads** — `getEligibleAdsForPosition()` filters by
 *   `startDate`/`endDate` server-side.
 * - **Hides disabled ads** — filters by `status: ACTIVE` server-side.
 * - **Gracefully handles empty ad spaces** — renders `null` (no
 *   wrapper div, no reserved whitespace) whenever nothing is eligible,
 *   rather than a placeholder box.
 *
 * A Server Component by design: the eligibility query runs at render
 * time on the server, so no ad-selection logic ships to the client and
 * nothing here can block first paint waiting on client-side JS.
 */
export async function AdSlot({ position, className }: AdSlotProps) {
  const ads = await getEligibleAdsForPosition(position).catch(() => []);
  if (ads.length === 0) return null;

  const desktopAd = ads.find((ad) => ad.device === "DESKTOP" || ad.device === "ALL");
  const mobileAd = ads.find((ad) => ad.device === "MOBILE" || ad.device === "ALL");

  if (!desktopAd && !mobileAd) return null;

  return (
    <div className={cn("flex w-full flex-col items-center", className)}>
      {desktopAd && (
        <div className="hidden w-full sm:flex sm:justify-center">
          <AdImpressionTracker ad={desktopAd} />
        </div>
      )}
      {mobileAd && (
        <div className="flex w-full justify-center sm:hidden">
          <AdImpressionTracker ad={mobileAd} />
        </div>
      )}
    </div>
  );
}
