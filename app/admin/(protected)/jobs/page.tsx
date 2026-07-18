import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { AdminJobsFilters } from "@/components/admin/jobs/admin-jobs-filters";
import { AdminJobsPagination } from "@/components/admin/jobs/admin-jobs-pagination";
import { AdminJobsSearchBar } from "@/components/admin/jobs/admin-jobs-search-bar";
import { AdminJobsSortControl } from "@/components/admin/jobs/admin-jobs-sort-control";
import { AdminJobsStatusTabs } from "@/components/admin/jobs/admin-jobs-status-tabs";
import { AdminJobsTable } from "@/components/admin/jobs/admin-jobs-table";
import { ExportJobsCsvButton } from "@/components/admin/jobs/export-jobs-csv-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { parseAdminJobsSearchParams, type RawAdminSearchParams } from "@/lib/admin-jobs-url";
import type { AdminJobSearchInput } from "@/lib/validations/admin-job";
import { getAllCategories } from "@/services/categories.service";
import { getAllCompanies } from "@/services/companies.service";
import { getAdminJobsList, getAdminJobStatusCounts } from "@/services/jobs.service";
import { getAllLocations } from "@/services/locations.service";
import { formatNumber } from "@/utils/format";

export const metadata = { title: "Jobs | Admin" };
export const dynamic = "force-dynamic";

interface AdminJobsPageProps {
  searchParams: Promise<RawAdminSearchParams>;
}

function AdminJobsResultsSkeleton() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-live="polite" aria-label="Loading jobs">
      <span className="sr-only">Loading jobs…</span>
      <Skeleton className="h-14 w-full max-w-xl rounded-2xl" />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-4 w-28" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/**
 * The count/export header, table, and pagination all depend on
 * `getAdminJobsList()` — the query whose cost actually varies with the
 * current search/filter/sort combination — so they're grouped into
 * their own streamed component. The search bar, filters, and sort
 * control above them only need the (fast, small) reference-data lists,
 * so they paint immediately without waiting on the jobs query.
 */
async function AdminJobsResultsAsync({ filters }: { filters: AdminJobSearchInput }) {
  const results = await getAdminJobsList(filters);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{formatNumber(results.total)}</span> total jobs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportJobsCsvButton jobs={results.items} />
          <Button asChild className="gap-2">
            <Link href="/admin/jobs/new">
              <Plus className="h-4 w-4" /> Create New Job
            </Link>
          </Button>
        </div>
      </div>

      <AdminJobsTable jobs={results.items} />

      <AdminJobsPagination filters={filters} page={results.page} totalPages={results.totalPages} />
    </>
  );
}

/**
 * The full admin Job Management list — search, filters, sort, bulk
 * actions, pagination, all URL-driven and server-rendered the same way
 * the public `/jobs` page works, just against every job status instead
 * of published-only. `force-dynamic` (like the dashboard) since an
 * admin managing jobs needs to see the current state, not an
 * ISR-cached one.
 */
export default async function AdminJobsPage({ searchParams }: AdminJobsPageProps) {
  const filters = parseAdminJobsSearchParams(await searchParams);

  const [companies, categories, locations] = await Promise.all([
    getAllCompanies(),
    getAllCategories(),
    getAllLocations(),
  ]);

  const statusCounts = await getAdminJobStatusCounts();

  return (
    <div className="flex flex-col gap-6">
      <AdminJobsSearchBar />

      <AdminJobsStatusTabs filters={filters} counts={statusCounts} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <AdminJobsFilters
          initialFilters={filters}
          companies={companies.map((c) => ({ id: c.id, name: c.name }))}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          locations={locations.map((l) => ({ id: l.id, name: l.name }))}
        />
        <AdminJobsSortControl filters={filters} />
      </div>

      <Suspense key={JSON.stringify(filters)} fallback={<AdminJobsResultsSkeleton />}>
        <AdminJobsResultsAsync filters={filters} />
      </Suspense>
    </div>
  );
}
