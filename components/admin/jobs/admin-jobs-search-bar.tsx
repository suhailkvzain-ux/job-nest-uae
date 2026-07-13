"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { SearchInput } from "@/components/search/search-input";
import { useDebounce } from "@/hooks/use-debounce";
import { buildAdminJobsQueryString, parseAdminJobsSearchParams } from "@/lib/admin-jobs-url";

/** Debounced, URL-synced instant search across Job Title/Company/Category/Location for the admin Jobs table. */
export function AdminJobsSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentFilters = parseAdminJobsSearchParams(Object.fromEntries(searchParams.entries()));
  const [value, setValue] = useState(currentFilters.query ?? "");
  const debounced = useDebounce(value, 400);

  useEffect(() => {
    const latest = parseAdminJobsSearchParams(Object.fromEntries(searchParams.entries()));
    if ((debounced || undefined) === latest.query) return;

    const qs = buildAdminJobsQueryString({ ...latest, query: debounced || undefined, page: 1 });
    router.replace(`${pathname}${qs}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the debounced value settles
  }, [debounced]);

  return (
    <SearchInput
      value={value}
      onChange={setValue}
      placeholder="Search by title, company, category, or location…"
      className="w-full max-w-md"
    />
  );
}
