import type { Advertisement } from "@prisma/client";

import { AdPreviewPanel } from "@/components/admin/advertisements/ad-preview-panel";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { humanizeEnumValue } from "@/utils/format";

/** Read-only "Preview" row action — the same `AdPreviewPanel` the create/edit dialog uses, without the surrounding form. */
export function AdPreviewDialog({
  open,
  onOpenChange,
  ad,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ad: Advertisement | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ad?.name ?? "Advertisement"}</DialogTitle>
          <DialogDescription>
            {ad && (
              <span className="flex flex-wrap items-center gap-2 pt-1">
                <Badge variant="outline">{humanizeEnumValue(ad.position)}</Badge>
                <Badge variant="outline">{humanizeEnumValue(ad.device)}</Badge>
                <Badge variant={ad.status === "ACTIVE" ? "success" : "secondary"}>
                  {ad.status === "ACTIVE" ? "Active" : "Disabled"}
                </Badge>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {ad && (
          <AdPreviewPanel
            name={ad.name}
            position={ad.position}
            device={ad.device}
            adType={ad.adType}
            adsenseClient={ad.adsenseClient}
            adsenseSlot={ad.adsenseSlot}
            htmlCode={ad.htmlCode}
            imageUrl={ad.imageUrl}
            targetUrl={ad.targetUrl}
            width={ad.width}
            height={ad.height}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
