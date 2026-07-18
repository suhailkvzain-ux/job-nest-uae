import { z } from "zod";

/**
 * Dedicated search/filter/sort schema for `/admin/categories` — split
 * out from the shared `masterDataSearchSchema` (still used by
 * Companies/Locations) the same way `admin-job.ts` split out from the
 * public `job.ts` schema: Categories now has facets (status, featured,
 * popular, display-order sort) the generic Master Data list never
 * needed.
 */
export const adminCategorySortEnum = z.enum([
  "display_order",
  "name_az",
  "name_za",
  "newest",
  "oldest",
  "job_count",
]);
export type AdminCategorySort = z.infer<typeof adminCategorySortEnum>;

export const adminCategorySearchSchema = z.object({
  query: z.string().trim().max(200).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  featured: z.boolean().optional(),
  popular: z.boolean().optional(),
  sort: adminCategorySortEnum.default("display_order"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type AdminCategorySearchInput = z.infer<typeof adminCategorySearchSchema>;
