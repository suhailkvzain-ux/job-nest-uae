import { z } from "zod";

/**
 * Zod schemas for the Job domain.
 *
 * These mirror `prisma/schema.prisma` field-for-field. Keeping enum
 * values here as string literals (rather than importing the Prisma enum)
 * means this file has zero dependency on a generated `@prisma/client` —
 * it can be imported by client components, edge functions, or tests
 * without pulling in Prisma.
 */

export const employmentTypeEnum = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "TEMPORARY",
  "INTERNSHIP",
  "REMOTE",
  "HYBRID",
  "FREELANCE",
]);

export const jobStatusEnum = z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]);

/**
 * Shared field-level rules, reused by both create and update schemas.
 */
const baseJobFields = {
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().trim().min(20, "Description must be at least 20 characters"),
  responsibilities: z.string().trim().min(1).optional().nullable(),
  requirements: z.string().trim().min(1).optional().nullable(),
  benefits: z.string().trim().min(1).optional().nullable(),

  companyId: z.string().uuid("companyId must be a valid UUID"),
  categoryId: z.string().uuid("categoryId must be a valid UUID"),
  locationId: z.string().uuid("locationId must be a valid UUID"),

  employmentType: employmentTypeEnum,
  experience: z.string().trim().max(100).optional().nullable(),

  salaryMin: z.coerce.number().int().nonnegative().optional().nullable(),
  salaryMax: z.coerce.number().int().nonnegative().optional().nullable(),
  salaryCurrency: z.string().trim().length(3, "Use a 3-letter ISO currency code, e.g. AED").default("AED"),

  education: z.string().trim().max(150).optional().nullable(),
  visaStatus: z.string().trim().max(150).optional().nullable(),
  nationality: z.string().trim().max(150).optional().nullable(),
  languages: z.array(z.string().trim().min(1)).default([]),
  vacancies: z.coerce.number().int().positive().default(1),

  officialWebsite: z.string().trim().url("Must be a valid URL").optional().nullable(),
  officialEmail: z.string().trim().email("Must be a valid email").optional().nullable(),
  applicationDeadline: z.coerce.date().optional().nullable(),

  status: jobStatusEnum.default("DRAFT"),
  featured: z.boolean().default(false),
  verified: z.boolean().default(false),

  metaTitle: z.string().trim().max(70, "Keep meta titles under ~70 characters for SEO").optional().nullable(),
  metaDescription: z
    .string()
    .trim()
    .max(160, "Keep meta descriptions under ~160 characters for SEO")
    .optional()
    .nullable(),
  ogTitle: z.string().trim().max(70, "Keep Open Graph titles under ~70 characters").optional().nullable(),
  ogDescription: z
    .string()
    .trim()
    .max(200, "Keep Open Graph descriptions under ~200 characters")
    .optional()
    .nullable(),
};

/**
 * `slug` lives outside `baseJobFields` — it's not a plain data field,
 * it's derived-by-default (title + company + location) with an
 * optional manual override, and the service layer (not this schema)
 * enforces uniqueness via `ensureUniqueSlug()`. Loose validation here
 * (no regex) is deliberate: whatever the admin types is normalized by
 * `slugify()` downstream, the same way an auto-generated slug is.
 */
const slugField = z.string().trim().min(2).max(220).optional();

export const createJobSchema = z
  .object({ ...baseJobFields, slug: slugField })
  .refine((data) => Boolean(data.officialWebsite) || Boolean(data.officialEmail), {
    message: "Provide at least an official website or an official email so candidates can apply",
    path: ["officialWebsite"],
  })
  .refine((data) => !data.salaryMin || !data.salaryMax || data.salaryMin <= data.salaryMax, {
    message: "salaryMin cannot be greater than salaryMax",
    path: ["salaryMin"],
  });

export type CreateJobInput = z.infer<typeof createJobSchema>;

/**
 * Update schema: every field optional (partial update), but slug/id are
 * handled separately by the service layer — this schema only validates
 * the editable job fields.
 */
export const updateJobSchema = z.object({ ...baseJobFields, slug: slugField }).partial();

export type UpdateJobInput = z.infer<typeof updateJobSchema>;

export const postedWithinEnum = z.enum(["today", "3days", "week", "month"]);
export type PostedWithin = z.infer<typeof postedWithinEnum>;

export const jobSortEnum = z.enum(["newest", "oldest", "salary_desc", "salary_asc", "az", "featured_first"]);
export type JobSort = z.infer<typeof jobSortEnum>;

/**
 * Query params accepted by `searchJobs()` / `filterJobs()` — the shape
 * the service layer works with (arrays, not URL-encoded comma strings).
 * The /jobs page's `lib/jobs-url.ts` is responsible for converting to
 * and from the actual URL query string (`?location=dubai,sharjah`,
 * `?type=full-time`, etc.) — this schema only validates the parsed
 * result, so it has no knowledge of URL formatting.
 */
export const jobSearchSchema = z.object({
  query: z.string().trim().max(200).optional(),
  companySlugs: z.array(z.string().trim()).default([]),
  locationSlugs: z.array(z.string().trim()).default([]),
  categorySlugs: z.array(z.string().trim()).default([]),
  employmentTypes: z.array(employmentTypeEnum).default([]),
  experience: z.string().trim().optional(),
  salaryMin: z.coerce.number().int().nonnegative().optional(),
  salaryMax: z.coerce.number().int().nonnegative().optional(),
  education: z.array(z.string().trim()).default([]),
  visaStatus: z.array(z.string().trim()).default([]),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
  postedWithin: postedWithinEnum.optional(),
  status: jobStatusEnum.optional(),
  sort: jobSortEnum.default("newest"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(12),
});

export type JobSearchInput = z.infer<typeof jobSearchSchema>;
