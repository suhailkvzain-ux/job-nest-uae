import {
  analyticsFilterSchema,
  topJobsSearchSchema,
  type AnalyticsFilterInput,
  type TopJobsSearchInput,
} from "@/lib/validations/analytics";

/**
 * URL⇄filter mapping for `/admin/analytics`. Two independent concerns
 * share one query string: the page-wide date-range filter
 * (`range`/`from`/`to`) and the Top Jobs table's own
 * search/sort/pagination (`q`/`sort`/`page`) — kept as distinct prefixes
 * so paginating the table doesn't disturb the active date filter and
 * vice versa, mirroring the master-data pages' URL-as-state convention.
 */

export type RawAnalyticsSearchParams = Record<string, string | string[] | undefined>;

function toSingle(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseAnalyticsFilterParams(searchParams: RawAnalyticsSearchParams): AnalyticsFilterInput {
  const raw = {
    range: toSingle(searchParams.range),
    from: toSingle(searchParams.from),
    to: toSingle(searchParams.to),
  };
  const parsed = analyticsFilterSchema.safeParse(raw);
  return parsed.success ? parsed.data : analyticsFilterSchema.parse({});
}

export function parseTopJobsSearchParams(searchParams: RawAnalyticsSearchParams): TopJobsSearchInput {
  const raw = {
    query: toSingle(searchParams.q),
    sort: toSingle(searchParams.jobSort),
    page: toSingle(searchParams.jobPage),
    pageSize: 10,
  };
  const parsed = topJobsSearchSchema.safeParse(raw);
  return parsed.success ? parsed.data : topJobsSearchSchema.parse({});
}

/** Builds the date-range portion of the query string, preserving the Top Jobs table's own params untouched. */
export function buildAnalyticsFilterQueryString(
  filter: Partial<AnalyticsFilterInput>,
  existing: RawAnalyticsSearchParams = {},
): string {
  const params = new URLSearchParams();

  if (filter.range && filter.range !== "30d") params.set("range", filter.range);
  if (filter.range === "custom") {
    if (filter.from) params.set("from", filter.from.toISOString().slice(0, 10));
    if (filter.to) params.set("to", filter.to.toISOString().slice(0, 10));
  }

  const q = toSingle(existing.q);
  const jobSort = toSingle(existing.jobSort);
  if (q) params.set("q", q);
  if (jobSort && jobSort !== "views") params.set("jobSort", jobSort);

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** Builds the Top Jobs table's own query-string portion, preserving the active date-range filter untouched. */
export function buildTopJobsQueryString(
  search: Partial<TopJobsSearchInput>,
  existing: RawAnalyticsSearchParams = {},
): string {
  const params = new URLSearchParams();

  const range = toSingle(existing.range);
  const from = toSingle(existing.from);
  const to = toSingle(existing.to);
  if (range && range !== "30d") params.set("range", range);
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  if (search.query) params.set("q", search.query);
  if (search.sort && search.sort !== "views") params.set("jobSort", search.sort);
  if (search.page && search.page > 1) params.set("jobPage", String(search.page));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
