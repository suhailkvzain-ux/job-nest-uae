"use client";

import { useEffect, useRef } from "react";

import { trackJobViewAction } from "@/actions/analytics.actions";

/**
 * Fires one view-count increment per job page visit, from the client
 * after mount — mirrors `PageViewTracker`'s shape exactly, and (Phase
 * 15) is what lets `/jobs/[slug]` itself be ISR-cached: see
 * `trackJobViewAction`'s doc comment in `actions/analytics.actions.ts`
 * for why this moved out of the page's own Server Component render.
 * `useRef` guards against a double-fire in React Strict Mode's
 * dev-only double-invoked effects — a production build never
 * double-invokes, but this keeps dev view counts honest too.
 */
export function JobViewTracker({ jobId }: { jobId: string }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    void trackJobViewAction(jobId);
  }, [jobId]);

  return null;
}
