import { Skeleton } from "@/components/ui/skeleton";

/**
 * Fallback loading UI for any admin route under this segment that
 * doesn't define its own more specific `loading.tsx` (e.g. Advertisements,
 * Categories, Companies, Locations, Settings, Job create/edit/preview).
 * The sidebar/topbar shell from `layout.tsx` stays mounted — this only
 * fills the content area — so navigating between admin sections never
 * flashes a blank page while the target route's data loads.
 */
export default function AdminSectionLoading() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-live="polite" aria-label="Loading">
      <span className="sr-only">Loading…</span>
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <Skeleton className="h-11 w-full max-w-md rounded-lg" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
