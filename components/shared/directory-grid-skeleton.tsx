import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Card-shaped skeleton matching CategoryCard/CompanyCard/LocationCard's shared layout. */
function DirectoryCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-surface p-6 text-center">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

/**
 * Route-level loading UI shared by the Categories/Locations/Companies
 * directory pages — same header (title + search bar) + grid shape as the
 * real page so there's no layout shift once data arrives.
 */
export function DirectoryGridSkeleton({
  count = 10,
  cols = { base: 2, sm: 3, lg: 5 },
  className,
}: {
  count?: number;
  cols?: { base?: number; sm?: number; lg?: number };
  className?: string;
}) {
  const colsClass = (n: number | undefined, prefix: string) => (n ? `${prefix}grid-cols-${n}` : "");
  return (
    <div
      className={cn(
        "grid gap-4",
        colsClass(cols.base, ""),
        colsClass(cols.sm, "sm:"),
        colsClass(cols.lg, "lg:"),
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <DirectoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DirectoryPageLoading({
  cols,
  count,
}: {
  cols?: { base?: number; sm?: number; lg?: number };
  count?: number;
}) {
  return (
    <div
      className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <span className="sr-only">Loading…</span>
      <div className="flex flex-col items-center gap-4 text-center">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-96 max-w-full" />
        <Skeleton className="h-11 w-72 rounded-full" />
      </div>
      <DirectoryGridSkeleton cols={cols} count={count} />
    </div>
  );
}
