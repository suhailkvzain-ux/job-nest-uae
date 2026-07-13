import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { buildJobsQueryString } from "@/lib/jobs-url";
import { cn } from "@/lib/utils";
import type { JobSearchInput } from "@/lib/validations/job";

interface JobsPaginationProps {
  filters: JobSearchInput;
  page: number;
  totalPages: number;
  basePath?: string;
}

/**
 * Real `<Link>`-based pagination for /jobs — deliberately not the
 * shared `Pagination` component (which is button/onClick-driven for
 * client-side state). Search engines and users without JS can follow
 * these links directly, matching the spec's "SEO-friendly URLs:
 * /jobs?page=2" requirement.
 */
export function JobsPagination({ filters, page, totalPages, basePath = "/jobs" }: JobsPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(page, totalPages);
  const hrefFor = (targetPage: number) => `${basePath}${buildJobsQueryString({ ...filters, page: targetPage })}`;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          rel="prev"
          aria-label="Previous page"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground/40">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors",
              p === page ? "bg-brand-gradient text-primary-foreground shadow-soft" : "text-foreground hover:bg-muted",
            )}
          >
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={hrefFor(page + 1)}
          rel="next"
          aria-label="Next page"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground/40">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}

/** Builds a compact page list with ellipses, e.g. 1 … 4 5 [6] 7 8 … 20 */
function getVisiblePages(current: number, total: number): (number | "ellipsis")[] {
  const delta = 1;
  const range: (number | "ellipsis")[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  if (left > 2) range.push("ellipsis");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push("ellipsis");
  if (total > 1) range.push(total);

  return range;
}
