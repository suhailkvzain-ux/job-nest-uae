import { z } from "zod";

/**
 * Shared search/sort/pagination schema for the three reference-data
 * admin list pages (`/admin/companies`, `/admin/categories`,
 * `/admin/locations`). Companies, Categories, and Locations are
 * structurally identical for list purposes (name, slug, job count,
 * created date), so one schema — rather than three near-duplicates —
 * backs all three, the same way `admin-job.ts` has its own richer
 * schema for the Jobs list.
 */
export const masterDataSortEnum = z.enum(["name_az", "name_za", "newest", "oldest", "job_count"]);
export type MasterDataSort = z.infer<typeof masterDataSortEnum>;

export const masterDataSearchSchema = z.object({
  query: z.string().trim().max(200).optional(),
  sort: masterDataSortEnum.default("name_az"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type MasterDataSearchInput = z.infer<typeof masterDataSearchSchema>;
