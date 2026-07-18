import type { Category, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { ensureUniqueSlug } from "@/lib/slug";
import type { AdminCategorySearchInput } from "@/lib/validations/admin-category";
import {
  resolveCategorySlug,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/lib/validations/category";
import { ACTIVE_JOB_WHERE } from "@/services/jobs.service";
import type { PaginatedResult } from "@/types";

export async function createCategory(input: CreateCategoryInput) {
  const slug = await ensureUniqueSlug(resolveCategorySlug(input), (candidate) =>
    prisma.category.findUnique({ where: { slug: candidate } }).then(Boolean),
  );

  return prisma.category.create({ data: { ...input, slug } });
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  return prisma.category.update({ where: { id }, data: input });
}

/** Deletes a category, first purging any soft-deleted job rows still pointing at it — see `deleteCompany()` in `companies.service.ts` for the rationale. */
export async function deleteCategory(id: string) {
  const [, category] = await prisma.$transaction([
    prisma.job.deleteMany({ where: { categoryId: id, deletedAt: { not: null } } }),
    prisma.category.delete({ where: { id } }),
  ]);
  return category;
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

/** Admin edit-form lookup by id (as opposed to `getCategoryBySlug`, used by the public site). */
export async function getCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export interface CategorySalaryRange {
  id: string;
  name: string;
  slug: string;
  jobCount: number;
  avgMin: number | null;
  avgMax: number | null;
}

/**
 * Real average salary range per category, computed from currently
 * published, non-expired job listings — backs the public Salary
 * Guide page. Categories with zero live listings (nothing to
 * average) are simply excluded rather than shown with a fabricated
 * "AED 0" range.
 */
export async function getSalaryRangesByCategory(): Promise<CategorySalaryRange[]> {
  const [categories, aggregates] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.job.groupBy({
      by: ["categoryId"],
      where: { status: "PUBLISHED", ...ACTIVE_JOB_WHERE, salaryMin: { not: null } },
      _avg: { salaryMin: true, salaryMax: true },
      _count: true,
    }),
  ]);

  const byCategory = new Map(aggregates.map((a) => [a.categoryId, a]));

  return categories
    .map((category) => {
      const agg = byCategory.get(category.id);
      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        jobCount: agg?._count ?? 0,
        avgMin: agg?._avg.salaryMin ?? null,
        avgMax: agg?._avg.salaryMax ?? null,
      };
    })
    .filter((c) => c.avgMin !== null)
    .sort((a, b) => b.jobCount - a.jobCount);
}

export async function getAllCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export interface CategoryWithJobCount extends Category {
  jobCount: number;
}

/**
 * Every category with its live published-job count — powers the
 * homepage "Browse by Category" grid. Uses a `groupBy` rather than a
 * per-category `count()` call (avoids an N+1 query for N categories).
 */
export async function getCategoriesWithJobCounts(take?: number): Promise<CategoryWithJobCount[]> {
  const [categories, counts] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.job.groupBy({
      by: ["categoryId"],
      where: { status: "PUBLISHED", ...ACTIVE_JOB_WHERE },
      _count: true,
    }),
  ]);

  const countByCategory = new Map(counts.map((c) => [c.categoryId, c._count]));

  const withCounts = categories.map((category) => ({
    ...category,
    jobCount: countByCategory.get(category.id) ?? 0,
  }));

  if (take === undefined) return withCounts;

  // Homepage callers pass `take` to cap an otherwise-unbounded grid
  // (every category, however many exist) down to a short highlight
  // row. Sort by job count first so the ones actually worth showing
  // in a capped list are the active categories, not just whichever
  // happen to sort first alphabetically.
  return [...withCounts].sort((a, b) => b.jobCount - a.jobCount).slice(0, take);
}

/**
 * Stable, filter-independent published-job count for one category — the
 * `/categories/[slug]` header badge. Deliberately separate from
 * `filterJobs()`'s `results.total`, which reflects whatever extra
 * facets (employment type, salary, ...) are currently applied.
 */
export async function getCategoryJobCount(categoryId: string): Promise<number> {
  return prisma.job.count({ where: { categoryId, status: "PUBLISHED", ...ACTIVE_JOB_WHERE } });
}

/**
 * Other categories with at least one live job, ranked by job count,
 * excluding the current one — powers the "Related Categories" rail on
 * the category detail page.
 */
export async function getRelatedCategories(
  excludeCategoryId: string,
  take = 6,
): Promise<CategoryWithJobCount[]> {
  const all = await getCategoriesWithJobCounts();
  return all
    .filter((category) => category.id !== excludeCategoryId && category.jobCount > 0)
    .sort((a, b) => b.jobCount - a.jobCount)
    .slice(0, take);
}

// ─────────────────────────────────────────────────────────────
// Admin Master Data Management (`/admin/categories`)
// ─────────────────────────────────────────────────────────────

/** Active (non-deleted) jobs referencing this category — gates delete-protection. Soft-deleted jobs are purged automatically by `deleteCategory()`, so they no longer need to block deletion. */
export async function getCategoryTotalJobCount(categoryId: string): Promise<number> {
  return prisma.job.count({ where: { categoryId, ...ACTIVE_JOB_WHERE } });
}

export interface AdminCategoryStats {
  total: number;
  active: number;
  hidden: number;
  totalJobs: number;
}

/** Powers the four stat cards atop `/admin/categories` — Total/Active/Hidden Categories, Total Jobs across all of them. */
export async function getAdminCategoryStats(): Promise<AdminCategoryStats> {
  const [total, active, totalJobs] = await Promise.all([
    prisma.category.count(),
    prisma.category.count({ where: { isActive: true } }),
    prisma.job.count({ where: ACTIVE_JOB_WHERE }),
  ]);
  return { total, active, hidden: total - active, totalJobs };
}

/**
 * Swaps `displayOrder` with the adjacent category in the given
 * direction — the spec's "Move Up / Move Down" card actions. Simpler
 * and more predictable than a full drag-and-drop reorder for a
 * single-step nudge, and it's the same UX the spec's card actions
 * describe.
 */
export async function moveCategoryOrder(id: string, direction: "up" | "down") {
  const categories = await prisma.category.findMany({ orderBy: { displayOrder: "asc" } });
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= categories.length) return;

  const current = categories[index];
  const swap = categories[swapIndex];

  await prisma.$transaction([
    prisma.category.update({ where: { id: current.id }, data: { displayOrder: swap.displayOrder } }),
    prisma.category.update({ where: { id: swap.id }, data: { displayOrder: current.displayOrder } }),
  ]);
}

/** Clones a category as a new Draft-equivalent (inactive) copy — "Copy of {Name}", per the spec's Duplicate action. Never copies job associations. */
export async function duplicateCategory(id: string) {
  const original = await prisma.category.findUniqueOrThrow({ where: { id } });
  const slug = await ensureUniqueSlug(`${original.slug}-copy`, (candidate) =>
    prisma.category.findUnique({ where: { slug: candidate } }).then(Boolean),
  );

  return prisma.category.create({
    data: {
      name: `Copy of ${original.name}`,
      slug,
      description: original.description,
      icon: original.icon,
      displayOrder: original.displayOrder,
      isActive: false,
      featured: false,
      popular: false,
      showOnHomepage: false,
      seoTitle: original.seoTitle,
      seoDescription: original.seoDescription,
      seoKeywords: original.seoKeywords,
    },
  });
}

/** `/admin/categories` list query — search, status/featured/popular filters, sort, paginate. */
export async function getAdminCategoriesList(
  input: AdminCategorySearchInput,
): Promise<PaginatedResult<CategoryWithJobCount>> {
  const where: Prisma.CategoryWhereInput = {};
  if (input.query) where.name = { contains: input.query, mode: "insensitive" };
  if (input.status) where.isActive = input.status === "active";
  if (input.featured) where.featured = true;
  if (input.popular) where.popular = true;

  const categories = await prisma.category.findMany({ where, orderBy: { displayOrder: "asc" } });

  const counts =
    categories.length > 0
      ? await prisma.job.groupBy({
          by: ["categoryId"],
          where: { categoryId: { in: categories.map((c) => c.id) }, ...ACTIVE_JOB_WHERE },
          _count: true,
        })
      : [];
  const countByCategory = new Map(counts.map((c) => [c.categoryId, c._count]));

  let withCounts: CategoryWithJobCount[] = categories.map((category) => ({
    ...category,
    jobCount: countByCategory.get(category.id) ?? 0,
  }));

  switch (input.sort) {
    case "name_az":
      withCounts = withCounts.slice().sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name_za":
      withCounts = withCounts.slice().sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "newest":
      withCounts = withCounts.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
    case "oldest":
      withCounts = withCounts.slice().sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      break;
    case "job_count":
      withCounts = withCounts.slice().sort((a, b) => b.jobCount - a.jobCount);
      break;
    case "display_order":
    default:
      break;
  }

  const total = withCounts.length;
  const start = (input.page - 1) * input.pageSize;
  const items = withCounts.slice(start, start + input.pageSize);

  return {
    items,
    total,
    page: input.page,
    pageSize: input.pageSize,
    totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
  };
}
