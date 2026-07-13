"use client";

import { usePathname, useRouter } from "next/navigation";

import { SortFilter } from "@/components/filters/sort-filter";
import { buildJobsQueryString } from "@/lib/jobs-url";
import type { JobSearchInput, JobSort } from "@/lib/validations/job";

interface JobsSortControlProps {
  filters: JobSearchInput;
  /** Restricts the dropdown to a subset of sort options — see `SortFilter`. */
  options?: { label: string; value: JobSort }[];
}

/** Client wrapper around `SortFilter` that pushes the new `?sort=` to the URL. */
export function JobsSortControl({ filters, options }: JobsSortControlProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(sort: JobSort) {
    const qs = buildJobsQueryString({ ...filters, sort, page: 1 });
    router.push(`${pathname}${qs}`);
  }

  return <SortFilter value={filters.sort} onChange={handleChange} options={options} />;
}
