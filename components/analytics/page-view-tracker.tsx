"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { trackPageViewAction } from "@/actions/site-analytics.actions";

/**
 * Mounted once in `app/(site)/layout.tsx` — fires one `PAGE_VIEW` event
 * per route change (including client-side navigations, which a
 * server-only approach would miss entirely). Renders nothing.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    void trackPageViewAction(query ? `${pathname}?${query}` : pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per actual path/query change, not on every render
  }, [pathname, searchParams]);

  return null;
}
