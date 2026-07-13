import { z } from "zod";

/**
 * The Phase 12 Analytics Dashboard's date-range filter — Today/Last 7
 * Days/Last 30 Days/Last 90 Days/Custom, exactly per spec. `from`/`to`
 * are only meaningful (and required) when `range === "custom"`;
 * `lib/analytics-url.ts` and `services/analytics.service.ts`'s
 * `resolveDateRange()` are the two places that actually turn this into
 * concrete `Date` boundaries.
 */
export const analyticsRangeEnum = z.enum(["today", "7d", "30d", "90d", "custom"]);
export type AnalyticsRange = z.infer<typeof analyticsRangeEnum>;

export const analyticsFilterSchema = z.object({
  range: analyticsRangeEnum.default("30d"),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
export type AnalyticsFilterInput = z.infer<typeof analyticsFilterSchema>;

/** Top Jobs table's own search/sort/pagination — kept separate from the page-level date filter since it's a sub-table, not the whole dashboard. */
export const topJobsSortEnum = z.enum(["views", "website_clicks", "email_clicks", "ctr", "published_date"]);
export type TopJobsSort = z.infer<typeof topJobsSortEnum>;

export const topJobsSearchSchema = z.object({
  query: z.string().trim().max(200).optional(),
  sort: topJobsSortEnum.default("views"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
export type TopJobsSearchInput = z.infer<typeof topJobsSearchSchema>;
