import Image from "next/image";

import type { AdDevice, AdType, AdvertisementPosition } from "@/lib/validations/advertisement";

export interface AdCreativeData {
  id: string;
  name: string;
  position: AdvertisementPosition;
  device: AdDevice;
  adType: AdType;
  adsenseClient: string | null;
  adsenseSlot: string | null;
  htmlCode: string | null;
  imageUrl: string | null;
  targetUrl: string | null;
  width: number | null;
  height: number | null;
}

/**
 * Renders one ad's actual creative — the part shared between the real
 * public `AdSlot` and the admin's live preview, so "what the admin sees
 * in the form dialog" and "what a visitor actually gets" can never
 * silently drift apart.
 *
 * `isPreview` swaps real AdSense markup for a static mock: AdSense only
 * ever renders anything once Google's loader script has fetched real
 * inventory for an *approved, live* site, which this sandbox — and any
 * admin's in-dialog preview — can never satisfy, so showing the real
 * `<ins>` tag there would just be a permanent blank box.
 */
export function AdCreative({ ad, isPreview = false }: { ad: AdCreativeData; isPreview?: boolean }) {
  if (ad.adType === "ADSENSE") {
    if (isPreview) {
      return (
        <div className="flex w-full max-w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-6 text-center">
          <span className="text-xs font-medium text-primary">Google AdSense</span>
          <span className="text-xs text-muted-foreground">
            client: {ad.adsenseClient || "—"} · slot: {ad.adsenseSlot || "—"}
          </span>
          <span className="text-[11px] text-muted-foreground">Live ad renders here once published</span>
        </div>
      );
    }

    // The real, production AdSense embed — Google's standard per-unit
    // snippet. The loader script itself (`<AdsenseScript>`) is included
    // once, globally, in the root layout, not repeated per slot.
    return (
      <ins
        className="adsbygoogle block"
        style={{ display: "block", width: ad.width ?? undefined, height: ad.height ?? undefined }}
        data-ad-client={ad.adsenseClient ?? undefined}
        data-ad-slot={ad.adsenseSlot ?? undefined}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    );
  }

  if (ad.adType === "IMAGE_BANNER") {
    if (!ad.imageUrl) return null;
    const width = ad.width ?? 728;
    const height = ad.height ?? 90;

    const img = (
      <Image
        src={ad.imageUrl}
        alt={ad.name}
        width={width}
        height={height}
        className="mx-auto h-auto max-w-full rounded-xl"
        unoptimized
      />
    );

    if (!ad.targetUrl) return img;

    return (
      <a href={ad.targetUrl} target="_blank" rel="noopener sponsored" aria-label={ad.name}>
        {img}
      </a>
    );
  }

  // CUSTOM_HTML — rendered inside a sandboxed iframe (see
  // `lib/sanitize-html.ts` for the full defense-in-depth rationale).
  // `allow-same-origin` is deliberately omitted: the embedded snippet
  // runs in an opaque cross-origin context with no access to this
  // page's cookies, localStorage, or DOM.
  if (!ad.htmlCode) return null;

  return (
    <iframe
      title={ad.name}
      srcDoc={ad.htmlCode}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      style={{ width: ad.width ? `${ad.width}px` : "100%", height: ad.height ? `${ad.height}px` : "100px", border: "0" }}
      loading="lazy"
    />
  );
}
