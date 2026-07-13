"use client";

import { useEffect, useRef } from "react";

import { trackAdClickAction, trackAdImpressionAction } from "@/actions/ad-analytics.actions";
import { AdCreative, type AdCreativeData } from "@/components/ads/ad-creative";

/**
 * Client wrapper around `AdCreative` that fires one impression per ad
 * per page view, counted the way the ad industry actually defines an
 * impression — the slot scrolling into view, not merely being present
 * in the DOM — via `IntersectionObserver` (a 50% visibility threshold),
 * disconnecting itself after the first fire.
 *
 * Click tracking is only wired for Image Banner: AdSense and Custom
 * HTML render inside a sandboxed cross-origin iframe by design (see
 * `AdCreative`), so a click inside that iframe never reaches this
 * page's JavaScript at all — that isolation is exactly what makes the
 * sandbox safe, and it's also why Google's own AdSense dashboard, not
 * this site's analytics, is the authoritative source for AdSense clicks.
 */
export function AdImpressionTracker({ ad }: { ad: AdCreativeData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || trackedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !trackedRef.current) {
            trackedRef.current = true;
            void trackAdImpressionAction(ad.id);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ad.id]);

  function handleClick() {
    if (ad.adType === "IMAGE_BANNER") {
      void trackAdClickAction(ad.id);
    }
  }

  return (
    <div ref={containerRef} onClick={handleClick} className="mx-auto flex w-full justify-center">
      <AdCreative ad={ad} />
    </div>
  );
}
