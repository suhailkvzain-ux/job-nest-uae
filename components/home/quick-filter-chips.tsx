import Link from "next/link";

import { cn } from "@/lib/utils";

interface QuickFilterChip {
  label: string;
  href: string;
}

const QUICK_FILTERS: QuickFilterChip[] = [
  { label: "Dubai", href: "/jobs?location=dubai" },
  { label: "Abu Dhabi", href: "/jobs?location=abu-dhabi" },
  { label: "Sharjah", href: "/jobs?location=sharjah" },
  { label: "Remote", href: "/jobs?employmentType=REMOTE" },
  { label: "Full-Time", href: "/jobs?employmentType=FULL_TIME" },
  { label: "Internship", href: "/jobs?employmentType=INTERNSHIP" },
];

/** One-click shortcuts into the most common `/jobs` filter combinations. */
export function QuickFilterChips({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-2", className)}>
      {QUICK_FILTERS.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          className="rounded-full border border-border/60 bg-card/80 px-4 py-1.5 text-sm font-medium text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-soft"
        >
          {chip.label}
        </Link>
      ))}
    </div>
  );
}
