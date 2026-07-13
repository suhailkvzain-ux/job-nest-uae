"use client";

import Script from "next/script";

/**
 * Google's global AdSense loader — included once, site-wide, in
 * `app/(site)/layout.tsx` (never in the admin panel, which has no ads).
 * `strategy="afterInteractive"` per Next.js's own guidance for
 * third-party scripts that aren't needed for the initial paint: it
 * loads after the page becomes interactive rather than blocking
 * rendering, satisfying the spec's "do not block page rendering"
 * performance requirement. Every individual ad unit (`AdCreative`)
 * renders its own `<ins data-ad-client data-ad-slot>` tag and pushes to
 * this same shared `adsbygoogle` queue — this script doesn't take a
 * client ID itself, that's per-ad-unit.
 */
export function AdsenseScript() {
  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
