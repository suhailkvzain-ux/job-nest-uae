"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";

import { loadMoreLatestJobsAction } from "@/actions/jobs.actions";
import { JobCard } from "@/components/jobs/job-card";
import { Container } from "@/components/layout/container";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { EmptyState } from "@/components/shared/empty-state";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import { Button } from "@/components/ui/button";
import type { JobWithRelations } from "@/services/jobs.service";

const PAGE_SIZE = 6;

/**
 * Homepage "Latest Jobs" — newest published jobs first, with a
 * server-action-backed "Load More" so it stays a fast, mostly-static
 * server-rendered section while still supporting real pagination.
 */
export function LatestJobsSection({ initialJobs }: { initialJobs: JobWithRelations[] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialJobs.length === PAGE_SIZE);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    startTransition(async () => {
      const nextPage = page + 1;
      const nextJobs = await loadMoreLatestJobsAction(nextPage);
      setJobs((prev) => [...prev, ...nextJobs]);
      setPage(nextPage);
      setHasMore(nextJobs.length === PAGE_SIZE);
    });
  }

  return (
    <Section id="latest-jobs" aria-labelledby="latest-jobs-heading">
      <Container className="flex flex-col gap-5 sm:gap-10">
        <div className="flex flex-col items-center gap-1.5 text-center sm:gap-3">
          <Heading level="h2" as="h2" id="latest-jobs-heading" className="text-xl sm:text-h2">
            Latest Jobs
          </Heading>
          <Paragraph tone="secondary" className="max-w-lg text-xs sm:text-body">
            Freshly published vacancies, newest first.
          </Paragraph>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No jobs published yet"
            description="New verified vacancies are added regularly — check back soon."
          />
        ) : (
          <>
            <Grid cols={{ base: 2, sm: 2, lg: 3 }} gap="sm">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </Grid>

            {hasMore && (
              <div className="flex justify-center">
                <Button variant="outline" size="lg" onClick={handleLoadMore} disabled={isPending}>
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isPending ? "Loading…" : "Load More"}
                </Button>
              </div>
            )}
          </>
        )}
      </Container>
    </Section>
  );
}
