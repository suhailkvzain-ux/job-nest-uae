import type { Location, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { ensureUniqueSlug } from "@/lib/slug";
import type { MasterDataSearchInput } from "@/lib/validations/admin-master-data";
import {
  resolveLocationSlug,
  type CreateLocationInput,
  type UpdateLocationInput,
} from "@/lib/validations/location";
import { ACTIVE_JOB_WHERE } from "@/services/jobs.service";
import type { PaginatedResult } from "@/types";

export async function createLocation(input: CreateLocationInput) {
  const slug = await ensureUniqueSlug(resolveLocationSlug(input), (candidate) =>
    prisma.location.findUnique({ where: { slug: candidate } }).then(Boolean),
  );

  return prisma.location.create({ data: { ...input, slug } });
}

export async function updateLocation(id: string, input: UpdateLocationInput) {
  return prisma.location.update({ where: { id }, data: input });
}

export async function deleteLocation(id: string) {
  return prisma.location.delete({ where: { id } });
}

export async function getLocationBySlug(slug: string) {
  return prisma.location.findUnique({ where: { slug } });
}

export async function getAllLocations() {
  return prisma.location.findMany({ orderBy: { name: "asc" } });
}

export interface LocationWithJobCount extends Location {
  jobCount: number;
}

/**
 * Every location (all 7 emirates + Al Ain) with its live published-job
 * count — powers the homepage "Browse by Location" grid.
 */
export async function getLocationsWithJobCounts(): Promise<LocationWithJobCount[]> {
  const [locations, counts] = await Promise.all([
    prisma.location.findMany({ orderBy: { name: "asc" } }),
    prisma.job.groupBy({
      by: ["locationId"],
      where: { status: "PUBLISHED", ...ACTIVE_JOB_WHERE },
      _count: true,
    }),
  ]);

  const countByLocation = new Map(counts.map((c) => [c.locationId, c._count]));

  return locations.map((location) => ({
    ...location,
    jobCount: countByLocation.get(location.id) ?? 0,
  }));
}

/**
 * Stable, filter-independent published-job count for one location — the
 * `/locations/[slug]` header badge (see `getCategoryJobCount` for why
 * this is kept separate from `filterJobs()`'s filtered total).
 */
export async function getLocationJobCount(locationId: string): Promise<number> {
  return prisma.job.count({ where: { locationId, status: "PUBLISHED", ...ACTIVE_JOB_WHERE } });
}

/**
 * Other locations with at least one live job, ranked by job count,
 * excluding the current one — powers the "Related Locations" rail on
 * the location detail page.
 */
export async function getRelatedLocations(excludeLocationId: string, take = 6): Promise<LocationWithJobCount[]> {
  const all = await getLocationsWithJobCounts();
  return all
    .filter((location) => location.id !== excludeLocationId && location.jobCount > 0)
    .sort((a, b) => b.jobCount - a.jobCount)
    .slice(0, take);
}


// ─────────────────────────────────────────────────────────────
// Admin Master Data Management (`/admin/locations`)
// ─────────────────────────────────────────────────────────────

/** Every non-deleted job in this location, regardless of status — see `getCompanyTotalJobCount()` for why this differs from the published-only `getLocationJobCount()` above. */
/** Every job row referencing this location, including soft-deleted ones — see `getCompanyTotalJobCount()` in `companies.service.ts` for why the delete-protection gate must count these rather than filtering by `ACTIVE_JOB_WHERE`. */
export async function getLocationTotalJobCount(locationId: string): Promise<number> {
  return prisma.job.count({ where: { locationId } });
}

/** `/admin/locations` list query — search by name, sort, paginate. See `getAdminCompaniesList()` for the in-application sort/paginate rationale. */
export async function getAdminLocationsList(input: MasterDataSearchInput): Promise<PaginatedResult<LocationWithJobCount>> {
  const where: Prisma.LocationWhereInput = input.query
    ? { name: { contains: input.query, mode: "insensitive" } }
    : {};

  const locations = await prisma.location.findMany({ where, orderBy: { name: "asc" } });

  const counts =
    locations.length > 0
      ? await prisma.job.groupBy({
          by: ["locationId"],
          where: { locationId: { in: locations.map((l) => l.id) }, ...ACTIVE_JOB_WHERE },
          _count: true,
        })
      : [];
  const countByLocation = new Map(counts.map((c) => [c.locationId, c._count]));

  let withCounts: LocationWithJobCount[] = locations.map((location) => ({
    ...location,
    jobCount: countByLocation.get(location.id) ?? 0,
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
