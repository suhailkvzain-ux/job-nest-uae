"use client";

import { X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildAdminAdQueryString } from "@/lib/admin-advertisements-url";
import type { AdminAdSearchInput } from "@/lib/validations/admin-advertisement";
import { advertisementPositionEnum, adStatusEnum, adTypeEnum } from "@/lib/validations/advertisement";
import { humanizeEnumValue } from "@/utils/format";

const POSITION_OPTIONS = advertisementPositionEnum.options.map((value) => ({ label: humanizeEnumValue(value), value }));
const STATUS_OPTIONS = adStatusEnum.options.map((value) => ({ label: humanizeEnumValue(value), value }));
const TYPE_OPTIONS = adTypeEnum.options.map((value) => ({ label: humanizeEnumValue(value), value }));

/** Inline Position/Status/Type filter selects — deliberately not a collapsible panel like Jobs' filters, since three plain dropdowns is simpler and there are no date-range facets here. */
export function AdminAdsFilters({ filters }: { filters: AdminAdSearchInput }) {
  const router = useRouter();
  const pathname = usePathname();

  const activeCount = [filters.position, filters.status, filters.adType].filter(Boolean).length;

  function update(patch: Partial<AdminAdSearchInput>) {
    const qs = buildAdminAdQueryString({ ...filters, ...patch, page: 1 });
    router.push(`${pathname}${qs}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={filters.position ?? "any"}
        onValueChange={(v) => update({ position: v === "any" ? undefined : (v as AdminAdSearchInput["position"]) })}
      >
        <SelectTrigger className="w-full sm:w-44" aria-label="Filter by position">
          <SelectValue placeholder="Any Position" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any Position</SelectItem>
          {POSITION_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status ?? "any"}
        onValueChange={(v) => update({ status: v === "any" ? undefined : (v as AdminAdSearchInput["status"]) })}
      >
        <SelectTrigger className="w-full sm:w-36" aria-label="Filter by status">
          <SelectValue placeholder="Any Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any Status</SelectItem>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.adType ?? "any"}
        onValueChange={(v) => update({ adType: v === "any" ? undefined : (v as AdminAdSearchInput["adType"]) })}
      >
        <SelectTrigger className="w-full sm:w-40" aria-label="Filter by type">
          <SelectValue placeholder="Any Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any Type</SelectItem>
          {TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => router.push(pathname)}>
          <X className="h-3.5 w-3.5" /> Clear Filters
        </Button>
      )}
    </div>
  );
}
