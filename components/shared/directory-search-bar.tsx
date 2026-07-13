"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { SearchInput } from "@/components/search/search-input";
import { useDebounce } from "@/hooks/use-debounce";

/**
 * Debounced, URL-synced search box for the entity directory pages
 * (`/categories`, `/locations`, `/companies`) — searches entity *names*,
 * server-side, via `?search=`. Distinct from `JobsSearchBar`, which
 * searches job keywords on `/jobs` and the entity detail pages; this one
 * is generic across all three directories since the URL shape is the
 * same everywhere (`?search=` + nothing else to preserve).
 */
export function DirectorySearchBar({ placeholder = "Search…" }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQuery = searchParams.get("search") ?? "";
  const [value, setValue] = useState(currentQuery);
  const debounced = useDebounce(value, 300);

  useEffect(() => {
    const latest = searchParams.get("search") ?? "";
    if (debounced === latest) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debounced) {
      params.set("search", debounced);
    } else {
      params.delete("search");
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the debounced value settles
  }, [debounced]);

  return <SearchInput value={value} onChange={setValue} placeholder={placeholder} className="w-full max-w-xl" />;
}
