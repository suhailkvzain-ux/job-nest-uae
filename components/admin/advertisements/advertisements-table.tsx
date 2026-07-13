"use client";

import type { Advertisement } from "@prisma/client";

import { AdRowActions } from "@/components/admin/advertisements/ad-row-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { computeCtr, formatDate, humanizeEnumValue } from "@/utils/format";

interface AdvertisementsTableProps {
  ads: Advertisement[];
  onPreview: (ad: Advertisement) => void;
  onEdit: (ad: Advertisement) => void;
  onDelete: (ad: Advertisement) => void;
}

/**
 * The admin ad list table. Beyond the spec's minimum column list (Name/
 * Position/Device/Type/Status/Created/Actions), this also surfaces
 * Impressions/Clicks/CTR directly in the row — the spec's separate
 * "Analytics: ... Display in admin" requirement, satisfied here rather
 * than a second screen, since per-ad CTR is exactly the kind of number
 * an admin scans across every row at once when deciding what to keep
 * running.
 */
export function AdvertisementsTable({
  ads,
  onPreview,
  onEdit,
  onDelete,
}: AdvertisementsTableProps) {
  if (ads.length === 0) {
    return (
      <EmptyState
        title="No advertisements found"
        description="Try a different search or filter, or create a new advertisement."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60">
      <table className="w-full min-w-[1000px] text-left text-sm">
        <thead className="bg-card">
          <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="py-3 pl-4 pr-4 font-medium">
              Advertisement Name
            </th>
            <th scope="col" className="py-3 pr-4 font-medium">
              Position
            </th>
            <th scope="col" className="py-3 pr-4 font-medium">
              Device
            </th>
            <th scope="col" className="py-3 pr-4 font-medium">
              Type
            </th>
            <th scope="col" className="py-3 pr-4 font-medium">
              Status
            </th>
            <th scope="col" className="py-3 pr-4 font-medium">
              Impressions
            </th>
            <th scope="col" className="py-3 pr-4 font-medium">
              Clicks
            </th>
            <th scope="col" className="py-3 pr-4 font-medium">
              CTR
            </th>
            <th scope="col" className="py-3 pr-4 font-medium">
              Created Date
            </th>
            <th scope="col" className="py-3 pl-4 pr-4 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {ads.map((ad) => (
            <tr key={ad.id}>
              <td className="max-w-56 truncate py-3 pl-4 pr-4 font-medium text-foreground">
                {ad.name}
              </td>
              <td className="max-w-40 truncate py-3 pr-4 text-muted-foreground">
                {humanizeEnumValue(ad.position)}
              </td>
              <td className="py-3 pr-4 text-muted-foreground">{humanizeEnumValue(ad.device)}</td>
              <td className="py-3 pr-4 text-muted-foreground">{humanizeEnumValue(ad.adType)}</td>
              <td className="py-3 pr-4">
                <Badge variant={ad.status === "ACTIVE" ? "success" : "secondary"}>
                  {ad.status === "ACTIVE" ? "Active" : "Disabled"}
                </Badge>
              </td>
              <td className="py-3 pr-4 text-muted-foreground">{ad.impressions.toLocaleString()}</td>
              <td className="py-3 pr-4 text-muted-foreground">{ad.clicks.toLocaleString()}</td>
              <td className="py-3 pr-4 text-muted-foreground">
                {computeCtr(ad.impressions, ad.clicks)}%
              </td>
              <td className="py-3 pr-4 text-muted-foreground">{formatDate(ad.createdAt)}</td>
              <td className="py-3 pl-4 pr-4 text-right">
                <AdRowActions ad={ad} onPreview={onPreview} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
