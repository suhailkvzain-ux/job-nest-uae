import { prisma } from "@/lib/prisma";
import {
  getAnalyticsSummary,
  getDraftJobsForAdmin,
  getJobByIdWithRelations,
  getJobsNearDeadlineForAdmin,
  getJobStatusCounts,
  getScheduledJobsForAdmin,
  type JobStatusCounts,
  type JobWithRelations,
} from "@/services/jobs.service";

export interface DashboardStats {
  jobCounts: JobStatusCounts;
  companies: number;
  categories: number;
  locations: number;
  /**
   * Sum of every job's `Analytics.views` — the closest real number this
   * schema can produce to a site-wide "Total Visitors" figure. It is a
   * proxy (repeat visits and non-job pages aren't counted), not true
   * session/visitor tracking, which this project doesn't have a table
   * for yet. Labeled accordingly in the UI rather than passed off as a
   * real visitor count.
   */
  totalJobViews: number;
  mostViewedJob: { job: JobWithRelations; views: number } | null;
  mostClickedJob: { job: JobWithRelations; clicks: number } | null;
}

/**
 * Every number the admin dashboard's stat cards need, fetched in
 * parallel. `Today's Visitors` is deliberately absent from this shape —
 * see the README's Phase 8 section: the `Analytics` model only holds a
 * running total per job, with no per-day timestamped events, so a
 * "today" figure can't be derived honestly from the current schema.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [jobCounts, companies, categories, locations, analyticsSummary] = await Promise.all([
    getJobStatusCounts(),
    prisma.company.count(),
    prisma.category.count(),
    prisma.location.count(),
    getAnalyticsSummary(),
  ]);

  const [mostViewedJob, mostClickedJob] = await Promise.all([
    analyticsSummary.mostViewed ? getJobByIdWithRelations(analyticsSummary.mostViewed.jobId) : null,
    analyticsSummary.mostClicked ? getJobByIdWithRelations(analyticsSummary.mostClicked.jobId) : null,
  ]);

  return {
    jobCounts,
    companies,
    categories,
    locations,
    totalJobViews: analyticsSummary.totalJobViews,
    mostViewedJob:
      mostViewedJob && analyticsSummary.mostViewed
        ? { job: mostViewedJob, views: analyticsSummary.mostViewed.views }
        : null,
    mostClickedJob:
      mostClickedJob && analyticsSummary.mostClicked
        ? { job: mostClickedJob, clicks: analyticsSummary.mostClicked.clicks }
        : null,
  };
}

export interface AdminNotifications {
  scheduledJobs: JobWithRelations[];
  nearDeadlineJobs: JobWithRelations[];
  draftJobs: JobWithRelations[];
}

/** Dashboard alert panel data — scheduled jobs, jobs nearing their application deadline, and open drafts, fetched in parallel. */
export async function getAdminNotifications(): Promise<AdminNotifications> {
  const [scheduledJobs, nearDeadlineJobs, draftJobs] = await Promise.all([
    getScheduledJobsForAdmin(5),
    getJobsNearDeadlineForAdmin(3, 5),
    getDraftJobsForAdmin(5),
  ]);

  return { scheduledJobs, nearDeadlineJobs, draftJobs };
}
