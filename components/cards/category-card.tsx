import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Briefcase } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export interface CategoryCardProps {
  name: string;
  slug: string;
  jobCount?: number;
  /** Optional short blurb — Category has no stored description field yet, so this is only ever populated by a caller-generated string, not raw DB data. */
  description?: string | null;
  icon?: LucideIcon;
  className?: string;
  /** Cycles the card through the fixed badge palette so a grid of
   * category cards reads as varied and colorful (à la a services
   * grid) instead of a uniform stack of white cards. The tint covers
   * the *whole* card (not just the icon chip) — a soft-colored card
   * on a white page is what actually reads as "designed"; a white
   * card with a tinted icon in the corner is the flatter, more
   * generic-looking version of the same idea. */
  accent?: "blue" | "green" | "orange" | "purple";
}

const CHIP_CLASSES: Record<NonNullable<CategoryCardProps["accent"]>, string> = {
  blue: "bg-badge-blue-foreground/10 text-badge-blue-foreground",
  green: "bg-badge-green-foreground/10 text-badge-green-foreground",
  orange: "bg-badge-orange-foreground/10 text-badge-orange-foreground",
  purple: "bg-badge-purple-foreground/10 text-badge-purple-foreground",
};

/**
 * Category tile — links to `/categories/[slug]`. Neutral card surface
 * (not a full-color tint) with a single small colored icon chip as
 * the only accent — a restrained, premium look rather than a grid of
 * candy-colored blocks.
 */
export function CategoryCard({
  name,
  slug,
  jobCount,
  description,
  icon: Icon = Briefcase,
  className,
  accent = "purple",
}: CategoryCardProps) {
  return (
    <Link href={`/categories/${slug}`} className="block h-full">
      <div
        className={cn(
          "group h-full overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-soft-lg",
          className,
        )}
      >
        <div className="flex h-full flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                CHIP_CLASSES[accent],
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-foreground/30 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <span className="font-semibold text-foreground">{name}</span>
            {typeof jobCount === "number" && (
              <span className="text-sm text-foreground/60">
                {jobCount} {jobCount === 1 ? "job" : "jobs"}
              </span>
            )}
            {description && <p className="mt-1 text-xs text-foreground/60">{description}</p>}
          </div>
        </div>
      </div>
    </Link>
  );
}
