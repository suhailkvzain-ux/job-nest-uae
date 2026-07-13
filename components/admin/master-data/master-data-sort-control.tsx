"use client";

import { usePathname, useRouter } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildMasterDataQueryString } from "@/lib/admin-master-data-url";
import type { MasterDataSearchInput, MasterDataSort } from "@/lib/validations/admin-master-data";

const SORT_OPTIONS: { label: string; value: MasterDataSort }[] = [
  { label: "Name A–Z", value: "name_az" },
  { label: "Name Z–A", value: "name_za" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Most Jobs", value: "job_count" },
];

export function MasterDataSortControl({ filters }: { filters: MasterDataSearchInput }) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(sort: MasterDataSort) {
    const qs = buildMasterDataQueryString({ ...filters, sort, page: 1 });
    router.push(`${pathname}${qs}`);
  }

  return (
    <Select value={filters.sort} onValueChange={(v) => handleChange(v as MasterDataSort)}>
      <SelectTrigger className="w-full sm:w-44" aria-label="Sort">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
