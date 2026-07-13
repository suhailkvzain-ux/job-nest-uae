import type { Category, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { ensureUniqueSlug } from "@/lib/slug";
import type { MasterDataSearchInput } from "@/lib/validations/admin-master-data";
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

/** `/admin/categories` list query — search by name, sort, paginate. See `getAdminCompaniesList()` for the in-application sort/paginate rationale. */
export async function getAdminCategoriesList(
  input: MasterDataSearchInput,
): Promise<PaginatedResult<CategoryWithJobCount>> {
  const where: Prisma.CategoryWhereInput = input.query
    ? { name: { contains: input.query, mode: "insensitive" } }
    : {};

  const categories = await prisma.category.findMany({ where, orderBy: { name: "asc" } });

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
    case "name_za":
      withCounts = withCounts.slice().reverse();
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
    case "name_az":
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
