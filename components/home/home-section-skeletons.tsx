import { Container } from "@/components/layout/container";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { JobListSkeleton } from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Suspense fallbacks for the homepage's independently-streamed sections.
 * Each mirrors its real section's chrome (heading + description + grid
 * shape) so nothing jumps once the underlying data resolves — same
 * "match the real layout" rule the route-level `loading.tsx` files
 * already follow.
 */

function SectionHeadingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </div>
  );
}

export function FeaturedJobsSkeleton() {
  return (
    <Section className="bg-surface" role="status" aria-live="polite" aria-label="Loading featured jobs">
      <span className="sr-only">Loading featured jobs…</span>
      <Container className="flex flex-col gap-10">
        <SectionHeadingSkeleton />
        <JobListSkeleton count={6} />
      </Container>
    </Section>
  );
}

export function LatestJobsSkeleton() {
  return (
    <Section role="status" aria-live="polite" aria-label="Loading latest jobs">
      <span className="sr-only">Loading latest jobs…</span>
      <Container className="flex flex-col gap-10">
        <SectionHeadingSkeleton />
        <JobListSkeleton count={12} className="sm:grid-cols-2 lg:grid-cols-3" />
      </Container>
    </Section>
  );
}

export function PopularCompaniesSkeleton() {
  return (
    <Section className="bg-surface" role="status" aria-live="polite" aria-label="Loading popular companies">
      <span className="sr-only">Loading popular companies…</span>
      <Container className="flex flex-col gap-10">
        <SectionHeadingSkeleton />
        <Grid cols={{ base: 2, sm: 3, lg: 4 }} gap="md">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 p-6">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
