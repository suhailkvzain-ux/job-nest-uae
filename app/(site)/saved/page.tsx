"use client";

import { Bookmark, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getSavedJobsAction } from "@/actions/jobs.actions";
import { JobListCard } from "@/components/jobs/job-list-card";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { EmptyState } from "@/components/shared/empty-state";
import { Heading } from "@/components/typography/heading";
import { Paragraph } from "@/components/typography/text";
import { buttonVariants } from "@/components/ui/button";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { cn } from "@/lib/utils";
import type { JobWithRelations } from "@/services/jobs.service";

/**
 * Saved Jobs — client-rendered since the list of saved ids only exists
 * in the visitor's own localStorage (this site has no accounts). On
 * mount, reads those ids and asks the server for the matching job
 * records via `getSavedJobsAction`; any id that no longer resolves to
 * a live published job (unpublished/expired/deleted) is simply
 * dropped rather than shown as an error.
 */
export default function SavedJobsPage() {
  const { savedIds } = useSavedJobs();
  const [jobs, setJobs] = useState<JobWithRelations[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (savedIds.length === 0) {
      setJobs([]);
      return;
    }
    setJobs(null);
    getSavedJobsAction(savedIds).then((result) => {
      if (!cancelled) setJobs(result);
    });
    return () => {
      cancelled = true;
    };
  }, [savedIds]);

  return (
    <Section spacing="compact">
      <Container className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Heading level="h2" as="h1">
            Saved Jobs
          </Heading>
          <Paragraph tone="secondary" className="max-w-lg">
            Jobs you&apos;ve bookmarked, saved on this device.
          </Paragraph>
        </div>

        {jobs === null ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No saved jobs yet"
            description="Tap the bookmark icon on any job to save it here for later — saved jobs are stored on this device only."
            action={
              <a href="/jobs" className={cn(buttonVariants({ variant: "outline" }))}>
                Browse Jobs
              </a>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {jobs.map((job) => (
              <JobListCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
