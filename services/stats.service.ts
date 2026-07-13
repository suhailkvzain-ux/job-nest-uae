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
  const [totalJobs, totalCompanies, totalCategories, totalLocations] = await Promise.all([
    prisma.job.count({ where: { status: "PUBLISHED", ...ACTIVE_JOB_WHERE } }),
    prisma.company.count(),
    prisma.category.count(),
    prisma.location.count(),
  ]);

  return { totalJobs, totalCompanies, totalCategories, totalLocations };
}
