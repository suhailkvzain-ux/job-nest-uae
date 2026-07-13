import { SimilarJobCard } from "@/components/jobs/job-card";
import { Grid } from "@/components/layout/grid";
import { Heading } from "@/components/typography/heading";
import type { JobWithRelations } from "@/services/jobs.service";

/** "Related jobs" rail — feed it the result of `getRelatedJobs()`. */
export function RelatedJobs({ jobs, title = "Similar jobs" }: { jobs: JobWithRelations[]; title?: string }) {
  if (jobs.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <Heading level="h4">{title}</Heading>
      <Grid cols={{ base: 1, md: 2 }} gap="md">
        {jobs.map((job) => (
          <SimilarJobCard key={job.id} job={job} />
        ))}
      </Grid>
    </section>
  );
}
