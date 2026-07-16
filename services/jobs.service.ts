import type { AnalyticsEventType, Job, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { ensureUniqueSlug } from "@/lib/slug";
import type { AdminJobSearchInput, AdminJobSort } from "@/lib/validations/admin-job";
import type { CreateJobInput, JobSearchInput, UpdateJobInput } from "@/lib/validations/job";
import { logActivity } from "@/services/activity-log.service";
import { recordAnalyticsEvent } from "@/services/analytics-events.service";
import type { PaginatedResult } from "@/types";

/**
 * Job service — the only place `prisma.job.*` should be called from.
 * Actions/route handlers/artifacts call into these functions rather than
 * touching Prisma directly, so the soft-delete rule and query shape stay
 * consistent everywhere.
 */

/**
 * Merge this into every `where` clause that reads jobs for the public
 * site (or any listing that shouldn't include deleted jobs). Not applied
 * globally via middleware/extension on purpose — an explicit, greppable
 * filter is easier to audit than implicit magic, and an Admin "trash"
 * view (restoring a soft-deleted job) can simply skip it.
 */
export const ACTIVE_JOB_WHERE = { deletedAt: null } as const satisfies Prisma.JobWhereInput;

/**
 * "Application deadline hasn't passed" — the second half of what makes
 * a `PUBLISHED` job actually visible on the public site, alongside
 * `ACTIVE_JOB_WHERE`. A job past its deadline keeps `status:
 * "PUBLISHED"` forever (nothing auto-archives it), and `/jobs/[slug]`
 * already 404s for one via its own `isExpired()` check — but until this
 * fix (Phase 17 QA pass), every *listing* query (`/jobs`, homepage
 * Latest/Featured Jobs, Related Jobs, the Education/Visa Status filter
 * options) had no matching exclusion, so an expired job could still show
 * up as a clickable card that 404s the moment a visitor opens it. A
 * function rather than a constant because `new Date()` must be
 * evaluated fresh on every call, not once at module load.
 */
function notExpiredWhere(): Prisma.JobWhereInput {
  return { OR: [{ applicationDeadline: null }, { applicationDeadline: { gte: new Date() } }] };
}

const jobWithRelations = {
  company: true,
  category: true,
  location: true,
  analytics: true,
} as const satisfies Prisma.JobInclude;

export type JobWithRelations = Prisma.JobGetPayload<{ include: typeof jobWithRelations }>;

// ─────────────────────────────────────────────────────────────
// Create / update / lifecycle
// ─────────────────────────────────────────────────────────────

/**
 * Default slug source: "{title} {company name} {location name}" — per
 * the Phase 9 spec, richer than just the title alone (Phase 2's
 * original behavior), so two similarly-titled roles at different
 * companies/locations don't immediately collide into "-2"/"-3" suffixes.
 * Only used when the admin hasn't provided a manual `slug` override.
 */
async function buildDefaultJobSlugBase(input: {
  title: string;
  companyId: string;
  locationId: string;
}): Promise<string> {
  const [company, location] = await Promise.all([
    prisma.company.findUnique({ where: { id: input.companyId } }),
    prisma.location.findUnique({ where: { id: input.locationId } }),
  ]);

  return [input.title, company?.name, location?.name].filter(Boolean).join(" ");
}

export async function createJob(input: CreateJobInput): Promise<Job> {
  const { slug: slugOverride, ...data } = input;
  const slugBase = slugOverride || (await buildDefaultJobSlugBase(input));

  const slug = await ensureUniqueSlug(slugBase, (candidate) =>
    prisma.job.findUnique({ where: { slug: candidate } }).then(Boolean),
  );

  const job = await prisma.job.create({
    data: { ...data, slug },
  });
  void logActivity("JOB_CREATED", job.title);
  return job;
}

/**
 * `input.slug`, if present, is treated as a requested override and
 * re-slugified/uniqueness-checked (excluding this job's own row, so
 * saving a job without changing its slug doesn't collide with itself).
 * Omit `slug` entirely to leave the existing one untouched.
 */
export async function updateJob(id: string, input: UpdateJobInput): Promise<Job> {
  const { slug: slugOverride, ...data } = input;

  const finalData: Prisma.JobUpdateInput = { ...data };

  if (slugOverride) {
    finalData.slug = await ensureUniqueSlug(slugOverride, (candidate) =>
      prisma.job.findFirst({ where: { slug: candidate, id: { not: id } } }).then(Boolean),
    );
  }

  const job = await prisma.job.update({
    where: { id },
    data: finalData,
  });
  void logActivity("JOB_UPDATED", job.title);
  return job;
}

/**
 * Soft delete — never removes the row. `getJobBySlug`, `getLatestJobs`,
 * `getFeaturedJobs`, `searchJobs`, `filterJobs`, and `getRelatedJobs` all
 * filter `deletedAt: null`, so a soft-deleted job disappears from every
 * public-facing read immediately.
 */
export async function deleteJob(id: string): Promise<Job> {
  const job = await prisma.job.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  void logActivity("JOB_DELETED", job.title);
  return job;
}

/** Reverses `deleteJob` — restores a job from the Admin trash view. */
export async function restoreJob(id: string): Promise<Job> {
  return prisma.job.update({
    where: { id },
    data: { deletedAt: null },
  });
}

export async function publishJob(id: string): Promise<Job> {
  const existing = await prisma.job.findUniqueOrThrow({ where: { id } });

  const job = await prisma.job.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      // Preserve the original publish date if this job was already
      // published before (e.g. re-publishing after an edit).
      publishedAt: existing.publishedAt ?? new Date(),
    },
  });
  void logActivity("JOB_PUBLISHED", job.title);
  return job;
}

/**
 * Marks a job to go live at a future date. `publishedAt` is set to that
 * future date now (so `getLatestJobs`/ordering is correct once it goes
 * live), but `status` stays SCHEDULED until `publishDueScheduledJobs()`
 * flips it — this project's `schedule` skill can run that on a cron
 * (e.g. every 5 minutes) once the admin panel exists.
 */
export async function scheduleJob(id: string, publishAt: Date): Promise<Job> {
  if (publishAt.getTime() <= Date.now()) {
    throw new Error("scheduleJob: publishAt must be in the future — use publishJob() instead");
  }

  return prisma.job.update({
    where: { id },
    data: { status: "SCHEDULED", publishedAt: publishAt },
  });
}

/**
 * Flips any due SCHEDULED jobs to PUBLISHED. Runs on a cron — see
 * `app/api/cron/publish-scheduled-jobs/route.ts` and `vercel.json`
 * (Phase 17 fix: this function existed since Phase 9 but nothing ever
 * called it, so a scheduled job's status silently never flipped once
 * its publish date arrived — both `filterJobs()`/`getLatestJobs()`
 * and `/jobs/[slug]`'s own `status !== "PUBLISHED"` check only ever
 * recognize the literal `PUBLISHED` status, so a job stuck on
 * `SCHEDULED` past its due date was invisible everywhere on the public
 * site until an admin noticed and manually clicked Publish).
 */
export async function publishDueScheduledJobs(): Promise<number> {
  const due = await prisma.job.findMany({
    where: { status: "SCHEDULED", publishedAt: { lte: new Date() }, ...ACTIVE_JOB_WHERE },
    select: { id: true, title: true },
  });

  if (due.length === 0) return 0;

  await prisma.job.updateMany({
    where: { id: { in: due.map((job) => job.id) } },
    data: { status: "PUBLISHED" },
  });

  for (const job of due) {
    void logActivity("JOB_PUBLISHED", job.title);
  }

  return due.length;
}

export async function archiveJob(id: string): Promise<Job> {
  const job = await prisma.job.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
  void logActivity("JOB_ARCHIVED", job.title);
  return job;
}

/**
 * Clones a job into a new DRAFT listing — useful for re-posting a
 * recurring vacancy. The clone gets a fresh slug/id/timestamps and
 * starts unpublished, unfeatured, unverified, with its own (empty)
 * analytics.
 */
export async function duplicateJob(id: string): Promise<Job> {
  const original = await prisma.job.findUniqueOrThrow({ where: { id } });

  const slug = await ensureUniqueSlug(`${original.title}-copy`, (candidate) =>
    prisma.job.findUnique({ where: { slug: candidate } }).then(Boolean),
  );

  return prisma.job.create({
    data: {
      slug,
      companyId: original.companyId,
      categoryId: original.categoryId,
      locationId: original.locationId,
      title: original.title,
      description: original.description,
      responsibilities: original.responsibilities,
      requirements: original.requirements,
      benefits: original.benefits,
      employmentType: original.employmentType,
      experience: original.experience,
      salaryMin: original.salaryMin,
      salaryMax: original.salaryMax,
      salaryCurrency: original.salaryCurrency,
      education: original.education,
      visaStatus: original.visaStatus,
      nationality: original.nationality,
      languages: original.languages,
      vacancies: original.vacancies,
      officialWebsite: original.officialWebsite,
      officialEmail: original.officialEmail,
      applicationDeadline: original.applicationDeadline,
      metaTitle: original.metaTitle,
      metaDescription: original.metaDescription,
      // Deliberately reset lifecycle fields — a duplicate is a new draft.
      status: "DRAFT",
      featured: false,
      verified: false,
      publishedAt: null,
      deletedAt: null,
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────

export async function getJobBySlug(slug: string): Promise<JobWithRelations | null> {
  return prisma.job.findFirst({
    where: { slug, ...ACTIVE_JOB_WHERE },
    include: jobWithRelations,
  });
}

/**
 * Newest published jobs, paginated. Defaults to page 1 / 10 per page —
 * the homepage requests page size 12 explicitly, and "Load More" walks
 * subsequent pages via `actions/jobs.actions.ts`.
 */
export async function getLatestJobs(
  params: { page?: number; pageSize?: number } = {},
): Promise<JobWithRelations[]> {
  const { page = 1, pageSize = 10 } = params;

  return prisma.job.findMany({
    where: { status: "PUBLISHED", ...ACTIVE_JOB_WHERE, ...notExpiredWhere() },
    include: jobWithRelations,
    orderBy: { publishedAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
}

/**
 * Fetch published jobs by id, preserving no particular order (caller
 * re-sorts if needed) — backs the client-side "Saved Jobs" page, whose
 * ids come from localStorage rather than a database relation. Jobs
 * that were unpublished/deleted/expired since being saved are simply
 * omitted rather than erroring, so a stale saved id never breaks the
 * page.
 */
export async function getJobsByIds(ids: string[]): Promise<JobWithRelations[]> {
  if (ids.length === 0) return [];
  return prisma.job.findMany({
    where: { id: { in: ids }, status: "PUBLISHED", ...ACTIVE_JOB_WHERE, ...notExpiredWhere() },
    include: jobWithRelations,
  });
}

export async function getFeaturedJobs(take = 6): Promise<JobWithRelations[]> {
  return prisma.job.findMany({
    where: { status: "PUBLISHED", featured: true, ...ACTIVE_JOB_WHERE, ...notExpiredWhere() },
    include: jobWithRelations,
    orderBy: { publishedAt: "desc" },
    take,
  });
}

/**
 * Jobs sharing this job's category or location — a simple, index-backed
 * relatedness signal (no need for anything heavier at this scale).
 * Ranks same-category-and-location matches first, then same-category,
 * then same-location.
 */
export async function getRelatedJobs(jobId: string, take = 6): Promise<JobWithRelations[]> {
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });

  const candidates = await prisma.job.findMany({
    where: {
      id: { not: jobId },
      status: "PUBLISHED",
      ...ACTIVE_JOB_WHERE,
      OR: [
        { categoryId: job.categoryId },
        { locationId: job.locationId },
        { companyId: job.companyId },
      ],
      AND: [notExpiredWhere()],
    },
    include: jobWithRelations,
    orderBy: { publishedAt: "desc" },
    take: take * 3, // over-fetch, then rank below
  });

  // Priority order per spec: same category first, then same location,
  // then same company — weighted so a category match always outranks a
  // location-only match, which in turn outranks a company-only match.
  return candidates
    .map((candidate) => ({
      candidate,
      score:
        (candidate.categoryId === job.categoryId ? 4 : 0) +
        (candidate.locationId === job.locationId ? 2 : 0) +
        (candidate.companyId === job.companyId ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, take)
    .map(({ candidate }) => candidate);
}

// ─────────────────────────────────────────────────────────────
// Search / filter
// ─────────────────────────────────────────────────────────────

/**
 * Builds the shared `where` clause for both `searchJobs()` and
 * `filterJobs()`, covering every facet in the spec: title, company,
 * free-text keyword, location, category, employment type, experience,
 * salary range, and status.
 */
function andWith(where: Prisma.JobWhereInput, clause: Prisma.JobWhereInput) {
  where.AND = [...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []), clause];
}

/** Start-of-range date for the "Posted Within" filter. */
function postedWithinDate(value: NonNullable<JobSearchInput["postedWithin"]>): Date {
  const now = new Date();
  switch (value) {
    case "today": {
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      return startOfToday;
    }
    case "3days":
      return new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    case "week":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "month":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

function buildJobWhere(input: JobSearchInput): Prisma.JobWhereInput {
  const where: Prisma.JobWhereInput = {
    ...ACTIVE_JOB_WHERE,
    status: input.status ?? "PUBLISHED",
  };

  // `andWith` (not a plain spread) since `input.query` below sets its
  // own top-level `where.OR` for the keyword search — spreading
  // `notExpiredWhere()`'s `OR` key directly onto `where` would get
  // silently clobbered by that later assignment. Combining via a
  // separate `AND` entry keeps both conditions in force regardless of
  // which one runs first.
  andWith(where, notExpiredWhere());

  if (input.query) {
    where.OR = [
      { title: { contains: input.query, mode: "insensitive" } },
      { description: { contains: input.query, mode: "insensitive" } },
      { company: { name: { contains: input.query, mode: "insensitive" } } },
    ];
  }

  if (input.companySlugs.length > 0) {
    where.company = { slug: { in: input.companySlugs } };
  }

  if (input.locationSlugs.length > 0) {
    where.location = { slug: { in: input.locationSlugs } };
  }

  if (input.categorySlugs.length > 0) {
    where.category = { slug: { in: input.categorySlugs } };
  }

  if (input.employmentTypes.length > 0) {
    where.employmentType = { in: input.employmentTypes };
  }

  if (input.experience) {
    where.experience = { contains: input.experience, mode: "insensitive" };
  }

  if (input.education.length > 0) {
    where.education = { in: input.education };
  }

  if (input.visaStatus.length > 0) {
    where.visaStatus = { in: input.visaStatus };
  }

  if (input.featured) {
    where.featured = true;
  }

  if (input.verified) {
    where.verified = true;
  }

  if (input.postedWithin) {
    where.publishedAt = { gte: postedWithinDate(input.postedWithin) };
  }

  // Salary range overlap: a job matches if its own range overlaps the
  // requested [salaryMin, salaryMax] window (treats a null bound on
  // either side as "no limit" on that side).
  if (input.salaryMin !== undefined) {
    andWith(where, { OR: [{ salaryMax: { gte: input.salaryMin } }, { salaryMax: null }] });
  }

  if (input.salaryMax !== undefined) {
    andWith(where, { OR: [{ salaryMin: { lte: input.salaryMax } }, { salaryMin: null }] });
  }

  return where;
}

/** Maps a `JobSort` value to a Prisma `orderBy`. "Featured First" then falls back to newest. */
/**
 * Every branch ends with `{ id: "asc" }` as a final, unique tiebreaker —
 * without one, rows tied on the leading sort column(s) (a very real
 * case: `bulkPublishJobs()` can give several jobs the same `publishedAt`
 * second, and two jobs sharing an identical `title` for the "A–Z" sort
 * is common, not an edge case) have no guaranteed stable order between
 * two separate paginated queries. Postgres is free to order ties
 * differently on each call, which — across a `skip`/`take` page 1 and
 * page 2 — can surface the same job on both pages, or skip one
 * entirely. `id` is unique and immutable, so appending it fixes the
 * order completely regardless of what the leading columns do.
 */
function buildJobOrderBy(sort: JobSearchInput["sort"]): Prisma.JobOrderByWithRelationInput[] {
  switch (sort) {
    case "oldest":
      return [{ publishedAt: "asc" }, { id: "asc" }];
    case "salary_desc":
      return [{ salaryMax: "desc" }, { publishedAt: "desc" }, { id: "asc" }];
    case "salary_asc":
      return [{ salaryMin: "asc" }, { publishedAt: "desc" }, { id: "asc" }];
    case "az":
      return [{ title: "asc" }, { id: "asc" }];
    case "featured_first":
      return [{ featured: "desc" }, { publishedAt: "desc" }, { id: "asc" }];
    case "newest":
    default:
      return [{ publishedAt: "desc" }, { id: "asc" }];
  }
}

async function paginateJobs(
  where: Prisma.JobWhereInput,
  orderBy: Prisma.JobOrderByWithRelationInput[],
  page: number,
  pageSize: number,
): Promise<PaginatedResult<JobWithRelations>> {
  const [items, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: jobWithRelations,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.job.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Keyword-first search — powers the homepage/header search bar. */
export async function searchJobs(
  input: JobSearchInput,
): Promise<PaginatedResult<JobWithRelations>> {
  return paginateJobs(
    buildJobWhere(input),
    buildJobOrderBy(input.sort),
    input.page,
    input.pageSize,
  );
}

/**
 * Facet-first filtering — powers the `/jobs` browse + filter sidebar.
 * This is the primary query behind the All Jobs page: every facet in the
 * spec (title, company, keyword, location, category, employment type,
 * experience, salary, education, visa status, featured/verified, posted
 * window, status) is covered by `buildJobWhere`, and sort order by
 * `buildJobOrderBy`.
 */
export async function filterJobs(
  input: JobSearchInput,
): Promise<PaginatedResult<JobWithRelations>> {
  return paginateJobs(
    buildJobWhere(input),
    buildJobOrderBy(input.sort),
    input.page,
    input.pageSize,
  );
}

/** Total published, non-deleted job count — the /jobs page header's live counter. */
export async function getPublishedJobsCount(): Promise<number> {
  return prisma.job.count({
    where: { status: "PUBLISHED", ...ACTIVE_JOB_WHERE, ...notExpiredWhere() },
  });
}

/**
 * Distinct, non-empty `education` values among published jobs — powers
 * the Education filter with real options instead of a hardcoded list
 * (education is free text on Job, not a reference table like Category).
 *
 * Uses Prisma's `distinct` so Postgres itself returns only the unique
 * values (a `SELECT DISTINCT`) — previously this fetched every
 * published job's `education` row and deduplicated in JavaScript,
 * transferring one row per job just to end up with a handful of unique
 * strings. At this project's scale the difference is small today, but
 * the query stays flat (bounded by the number of distinct values, not
 * the number of jobs) as the jobs table grows instead of scaling
 * linearly with it.
 */
export async function getDistinctEducationValues(): Promise<string[]> {
  const rows = await prisma.job.findMany({
    where: {
      status: "PUBLISHED",
      education: { not: null },
      ...ACTIVE_JOB_WHERE,
      ...notExpiredWhere(),
    },
    select: { education: true },
    distinct: ["education"],
  });
  return rows
    .map((r) => r.education)
    .filter((v): v is string => Boolean(v))
    .sort();
}

/** Distinct, non-empty `visaStatus` values among published jobs — powers the Visa Status filter. Same `distinct`-pushed-to-the-database approach as `getDistinctEducationValues()` above. */
export async function getDistinctVisaStatusValues(): Promise<string[]> {
  const rows = await prisma.job.findMany({
    where: {
      status: "PUBLISHED",
      visaStatus: { not: null },
      ...ACTIVE_JOB_WHERE,
      ...notExpiredWhere(),
    },
    select: { visaStatus: true },
    distinct: ["visaStatus"],
  });
  return rows
    .map((r) => r.visaStatus)
    .filter((v): v is string => Boolean(v))
    .sort();
}

/**
 * Slim `{ slug, updatedAt }` rows for every *actually visible*
 * published job — powers the Phase 14 sitemap (`app/sitemap-jobs.xml`).
 * Deliberately avoids `include`-ing relations or selecting the full
 * row, since a sitemap only needs the URL and a last-modified date, and
 * this can run over every published job at once.
 *
 * Excludes jobs whose `applicationDeadline` has passed, matching
 * `/jobs/[slug]`'s own `isExpired()` visibility check exactly — a job
 * past its deadline still has `status: "PUBLISHED"` in the database
 * (nothing auto-archives it), but the page itself already 404s for it.
 * Listing it in the sitemap would hand Google a URL that returns 404
 * when crawled, which is exactly the kind of "submitted URL not found"
 * Search Console error a sitemap should never cause.
 */
export async function getAllPublishedJobSlugsForSitemap(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  return prisma.job.findMany({
    where: { status: "PUBLISHED", ...ACTIVE_JOB_WHERE, ...notExpiredWhere() },
    select: { slug: true, updatedAt: true },
  });
}

// ─────────────────────────────────────────────────────────────
// Analytics increments
// ─────────────────────────────────────────────────────────────

/**
 * Every increment* helper upserts the job's Analytics row (one row per
 * job, created lazily on first event) and atomically increments the
 * relevant counter via Prisma's `{ increment }` to avoid lost updates
 * under concurrent requests. Since Phase 12, each also dual-writes a
 * row to `AnalyticsEvent` (`recordAnalyticsEvent`) — the lifetime
 * counter here stays the fast O(1) total the public job page and
 * admin dashboard already relied on; the event-log row is what lets
 * the Phase 12 Analytics Dashboard slice the same activity by date,
 * device, and referrer.
 */
async function incrementAnalyticsField(
  jobId: string,
  field: "views" | "websiteClicks" | "emailClicks" | "shareClicks",
  eventType: AnalyticsEventType,
) {
  const [result] = await Promise.all([
    prisma.analytics.upsert({
      where: { jobId },
      create: { jobId, [field]: 1 },
      update: { [field]: { increment: 1 } },
    }),
    recordAnalyticsEvent({ type: eventType, jobId }),
  ]);
  return result;
}

export async function incrementViewCount(jobId: string) {
  return incrementAnalyticsField(jobId, "views", "JOB_VIEW");
}

export async function incrementWebsiteClicks(jobId: string) {
  return incrementAnalyticsField(jobId, "websiteClicks", "WEBSITE_CLICK");
}

export async function incrementEmailClicks(jobId: string) {
  return incrementAnalyticsField(jobId, "emailClicks", "EMAIL_CLICK");
}

export async function incrementShareClicks(jobId: string) {
  return incrementAnalyticsField(jobId, "shareClicks", "SHARE_CLICK");
}

// ─────────────────────────────────────────────────────────────
// Admin dashboard reads
// ─────────────────────────────────────────────────────────────

/** Single job lookup by id, with relations — used by the admin dashboard's most-viewed/most-clicked cards. */
export async function getJobByIdWithRelations(id: string): Promise<JobWithRelations | null> {
  return prisma.job.findUnique({ where: { id }, include: jobWithRelations });
}

export interface JobStatusCounts {
  total: number;
  published: number;
  draft: number;
  scheduled: number;
  archived: number;
  featured: number;
}

/**
 * One-shot status breakdown for the admin dashboard's stat cards —
 * every count runs in parallel rather than four sequential round trips.
 * `total`/`featured` exclude soft-deleted rows like every other public
 * read; the per-status counts naturally do too since `status` alone
 * doesn't overlap with a deleted row still being queried elsewhere.
 */
export async function getJobStatusCounts(): Promise<JobStatusCounts> {
  const [total, published, draft, scheduled, archived, featured] = await Promise.all([
    prisma.job.count({ where: { ...ACTIVE_JOB_WHERE } }),
    prisma.job.count({ where: { status: "PUBLISHED", ...ACTIVE_JOB_WHERE } }),
    prisma.job.count({ where: { status: "DRAFT", ...ACTIVE_JOB_WHERE } }),
    prisma.job.count({ where: { status: "SCHEDULED", ...ACTIVE_JOB_WHERE } }),
    prisma.job.count({ where: { status: "ARCHIVED", ...ACTIVE_JOB_WHERE } }),
    prisma.job.count({ where: { featured: true, ...ACTIVE_JOB_WHERE } }),
  ]);

  return { total, published, draft, scheduled, archived, featured };
}

/**
 * Aggregate view/click stats across every job's `Analytics` row, computed
 * in a single fetch-and-reduce pass rather than one query per metric.
 * Analytics is a small, bounded table (one row per job), so fetching it
 * in full here is simpler and just as fast as a SQL `SUM`/`MAX` at this
 * project's scale — worth revisiting with a real aggregate query if the
 * job count ever grows into the hundreds of thousands.
 */
export async function getAnalyticsSummary(): Promise<{
  totalJobViews: number;
  mostViewed: { jobId: string; views: number } | null;
  mostClicked: { jobId: string; clicks: number } | null;
}> {
  const rows = await prisma.analytics.findMany();

  if (rows.length === 0) {
    return { totalJobViews: 0, mostViewed: null, mostClicked: null };
  }

  let totalJobViews = 0;
  let mostViewed = rows[0]!;
  let mostClicked = rows[0]!;

  for (const row of rows) {
    totalJobViews += row.views;
    if (row.views > mostViewed.views) mostViewed = row;
    if (row.websiteClicks + row.emailClicks > mostClicked.websiteClicks + mostClicked.emailClicks) {
      mostClicked = row;
    }
  }

  return {
    totalJobViews,
    mostViewed: mostViewed.views > 0 ? { jobId: mostViewed.jobId, views: mostViewed.views } : null,
    mostClicked:
      mostClicked.websiteClicks + mostClicked.emailClicks > 0
        ? { jobId: mostClicked.jobId, clicks: mostClicked.websiteClicks + mostClicked.emailClicks }
        : null,
  };
}

/** Newest jobs of *any* status (draft/scheduled/published/archived) — the admin dashboard's "Recent Jobs" table, unlike the public site's `getLatestJobs()` which only ever shows published ones. */
export async function getRecentJobsForAdmin(take = 10): Promise<JobWithRelations[]> {
  return prisma.job.findMany({
    where: { ...ACTIVE_JOB_WHERE },
    include: jobWithRelations,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getDraftJobsForAdmin(take = 5): Promise<JobWithRelations[]> {
  return prisma.job.findMany({
    where: { status: "DRAFT", ...ACTIVE_JOB_WHERE },
    include: jobWithRelations,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getScheduledJobsForAdmin(take = 5): Promise<JobWithRelations[]> {
  return prisma.job.findMany({
    where: { status: "SCHEDULED", ...ACTIVE_JOB_WHERE },
    include: jobWithRelations,
    orderBy: { publishedAt: "asc" },
    take,
  });
}

/** Published jobs whose `applicationDeadline` falls within the next `withinDays` — the dashboard's "Jobs Near Deadline" alert. */
export async function getJobsNearDeadlineForAdmin(
  withinDays = 3,
  take = 5,
): Promise<JobWithRelations[]> {
  const now = new Date();
  const cutoff = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);

  return prisma.job.findMany({
    where: {
      status: "PUBLISHED",
      ...ACTIVE_JOB_WHERE,
      applicationDeadline: { gte: now, lte: cutoff },
    },
    include: jobWithRelations,
    orderBy: { applicationDeadline: "asc" },
    take,
  });
}

/** Admin-only lifecycle transition: `unpublishJob` — sends a live job back to Draft without touching its `publishedAt` history (so republishing later shows "originally posted" correctly rather than resetting it). */
export async function unpublishJob(id: string): Promise<Job> {
  return prisma.job.update({ where: { id }, data: { status: "DRAFT" } });
}

// ─────────────────────────────────────────────────────────────
// Admin jobs table: search / filter / sort / pagination
// ─────────────────────────────────────────────────────────────

/**
 * Builds the `where` clause for the admin Jobs table. Unlike the public
 * `buildJobWhere()`, this one never forces `status: "PUBLISHED"` by
 * default — the admin needs to see every status — and searches by
 * Company/Category/Location *name* as well as job title, per the spec's
 * "Instant search by: Job Title, Company, Category, Location."
 */
function buildAdminJobWhere(input: AdminJobSearchInput): Prisma.JobWhereInput {
  const where: Prisma.JobWhereInput = { ...ACTIVE_JOB_WHERE };

  if (input.query) {
    where.OR = [
      { title: { contains: input.query, mode: "insensitive" } },
      { company: { name: { contains: input.query, mode: "insensitive" } } },
      { category: { name: { contains: input.query, mode: "insensitive" } } },
      { location: { name: { contains: input.query, mode: "insensitive" } } },
    ];
  }

  if (input.status) where.status = input.status;
  if (input.companyId) where.companyId = input.companyId;
  if (input.categoryId) where.categoryId = input.categoryId;
  if (input.locationId) where.locationId = input.locationId;
  if (input.employmentType) where.employmentType = input.employmentType;
  if (input.featured) where.featured = true;
  if (input.verified) where.verified = true;

  if (input.publishedFrom || input.publishedTo) {
    where.publishedAt = {
      ...(input.publishedFrom ? { gte: input.publishedFrom } : {}),
      ...(input.publishedTo ? { lte: input.publishedTo } : {}),
    };
  }

  if (input.deadlineFrom || input.deadlineTo) {
    where.applicationDeadline = {
      ...(input.deadlineFrom ? { gte: input.deadlineFrom } : {}),
      ...(input.deadlineTo ? { lte: input.deadlineTo } : {}),
    };
  }

  return where;
}

/** Same stable-tiebreaker fix as `buildJobOrderBy()` above — every branch ends with `{ id: "asc" }`. */
function buildAdminJobOrderBy(sort: AdminJobSort): Prisma.JobOrderByWithRelationInput[] {
  switch (sort) {
    case "oldest":
      return [{ createdAt: "asc" }, { id: "asc" }];
    case "title_az":
      return [{ title: "asc" }, { id: "asc" }];
    case "company_az":
      return [{ company: { name: "asc" } }, { id: "asc" }];
    case "published_date":
      return [{ publishedAt: "desc" }, { id: "asc" }];
    case "deadline":
      return [{ applicationDeadline: "asc" }, { id: "asc" }];
    case "featured_first":
      return [{ featured: "desc" }, { createdAt: "desc" }, { id: "asc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }, { id: "asc" }];
  }
}

/** The admin Jobs table's one and only query — every status, searchable, filterable, sortable, paginated. */
export async function getAdminJobsList(
  input: AdminJobSearchInput,
): Promise<PaginatedResult<JobWithRelations>> {
  const where = buildAdminJobWhere(input);
  const orderBy = buildAdminJobOrderBy(input.sort);

  const [items, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: jobWithRelations,
      orderBy,
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    prisma.job.count({ where }),
  ]);

  return {
    items,
    total,
    page: input.page,
    pageSize: input.pageSize,
    totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
  };
}

// ─────────────────────────────────────────────────────────────
// Admin bulk actions
// ─────────────────────────────────────────────────────────────

/**
 * Bulk publish preserves each job's own existing `publishedAt` (same
 * rule as the single-job `publishJob()`) rather than blanket-overwriting
 * every selected row's publish date to "now" — so re-publishing a batch
 * that includes an already-published job doesn't reset its history.
 * That per-row conditional can't be expressed in a single `updateMany`,
 * so this fetches the selected jobs once, then updates each in
 * parallel.
 */
export async function bulkPublishJobs(ids: string[]): Promise<number> {
  const jobs = await prisma.job.findMany({ where: { id: { in: ids }, ...ACTIVE_JOB_WHERE } });

  await Promise.all(
    jobs.map((job) =>
      prisma.job.update({
        where: { id: job.id },
        data: { status: "PUBLISHED", publishedAt: job.publishedAt ?? new Date() },
      }),
    ),
  );

  return jobs.length;
}

export async function bulkUnpublishJobs(ids: string[]): Promise<number> {
  const result = await prisma.job.updateMany({
    where: { id: { in: ids }, ...ACTIVE_JOB_WHERE },
    data: { status: "DRAFT" },
  });
  return result.count;
}

export async function bulkArchiveJobs(ids: string[]): Promise<number> {
  const result = await prisma.job.updateMany({
    where: { id: { in: ids }, ...ACTIVE_JOB_WHERE },
    data: { status: "ARCHIVED" },
  });
  return result.count;
}

/** Bulk soft delete — same `deletedAt` rule as the single-job `deleteJob()`, never a hard delete. */
export async function bulkSoftDeleteJobs(ids: string[]): Promise<number> {
  const result = await prisma.job.updateMany({
    where: { id: { in: ids }, ...ACTIVE_JOB_WHERE },
    data: { deletedAt: new Date() },
  });
  return result.count;
}
