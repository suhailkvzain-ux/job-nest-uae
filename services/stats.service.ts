import { prisma } from "@/lib/prisma";
import { ACTIVE_JOB_WHERE } from "@/services/jobs.service";

export interface HomeStats {
  totalJobs: number;
  totalCompanies: number;
  totalCategories: number;
  totalLocations: number;
}

/**
 * Platform-breadth counters for the homepage hero's animated stats row.
 * `totalJobs` is live/published only; the other three are reference-data
 * totals (companies/categories/locations aren't soft-deletable).
 */
export async function getHomeStats(): Promise<HomeStats> {
  const [totalJobs, totalCompanies, totalCategories, distinctAreas, locationCount] = await Promise.all([
    prisma.job.count({ where: { status: "PUBLISHED", ...ACTIVE_JOB_WHERE } }),
    prisma.company.count(),
    prisma.category.count(),
    // Areas (e.g. "Al Quoz", "Khalifa City", "Muweilah") are free-text per
    // job, not tied to the 7-row `locations` table (which only holds the
    // emirates) — counting distinct areas gives a truer "how many places
    // in the UAE do we have jobs in" number than `Location.count()`,
    // which would always read exactly 7.
    prisma.job.findMany({
      where: { status: "PUBLISHED", ...ACTIVE_JOB_WHERE, area: { not: null } },
      select: { area: true },
      distinct: ["area"],
    }),
    prisma.location.count(),
  ]);

  const areaCount = distinctAreas.filter((j: { area: string | null }) => j.area && j.area.trim().length > 0).length;
  // Falls back to the emirate count on a fresh/empty database so the stat
  // never shows 0 before any job has an area filled in.
  const totalLocations = areaCount > 0 ? areaCount : locationCount;

  return { totalJobs, totalCompanies, totalCategories, totalLocations };
}
