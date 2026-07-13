import { Star } from "lucide-react";
import Link from "next/link";

import { FeaturedJobCard } from "@/components/jobs/job-card";
import { Container } from "@/components/layout/container";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { StaggerContainer, StaggerItem } from "@/components/motion/motion-wrappers";
import { EmptyState } from "@/components/shared/empty-state";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { JobWithRelations } from "@/services/jobs.service";

/** Homepage "Featured Jobs" — premium cards for promoted listings, max 6. */
export function FeaturedJobsSection({ jobs }: { jobs: JobWithRelations[] }) {
  return (
    <Section className="bg-surface" id="featured-jobs" aria-labelledby="featured-jobs-heading">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <Heading level="h2" as="h2" id="featured-jobs-heading">
            Featured Jobs
          </Heading>
          <Paragraph tone="secondary" className="max-w-lg">
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
            <StaggerContainer>
              <Grid cols={{ base: 1, sm: 2, lg: 3 }} gap="lg">
                {jobs.map((job) => (
                  <StaggerItem key={job.id}>
                    <FeaturedJobCard job={job} />
                  </StaggerItem>
                ))}
              </Grid>
            </StaggerContainer>

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
