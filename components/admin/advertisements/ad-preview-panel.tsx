import { AdCreative } from "@/components/ads/ad-creative";
import type { AdDevice, AdType, AdvertisementPosition } from "@/lib/validations/advertisement";

interface AdPreviewPanelProps {
  name: string;
  position: AdvertisementPosition;
  device: AdDevice;
  adType: AdType;
  adsenseClient?: string | null;
  adsenseSlot?: string | null;
  htmlCode?: string | null;
  imageUrl?: string | null;
  targetUrl?: string | null;
  width?: number | null;
  height?: number | null;
}

/** Live "how this ad will actually look" preview inside the create/edit dialog — reuses the exact same `AdCreative` renderer the public `AdSlot` uses, in `isPreview` mode (see that component for why AdSense renders a mock in preview). */
export function AdPreviewPanel(props: AdPreviewPanelProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-muted/20 p-4">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Preview</span>
      <div className="flex min-h-[80px] items-center justify-center rounded-xl bg-background p-3">
        <AdCreative
          isPreview
          ad={{
            id: "preview",
            name: props.name || "Untitled ad",
            position: props.position,
            device: props.device,
            adType: props.adType,
            adsenseClient: props.adsenseClient ?? null,
            adsenseSlot: props.adsenseSlot ?? null,
            htmlCode: props.htmlCode ?? null,
            imageUrl: props.imageUrl ?? null,
            targetUrl: props.targetUrl ?? null,
            width: props.width ?? null,
            height: props.height ?? null,
          }}
        />
      </div>
    </div>
  );
}
