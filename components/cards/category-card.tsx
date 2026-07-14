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

const CARD_BG: Record<NonNullable<CategoryCardProps["accent"]>, string> = {
  blue: "bg-badge-blue",
  green: "bg-badge-green",
  orange: "bg-badge-orange",
  purple: "bg-badge-purple",
};

const CHIP_CLASSES: Record<NonNullable<CategoryCardProps["accent"]>, string> = {
  blue: "bg-badge-blue-foreground text-white",
  green: "bg-badge-green-foreground text-white",
  orange: "bg-badge-orange-foreground text-white",
  purple: "bg-badge-purple-foreground text-white",
};

/** Category tile — links to `/categories/[slug]`. */
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
          "group h-full overflow-hidden rounded-2xl border border-black/[0.03] transition-all hover:-translate-y-1 hover:shadow-soft-lg dark:border-white/[0.04]",
          CARD_BG[accent],
          className,
        )}
      >
        <div className="flex h-full flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-105",
                CHIP_CLASSES[accent],
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
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
