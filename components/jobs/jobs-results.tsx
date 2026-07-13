import { AdSlot } from "@/components/ads/ad-slot";
import { JobListCard } from "@/components/jobs/job-list-card";
import { JobsPagination } from "@/components/jobs/jobs-pagination";
import { JobsSortControl } from "@/components/jobs/jobs-sort-control";
import { Grid } from "@/components/layout/grid";
import { NoResultsState } from "@/components/search/no-results-state";
import type { JobSearchInput, JobSort } from "@/lib/validations/job";
import type { JobWithRelations } from "@/services/jobs.service";
import type { PaginatedResult } from "@/types";
import { formatNumber } from "@/utils/format";

const ADS_EVERY = 8;

/** Splits `jobs` into chunks of `size`, for interleaving ad banners. */
function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

interface JobsResultsProps {
  results: PaginatedResult<JobWithRelations>;
  filters: JobSearchInput;
  /** Pagination link prefix — defaults to `/jobs`, overridden by the category/location/company detail pages. */
  basePath?: string;
  /** Restricts the sort dropdown — see `SortFilter`. */
  sortOptions?: { label: string; value: JobSort }[];
}

/**
 * The main /jobs content: result count + sort control, the job grid with
 * a middle ad banner after every 8 cards, pagination, and a "no matching
 * jobs" empty state when the current filter combination has zero
 * results. Ads never sit beside the Apply buttons — they only ever
 * separate whole rows of cards.
 */
export function JobsResults({ results, filters, basePath = "/jobs", sortOptions }: JobsResultsProps) {
  const { items: jobs, total, page, totalPages } = results;

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <NoResultsState query={filters.query} />
      </div>
    );
  }

  const groups = chunk(jobs, ADS_EVERY);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Showing <span className="font-medium text-foreground">{formatNumber(jobs.length)}</span> of{" "}
          <span className="font-medium text-foreground">{formatNumber(total)}</span> jobs
        </p>
        <JobsSortControl filters={filters} options={sortOptions} />
      </div>

      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="flex flex-col gap-8">
          <Grid cols={{ base: 1, md: 2 }} gap="lg">
            {group.map((job) => (
              <JobListCard key={job.id} job={job} />
            ))}
          </Grid>
          {groupIndex < groups.length - 1 && <AdSlot position="JOBS_LISTING_MIDDLE" />}
        </div>
      ))}

      <JobsPagination filters={filters} page={page} totalPages={totalPages} basePath={basePath} />
    </div>
  );
}

