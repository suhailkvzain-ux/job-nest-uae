import type { Company, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { ensureUniqueSlug } from "@/lib/slug";
import type { MasterDataSearchInput } from "@/lib/validations/admin-master-data";
import { resolveCompanySlug, type CreateCompanyInput, type UpdateCompanyInput } from "@/lib/validations/company";
import { ACTIVE_JOB_WHERE } from "@/services/jobs.service";
import type { PaginatedResult } from "@/types";

/**
 * Company reference-data service. Companies are managed by the single
 * Admin (no company-facing accounts) and are hard-deleted — there's no
 * soft-delete requirement for reference data, unlike Job.
 */

export async function createCompany(input: CreateCompanyInput) {
  const slug = await ensureUniqueSlug(resolveCompanySlug(input), (candidate) =>
    prisma.company.findUnique({ where: { slug: candidate } }).then(Boolean),
  );

  return prisma.company.create({
    data: { ...input, slug },
  });
}

export async function updateCompany(id: string, input: UpdateCompanyInput) {
  return prisma.company.update({ where: { id }, data: input });
}

export async function deleteCompany(id: string) {
  return prisma.company.delete({ where: { id } });
}

export async function getCompanyBySlug(slug: string) {
  return prisma.company.findUnique({ where: { slug } });
}

export async function getAllCompanies(args?: { orderBy?: Prisma.CompanyOrderByWithRelationInput }) {
  return prisma.company.findMany({
    orderBy: args?.orderBy ?? { name: "asc" },
  });
}

export interface CompanyWithJobCount extends Company {
  jobCount: number;
}

/**
 * Companies that currently have at least one published job — powers the
 * homepage "Popular Companies" section. Companies with zero live jobs
 * (e.g. an employer whose only listing expired) are intentionally
 * excluded, unlike categories/locations which show every reference row.
 */
export async function getCompaniesWithJobCounts(take = 8): Promise<CompanyWithJobCount[]> {
  const counts = await prisma.job.groupBy({
    by: ["companyId"],
    where: { status: "PUBLISHED", ...ACTIVE_JOB_WHERE },
    _count: true,
  });

  if (counts.length === 0) return [];

  const countByCompany = new Map(counts.map((c) => [c.companyId, c._count]));
  const companies = await prisma.company.findMany({
    where: { id: { in: counts.map((c) => c.companyId) } },
  });

  return companies
    .map((company) => ({ ...company, jobCount: countByCompany.get(company.id) ?? 0 }))
    .sort((a, b) => b.jobCount - a.jobCount)
    .slice(0, take);
}

/**
 * Every company currently hiring (jobCount > 0), sorted alphabetically —
 * powers the `/companies` directory page. Unlike `getCompaniesWithJobCounts`
 * above (capped and ranked by popularity, for the homepage), this
 * returns the full list in name order per the spec's "Sort A–Z".
 */
export async function getAllCompaniesWithJobCounts(): Promise<CompanyWithJobCount[]> {
  const counts = await prisma.job.groupBy({
    by: ["companyId"],
    where: { status: "PUBLISHED", ...ACTIVE_JOB_WHERE },
    _count: true,
  });

  if (counts.length === 0) return [];

  const countByCompany = new Map(counts.map((c) => [c.companyId, c._count]));
  const companies = await prisma.company.findMany({
    where: { id: { in: counts.map((c) => c.companyId) } },
    orderBy: { name: "asc" },
  });

  return companies.map((company) => ({ ...company, jobCount: countByCompany.get(company.id) ?? 0 }));
}

/**
 * Stable, filter-independent published-job count for one company — the
 * `/companies/[slug]` header badge.
 */
export async function getCompanyJobCount(companyId: string): Promise<number> {
  return prisma.job.count({ where: { companyId, status: "PUBLISHED", ...ACTIVE_JOB_WHERE } });
}

/**
 * Other companies currently hiring, ranked by job count, excluding the
 * current one — powers the "Related Companies" rail on the company
 * detail page.
 */
export async function getRelatedCompanies(excludeCompanyId: string, take = 6): Promise<CompanyWithJobCount[]> {
  const all = await getAllCompaniesWithJobCounts();
  return all
    .filter((company) => company.id !== excludeCompanyId)
    .sort((a, b) => b.jobCount - a.jobCount)
    .slice(0, take);
}


// ─────────────────────────────────────────────────────────────
// Admin Master Data Management (`/admin/companies`)
// ─────────────────────────────────────────────────────────────

/**
 * Every non-deleted job attached to a company, regardless of status —
 * deliberately broader than `getCompanyJobCount()` above (which is
 * published-only, for the public site's header badge). This is what the
 * admin list's "Number of Jobs" column shows, and what the delete guard
 * below checks, since a company with only draft/archived jobs still has
 * jobs "connected" in the sense the spec means.
 */
export async function getCompanyTotalJobCount(companyId: string): Promise<number> {
  return prisma.job.count({ where: { companyId, ...ACTIVE_JOB_WHERE } });
}

/**
 * `/admin/companies` list query — search by name, sort, paginate.
 * Reference-data tables like this stay small (tens, not millions, of
 * rows), so rather than fight Prisma's relation-count `orderBy`
 * limitations (it can't filter the counted relation by `deletedAt`),
 * this fetches every matching row unpaginated, computes each company's
 * job count via one `groupBy` (avoiding an N+1), sorts in application
 * code, then slices the page — the same trade-off already made by
 * `getRelatedCompanies()` above.
 */
export async function getAdminCompaniesList(input: MasterDataSearchInput): Promise<PaginatedResult<CompanyWithJobCount>> {
  const where: Prisma.CompanyWhereInput = input.query
    ? { name: { contains: input.query, mode: "insensitive" } }
    : {};

  const companies = await prisma.company.findMany({ where, orderBy: { name: "asc" } });

  const counts =
    companies.length > 0
      ? await prisma.job.groupBy({
          by: ["companyId"],
          where: { companyId: { in: companies.map((c) => c.id) }, ...ACTIVE_JOB_WHERE },
          _count: true,
        })
      : [];
  const countByCompany = new Map(counts.map((c) => [c.companyId, c._count]));

  let withCounts: CompanyWithJobCount[] = companies.map((company) => ({
    ...company,
    jobCount: countByCompany.get(company.id) ?? 0,
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
      break; // already name-ascending from the query above
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
