"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { SearchInput } from "@/components/search/search-input";
import { useDebounce } from "@/hooks/use-debounce";
import { buildTopJobsQueryString, parseTopJobsSearchParams } from "@/lib/analytics-url";

/** Debounced, URL-synced search over the Top Performing Jobs table — mirrors `MasterDataSearchBar`. */
export function TopJobsSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawParams = Object.fromEntries(searchParams.entries());

  const currentSearch = parseTopJobsSearchParams(rawParams);
  const [value, setValue] = useState(currentSearch.query ?? "");
  const debounced = useDebounce(value, 400);

  useEffect(() => {
    const latest = parseTopJobsSearchParams(Object.fromEntries(searchParams.entries()));
    if ((debounced || undefined) === latest.query) return;

    const qs = buildTopJobsQueryString({ ...latest, query: debounced || undefined, page: 1 }, rawParams);
    router.replace(`${pathname}${qs}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the debounced value settles
  }, [debounced]);

  return (
    <SearchInput
      value={value}
      onChange={setValue}
      placeholder="Search by job title or company..."
      className="w-full max-w-sm"
    />
  );
}
