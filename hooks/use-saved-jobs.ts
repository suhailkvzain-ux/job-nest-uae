"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "jobforuae:saved-jobs";

function readSaved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeSaved(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event("jobforuae:saved-jobs-changed"));
  } catch {
    // localStorage unavailable (private browsing, etc.) — fail silently.
  }
}

/**
 * Saved/bookmarked jobs — stored client-side only (no accounts on the
 * public site), keyed by job id. `useSavedJobs()` gives the full list
 * (for the /saved page and the bottom-nav badge count); components
 * that just need a single job's saved state and a toggle should use
 * `useIsJobSaved(jobId)` instead so they don't re-render on every
 * other job's save/unsave.
 */
export function useSavedJobs() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(readSaved());
    function onChange() {
      setIds(readSaved());
    }
    window.addEventListener("jobforuae:saved-jobs-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("jobforuae:saved-jobs-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const toggle = useCallback((jobId: string) => {
    const current = readSaved();
    const next = current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId];
    writeSaved(next);
    setIds(next);
  }, []);

  const isSaved = useCallback((jobId: string) => ids.includes(jobId), [ids]);

  return { savedIds: ids, isSaved, toggle };
}

/** Lightweight single-job hook for job cards — avoids subscribing every card to every other card's changes. */
export function useIsJobSaved(jobId: string) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readSaved().includes(jobId));
    function onChange() {
      setSaved(readSaved().includes(jobId));
    }
    window.addEventListener("jobforuae:saved-jobs-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("jobforuae:saved-jobs-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [jobId]);

  const toggle = useCallback(() => {
    const current = readSaved();
    const next = current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId];
    writeSaved(next);
    setSaved(next.includes(jobId));
  }, [jobId]);

  return { saved, toggle };
}
