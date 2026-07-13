import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-level loading UI for /jobs/[slug] — mirrors the real header +
 * two-column (content / sticky sidebar) + related-jobs layout so there's
 * no shift once the job data arrives.
 */
export default function JobDetailLoading() {
  return (
    <>
      <Section spacing="compact" className="border-b border-border/60 bg-surface pt-6">
        <Container>
          <Skeleton className="h-4 w-40" />
        </Container>
      </Section>

      <Section spacing="compact">
        <Container className="flex flex-col gap-8">
          <Skeleton className="mx-auto h-[90px] w-full max-w-[728px] rounded-2xl" />

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
            {/* Main content column */}
            <div className="flex min-w-0 flex-col gap-8">
              {/* Header skeleton */}
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-5 w-40 rounded-full" />
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-24 rounded-full" />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-28 rounded-full" />
                  ))}
                </div>
              </div>

              <Skeleton className="h-px w-full" />

              {/* Job content skeleton */}
              <div className="flex flex-col gap-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex flex-col gap-3">
                <Skeleton className="h-5 w-40" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-5/6" />
                ))}
              </div>

              {/* Related jobs skeleton */}
              <div className="flex flex-col gap-4">
                <Skeleton className="h-5 w-32" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="flex flex-col gap-2 p-5">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky sidebar skeleton */}
            <div className="flex flex-col gap-5">
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex-row items-center gap-3 space-y-0">
                  <Skeleton className="h-12 w-12 rounded-2xl" />
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-full rounded-lg" />
                </CardContent>
              </Card>
            </div>
          </div>

          <Skeleton className="mx-auto h-[90px] w-full max-w-[728px] rounded-2xl" />
        </Container>
      </Section>
    </>
  );
}
