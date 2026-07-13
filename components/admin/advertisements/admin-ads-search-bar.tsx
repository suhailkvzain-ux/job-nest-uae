"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { SearchInput } from "@/components/search/search-input";
import { useDebounce } from "@/hooks/use-debounce";
import { buildAdminAdQueryString, parseAdminAdSearchParams } from "@/lib/admin-advertisements-url";

/** Debounced, URL-synced instant search by advertisement name. */
export function AdminAdsSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentFilters = parseAdminAdSearchParams(Object.fromEntries(searchParams.entries()));
  const [value, setValue] = useState(currentFilters.query ?? "");
  const debounced = useDebounce(value, 400);

  useEffect(() => {
    const latest = parseAdminAdSearchParams(Object.fromEntries(searchParams.entries()));
    if ((debounced || undefined) === latest.query) return;

    const qs = buildAdminAdQueryString({ ...latest, query: debounced || undefined, page: 1 });
    router.replace(`${pathname}${qs}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the debounced value settles
  }, [debounced]);

  return <SearchInput value={value} onChange={setValue} placeholder="Search advertisements…" className="w-full max-w-md" />;
}
