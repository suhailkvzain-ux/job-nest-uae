"use client";

import { useEffect } from "react";

/**
 * Warns before the browser tab closes/refreshes/navigates to an
 * external URL while `isDirty` is true. This is a genuine platform
 * limitation worth being upfront about: Next.js App Router (as of v15)
 * has no built-in in-app navigation blocker like React Router's
 * `useBlocker` — this hook only covers true browser-level navigation
 * (`beforeunload`), not clicking a `<Link>` to another admin route mid-edit.
 * The job form's own "Cancel" action separately confirms before
 * navigating away in-app, which covers the most common deliberate exit.
 */
export function useUnsavedChangesWarning(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);
}
