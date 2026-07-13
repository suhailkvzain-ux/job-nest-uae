"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildTopJobsQueryString, parseTopJobsSearchParams } from "@/lib/analytics-url";
import type { TopJobsSort } from "@/lib/validations/analytics";

const SORT_OPTIONS: { label: string; value: TopJobsSort }[] = [
  { label: "Most Views", value: "views" },
  { label: "Most Website Clicks", value: "website_clicks" },
  { label: "Most Email Clicks", value: "email_clicks" },
  { label: "Highest CTR", value: "ctr" },
  { label: "Newest Published", value: "published_date" },
];

export function TopJobsSortControl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawParams = Object.fromEntries(searchParams.entries());
  const current = parseTopJobsSearchParams(rawParams);

  function handleChange(sort: TopJobsSort) {
    const qs = buildTopJobsQueryString({ ...current, sort, page: 1 }, rawParams);
    router.push(`${pathname}${qs}`);
  }

  return (
    <Select value={current.sort} onValueChange={(v) => handleChange(v as TopJobsSort)}>
      <SelectTrigger className="w-full sm:w-52" aria-label="Sort Top Jobs">
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
