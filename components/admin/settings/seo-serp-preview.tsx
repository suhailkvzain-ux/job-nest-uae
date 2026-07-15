"use client";

import { useWatch, type Control } from "react-hook-form";

import type { SeoSettingsInput } from "@/lib/validations/settings";

/**
 * Live "how this looks in Google" preview — the spec's one interactive
 * requirement for SEO Settings. Reads the form's current (unsaved)
 * values via `useWatch`, so typing in Meta Title/Description updates
 * the mock result instantly, before the admin even hits Save. Title is
 * truncated the way Google itself does (~60 characters before it
 * starts eliding), same idea for the description (~160).
 */
export function SeoSerpPreview({ control }: { control: Control<SeoSettingsInput> }) {
  const metaTitle = useWatch({ control, name: "metaTitle" });
  const metaDescription = useWatch({ control, name: "metaDescription" });
  const canonicalDomain = useWatch({ control, name: "canonicalDomain" });

  const displayUrl = canonicalDomain
    ? canonicalDomain.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "www.jobforuae.com";

  const title = metaTitle || "Job For UAE | Find Jobs in the United Arab Emirates";
  const description =
    metaDescription ||
    "Browse verified job openings across Dubai, Abu Dhabi, Sharjah, and the rest of the UAE. Apply directly with employers.";

  return (
    <div className="rounded-2xl border border-border/60 bg-muted/30 p-5">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Search Result Preview
      </p>
      <div className="flex max-w-xl flex-col gap-1 rounded-xl bg-card p-4 shadow-soft">
        <span className="text-sm text-muted-foreground">{displayUrl}</span>
        <span className="truncate text-lg text-[#1a0dab]">{title.slice(0, 60)}</span>
        <span className="text-sm text-muted-foreground">{description.slice(0, 160)}</span>
      </div>
    </div>
  );
}
