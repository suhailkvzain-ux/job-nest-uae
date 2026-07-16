"use client";

import { Bookmark } from "lucide-react";

import { useIsJobSaved } from "@/hooks/use-saved-jobs";
import { cn } from "@/lib/utils";

interface SaveJobButtonProps {
  jobId: string;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Bookmark toggle for job cards/headers — saved state lives in
 * localStorage only (see `useIsJobSaved`), since job seekers browse
 * this site without accounts. `stopPropagation`/`preventDefault` on
 * click so this works when nested inside a whole-card `<Link>`.
 */
export function SaveJobButton({ jobId, className, size = "sm" }: SaveJobButtonProps) {
  const { saved, toggle } = useIsJobSaved(jobId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved jobs" : "Save job"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        size === "sm" ? "h-7 w-7" : "h-9 w-9",
        saved && "text-primary hover:text-primary",
        className,
      )}
    >
      <Bookmark className={cn(size === "sm" ? "h-4 w-4" : "h-5 w-5", saved && "fill-current")} />
    </button>
  );
}
