"use client";

import { usePathname, useRouter } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildAdminJobsQueryString } from "@/lib/admin-jobs-url";
import type { AdminJobSearchInput, AdminJobSort } from "@/lib/validations/admin-job";

const SORT_OPTIONS: { label: string; value: AdminJobSort }[] = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Title A–Z", value: "title_az" },
  { label: "Company A–Z", value: "company_az" },
  { label: "Published Date", value: "published_date" },
  { label: "Deadline", value: "deadline" },
  { label: "Featured First", value: "featured_first" },
];

export function AdminJobsSortControl({ filters }: { filters: AdminJobSearchInput }) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(sort: AdminJobSort) {
    const qs = buildAdminJobsQueryString({ ...filters, sort, page: 1 });
    router.push(`${pathname}${qs}`);
  }

  return (
    <Select value={filters.sort} onValueChange={(v) => handleChange(v as AdminJobSort)}>
      <SelectTrigger className="w-full sm:w-52" aria-label="Sort jobs">
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
