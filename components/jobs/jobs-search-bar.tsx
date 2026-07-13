"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Container } from "@/components/layout/container";
import { KeywordSearch } from "@/components/search/keyword-search";
import { useDebounce } from "@/hooks/use-debounce";
import { buildJobsQueryString, parseJobsSearchParams } from "@/lib/jobs-url";

/**
 * Sticky search bar for /jobs — live, debounced (400ms), and syncs to the
 * `?search=` URL param (e.g. `/jobs?search=interior+designer`) via
 * `router.replace` (no history entry per keystroke) once the debounced
 * value actually changes. Changing the search term resets `page` to 1,
 * same as every other filter.
 */
export function JobsSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentFilters = parseJobsSearchParams(Object.fromEntries(searchParams.entries()));
  const [value, setValue] = useState(currentFilters.query ?? "");
  const debounced = useDebounce(value, 400);

  useEffect(() => {
    const latest = parseJobsSearchParams(Object.fromEntries(searchParams.entries()));
    if ((debounced || undefined) === latest.query) return;

    const qs = buildJobsQueryString({ ...latest, query: debounced || undefined, page: 1 });
    router.replace(`${pathname}${qs}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the debounced value settles
  }, [debounced]);

  return (
    <div className="sticky top-18 z-sticky border-b border-border/60 bg-background/80 py-4 backdrop-blur-md">
      <Container>
        <KeywordSearch value={value} onChange={setValue} className="w-full max-w-2xl" />
      </Container>
    </div>
  );
}
