import { FilterSidebarSkeleton } from "@/components/filters/filter-sidebar-skeleton";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { JobListSkeleton } from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-level loading UI for /jobs — shown while the server re-renders
 * the page for a new filter/sort/page combination. Mirrors the real
 * layout (sidebar + results) so there's no layout shift once data
 * arrives.
 */
export default function JobsLoading() {
  return (
    <>
      <Section spacing="compact" className="border-b border-border/60 bg-surface pt-8">
        <Container className="flex flex-col gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-96 max-w-full" />
          <Skeleton className="h-7 w-44 rounded-full" />
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
