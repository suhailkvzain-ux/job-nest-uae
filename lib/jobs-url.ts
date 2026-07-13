import { SLUG_TO_EMPLOYMENT_TYPE, EMPLOYMENT_TYPE_TO_SLUG } from "@/constants/employment-type-slugs";
import { jobSearchSchema, type JobSearchInput } from "@/lib/validations/job";

/**
 * Converts the /jobs page's URL query string into a validated
 * `JobSearchInput`, and back again — the single source of truth for the
 * URL scheme described in the design spec (`?location=dubai&category=
 * engineering&type=full-time`, `?search=interior+designer`, `?page=2`).
 *
 * Keeping both directions in one file means the search bar, filter
 * sidebar, sort dropdown, and pagination links can't drift out of sync
 * with what the page actually parses on the server.
 */

export type RawSearchParams = Record<string, string | string[] | undefined>;

function toSingle(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toList(value: string | string[] | undefined): string[] {
  const single = toSingle(value);
  if (!single) return [];
  return single
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

/** Parses raw Next.js `searchParams` into a validated `JobSearchInput`. */
export function parseJobsSearchParams(searchParams: RawSearchParams): JobSearchInput {
  const raw = {
    query: toSingle(searchParams.search),
    locationSlugs: toList(searchParams.location),
    categorySlugs: toList(searchParams.category),
    companySlugs: toList(searchParams.company),
    employmentTypes: toList(searchParams.type)
      .map((slug) => SLUG_TO_EMPLOYMENT_TYPE[slug])
      .filter((v): v is NonNullable<typeof v> => Boolean(v)),
    experience: toSingle(searchParams.experience),
    salaryMin: toSingle(searchParams.salaryMin),
    salaryMax: toSingle(searchParams.salaryMax),
    education: toList(searchParams.education),
    visaStatus: toList(searchParams.visaStatus),
    featured: toSingle(searchParams.featured) === "true" ? true : undefined,
    verified: toSingle(searchParams.verified) === "true" ? true : undefined,
    postedWithin: toSingle(searchParams.postedWithin),
    sort: toSingle(searchParams.sort),
    page: toSingle(searchParams.page),
    pageSize: 20,
  };

  const parsed = jobSearchSchema.safeParse(raw);
  return parsed.success ? parsed.data : jobSearchSchema.parse({ pageSize: 20 });
}

/**
 * Builds a `?...` query string from a (partial) `JobSearchInput`,
 * omitting empty/default values so URLs stay clean. Pass the current
 * filters plus any overrides, e.g.:
 *   buildJobsQueryString({ ...filters, page: 2 })
 */
export function buildJobsQueryString(filters: Partial<JobSearchInput>): string {
  const params = new URLSearchParams();

  if (filters.query) params.set("search", filters.query);
  if (filters.locationSlugs?.length) params.set("location", filters.locationSlugs.join(","));
  if (filters.categorySlugs?.length) params.set("category", filters.categorySlugs.join(","));
  if (filters.companySlugs?.length) params.set("company", filters.companySlugs.join(","));
  if (filters.employmentTypes?.length) {
    params.set("type", filters.employmentTypes.map((t) => EMPLOYMENT_TYPE_TO_SLUG[t]).join(","));
  }
  if (filters.experience) params.set("experience", filters.experience);
  if (typeof filters.salaryMin === "number") params.set("salaryMin", String(filters.salaryMin));
  if (typeof filters.salaryMax === "number") params.set("salaryMax", String(filters.salaryMax));
  if (filters.education?.length) params.set("education", filters.education.join(","));
  if (filters.visaStatus?.length) params.set("visaStatus", filters.visaStatus.join(","));
  if (filters.featured) params.set("featured", "true");
  if (filters.verified) params.set("verified", "true");
  if (filters.postedWithin) params.set("postedWithin", filters.postedWithin);
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** Counts how many *filter* facets are active — excludes `sort`/`page`/`pageSize`. */
export function countActiveFilters(filters: JobSearchInput): number {
  let count = 0;
  if (filters.query) count += 1;
  count += filters.locationSlugs.length > 0 ? 1 : 0;
  count += filters.categorySlugs.length > 0 ? 1 : 0;
  count += filters.companySlugs.length > 0 ? 1 : 0;
  count += filters.employmentTypes.length > 0 ? 1 : 0;
  if (filters.experience) count += 1;
  if (typeof filters.salaryMin === "number" || typeof filters.salaryMax === "number") count += 1;
  count += filters.education.length > 0 ? 1 : 0;
  count += filters.visaStatus.length > 0 ? 1 : 0;
  if (filters.featured) count += 1;
  if (filters.verified) count += 1;
  if (filters.postedWithin) count += 1;
  return count;
}
