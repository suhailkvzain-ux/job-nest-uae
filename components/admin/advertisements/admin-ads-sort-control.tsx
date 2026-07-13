"use client";

import { usePathname, useRouter } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildAdminAdQueryString } from "@/lib/admin-advertisements-url";
import type { AdminAdSearchInput } from "@/lib/validations/admin-advertisement";
import type { AdminAdSort } from "@/lib/validations/admin-advertisement";

const SORT_OPTIONS: { label: string; value: AdminAdSort }[] = [
  { label: "Display Order", value: "display_order" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Name A–Z", value: "name_az" },
];

export function AdminAdsSortControl({ filters }: { filters: AdminAdSearchInput }) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(sort: AdminAdSort) {
    const qs = buildAdminAdQueryString({ ...filters, sort, page: 1 });
    router.push(`${pathname}${qs}`);
  }

  return (
    <Select value={filters.sort} onValueChange={(v) => handleChange(v as AdminAdSort)}>
      <SelectTrigger className="w-full sm:w-44" aria-label="Sort advertisements">
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
