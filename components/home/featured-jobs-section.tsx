import { Star } from "lucide-react";
import Link from "next/link";

import { FeaturedJobCard } from "@/components/jobs/job-card";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { EmptyState } from "@/components/shared/empty-state";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { JobWithRelations } from "@/services/jobs.service";

/**
 * Homepage "Featured Jobs" (aka "Top Jobs") — premium cards for
 * promoted listings, max 6. Rendered as a single horizontally
 * swipeable row (snap-scroll, no wrapping) on every breakpoint rather
 * than a stacked grid, so this section never adds more vertical
 * scroll no matter how many featured jobs exist.
 */
export function FeaturedJobsSection({ jobs }: { jobs: JobWithRelations[] }) {
  return (
    <Section className="bg-surface" id="featured-jobs" aria-labelledby="featured-jobs-heading">
      <Container className="flex flex-col gap-5 sm:gap-10">
        <div className="flex flex-col items-center gap-1.5 text-center sm:gap-3">
          <Heading level="h2" as="h2" id="featured-jobs-heading" className="text-xl sm:text-h2">
            Top Jobs
          </Heading>
          <Paragraph tone="secondary" className="max-w-lg text-xs sm:text-body">
            Hand-picked, verified vacancies from employers actively hiring right now.
          </Paragraph>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No featured jobs yet"
            description="Check back soon — verified featured vacancies will appear here as employers post them."
          />
        ) : (
          <>
            <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 scrollbar-none sm:gap-4 sm:px-0 lg:mx-0">
              {jobs.map((job) => (
                <div key={job.id} className="w-[62%] shrink-0 snap-start sm:w-[300px]">
                  <FeaturedJobCard job={job} className="h-full" />
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Link href="/jobs" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                View All Jobs
              </Link>
            </div>
          </>
        )}
      </Container>
    </Section>
  );
}
