import { z } from "zod";

import { employmentTypeEnum, jobStatusEnum } from "@/lib/validations/job";

/**
 * Search/filter/sort/pagination shape for the admin Jobs table
 * (`/admin/jobs`) — deliberately separate from the public `jobSearchSchema`
 * in `lib/validations/job.ts`. The admin table needs facets the public
 * site never exposes (filtering by exact `status`, published/deadline
 * date ranges) and identifies Company/Category/Location by id rather
 * than slug (simpler for a single-select admin filter fed directly from
 * `getAllCompanies()`/`getAllCategories()`/`getAllLocations()`, and admin
 * URLs don't need to be pretty/SEO-friendly the way public ones do).
 */
export const adminJobSortEnum = z.enum([
  "newest",
  "oldest",
  "title_az",
  "company_az",
  "published_date",
  "deadline",
  "featured_first",
]);
export type AdminJobSort = z.infer<typeof adminJobSortEnum>;

export const adminJobSearchSchema = z.object({
  query: z.string().trim().max(200).optional(),
  status: jobStatusEnum.optional(),
  companyId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  employmentType: employmentTypeEnum.optional(),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
  urgent: z.boolean().optional(),
  /** Derived-state filter for the "Expired" status tab — PUBLISHED jobs whose applicationDeadline has passed. Not a stored JobStatus value; kept separate from `status` so it can be applied on top of (or exclusive of) it. */
  expired: z.boolean().optional(),
  publishedFrom: z.coerce.date().optional(),
  publishedTo: z.coerce.date().optional(),
  deadlineFrom: z.coerce.date().optional(),
  deadlineTo: z.coerce.date().optional(),
  sort: adminJobSortEnum.default("newest"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type AdminJobSearchInput = z.infer<typeof adminJobSearchSchema>;
