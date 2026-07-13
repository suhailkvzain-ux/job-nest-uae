import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton placeholder matching `JobsFilterSidebar`'s rough shape. */
export function FilterSidebarSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-5 w-20" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      ))}
      <Skeleton className="h-11 w-full rounded-full" />
    </div>
  );
}
