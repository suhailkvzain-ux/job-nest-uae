import { adminJobSearchSchema, type AdminJobSearchInput } from "@/lib/validations/admin-job";

/**
 * URL⇄filter-object mapping for `/admin/jobs`, the same role
 * `lib/jobs-url.ts` plays for the public `/jobs` page — one place every
 * search/filter/sort/pagination control reads and writes so they can't
 * drift out of sync. Admin URLs favor directness (`?companyId=<uuid>`)
 * over the public site's slug-based prettiness, since these links are
 * never meant to be indexed or shared.
 */

export type RawAdminSearchParams = Record<string, string | string[] | undefined>;

function toSingle(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseAdminJobsSearchParams(searchParams: RawAdminSearchParams): AdminJobSearchInput {
  const raw = {
    query: toSingle(searchParams.search),
    status: toSingle(searchParams.status),
    companyId: toSingle(searchParams.companyId),
    categoryId: toSingle(searchParams.categoryId),
    locationId: toSingle(searchParams.locationId),
    employmentType: toSingle(searchParams.type),
    featured: toSingle(searchParams.featured) === "true" ? true : undefined,
    verified: toSingle(searchParams.verified) === "true" ? true : undefined,
    publishedFrom: toSingle(searchParams.publishedFrom),
    publishedTo: toSingle(searchParams.publishedTo),
    deadlineFrom: toSingle(searchParams.deadlineFrom),
    deadlineTo: toSingle(searchParams.deadlineTo),
    sort: toSingle(searchParams.sort),
    page: toSingle(searchParams.page),
    pageSize: 20,
  };

  const parsed = adminJobSearchSchema.safeParse(raw);
  return parsed.success ? parsed.data : adminJobSearchSchema.parse({});
}

export function buildAdminJobsQueryString(filters: Partial<AdminJobSearchInput>): string {
  const params = new URLSearchParams();

  if (filters.query) params.set("search", filters.query);
  if (filters.status) params.set("status", filters.status);
  if (filters.companyId) params.set("companyId", filters.companyId);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.locationId) params.set("locationId", filters.locationId);
  if (filters.employmentType) params.set("type", filters.employmentType);
  if (filters.featured) params.set("featured", "true");
  if (filters.verified) params.set("verified", "true");
  if (filters.publishedFrom) params.set("publishedFrom", filters.publishedFrom.toISOString());
  if (filters.publishedTo) params.set("publishedTo", filters.publishedTo.toISOString());
  if (filters.deadlineFrom) params.set("deadlineFrom", filters.deadlineFrom.toISOString());
  if (filters.deadlineTo) params.set("deadlineTo", filters.deadlineTo.toISOString());
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** Counts active filter facets — excludes sort/page/pageSize. Used for the "Clear Filters" badge. */
export function countActiveAdminFilters(filters: AdminJobSearchInput): number {
  let count = 0;
  if (filters.query) count += 1;
  if (filters.status) count += 1;
  if (filters.companyId) count += 1;
  if (filters.categoryId) count += 1;
  if (filters.locationId) count += 1;
  if (filters.employmentType) count += 1;
  if (filters.featured) count += 1;
  if (filters.verified) count += 1;
  if (filters.publishedFrom || filters.publishedTo) count += 1;
  if (filters.deadlineFrom || filters.deadlineTo) count += 1;
  return count;
}
