import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Briefcase } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CategoryCardProps {
  name: string;
  slug: string;
  jobCount?: number;
  /** Optional short blurb — Category has no stored description field yet, so this is only ever populated by a caller-generated string, not raw DB data. */
  description?: string | null;
  icon?: LucideIcon;
  className?: string;
}

/** Category tile — links to `/categories/[slug]`. */
export function CategoryCard({ name, slug, jobCount, description, icon: Icon = Briefcase, className }: CategoryCardProps) {
  return (
    <Link href={`/categories/${slug}`} className="block h-full">
      <Card className={cn("group h-full transition-all hover:-translate-y-0.5 hover:shadow-soft-lg", className)}>
        <CardContent className="flex h-full flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary transition-colors group-hover:bg-brand-gradient group-hover:text-primary-foreground">
              <Icon className="h-5 w-5" />
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <span className="font-semibold text-foreground">{name}</span>
            {typeof jobCount === "number" && (
              <span className="text-sm text-muted-foreground">
                {jobCount} {jobCount === 1 ? "job" : "jobs"}
              </span>
            )}
            {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
