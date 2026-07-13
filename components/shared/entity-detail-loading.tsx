import { FilterSidebarSkeleton } from "@/components/filters/filter-sidebar-skeleton";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { JobListSkeleton } from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shared route-level loading UI for the category/location/company
 * detail pages — identical layout regardless of entity type, so all
 * three `loading.tsx` files render this one component rather than
 * tripling the same markup.
 */
export function EntityDetailLoading() {
  return (
    <>
      <Section spacing="compact" className="border-b border-border/60 bg-surface pt-8">
        <Container className="flex flex-col gap-4">
          <Skeleton className="h-4 w-40" />
          <div className="flex items-start gap-4">
            <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-80 max-w-full" />
              <Skeleton className="h-7 w-44 rounded-full" />
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="compact">
        <Container className="flex flex-col gap-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">
              <FilterSidebarSkeleton />
            </aside>
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-11 w-40 rounded-full" />
              </div>
              <JobListSkeleton count={8} className="sm:grid-cols-1 lg:grid-cols-2" />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
