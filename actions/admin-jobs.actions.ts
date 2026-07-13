"use server";

import { revalidatePath } from "next/cache";

import { assertAdminAndRateLimit, flattenZodErrors } from "@/lib/admin-action-helpers";
import { createJobSchema, updateJobSchema, type CreateJobInput, type UpdateJobInput } from "@/lib/validations/job";
import {
  archiveJob,
  bulkArchiveJobs,
  bulkPublishJobs,
  bulkSoftDeleteJobs,
  bulkUnpublishJobs,
  createJob,
  deleteJob,
  duplicateJob,
  publishJob,
  scheduleJob,
  unpublishJob,
  updateJob,
} from "@/services/jobs.service";

/**
 * Every admin Job mutation lives here — Server Actions called directly
 * as plain async functions from Client Components (the job form's RHF
 * `onSubmit`, the table's row-action dropdown, the bulk-action toolbar),
 * not wired through `<form action>`/`useActionState`. That's a
 * deliberate choice: this form's data (arrays, rich-text HTML, dates,
 * nested SEO fields) doesn't serialize cleanly through `FormData`, and
 * React Hook Form already validates and shapes it into a plain object
 * before this file ever sees it — calling the action with that object
 * directly avoids re-deriving it from `FormData` for no benefit. Next.js
 * Server Actions support both calling conventions equally; the login
 * flow (`actions/auth.actions.ts`) uses the `<form action>` style
 * because that form is simple enough that the native-POST fallback (no
 * JS) is worth keeping.
 */

export interface JobActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  jobId?: string;
  slug?: string;
}

/** Revalidates every public page a job mutation could affect — the homepage (latest/featured sections) and the job's own listing/detail pages. ISR would eventually catch up on its own (60s), but an admin action should be reflected immediately. */
function revalidatePublicJobPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/jobs");
  if (slug) revalidatePath(`/jobs/${slug}`);
}

export async function createJobAction(input: CreateJobInput): Promise<JobActionResult> {
  try {
    await assertAdminAndRateLimit("create-job");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const parsed = createJobSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please fix the errors below.", fieldErrors: flattenZodErrors(parsed.error) };
  }

  try {
    const job = await createJob(parsed.data);
    revalidatePath("/admin/jobs");
    revalidatePublicJobPaths(job.slug);
    return { success: true, jobId: job.id, slug: job.slug };
  } catch {
    return { success: false, error: "Could not create the job. Please try again." };
  }
}

export async function updateJobAction(id: string, input: UpdateJobInput): Promise<JobActionResult> {
  try {
    await assertAdminAndRateLimit("update-job");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const parsed = updateJobSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please fix the errors below.", fieldErrors: flattenZodErrors(parsed.error) };
  }

  try {
    const job = await updateJob(id, parsed.data);
    revalidatePath("/admin/jobs");
    revalidatePath(`/admin/jobs/${id}/edit`);
    revalidatePath(`/admin/jobs/${id}/preview`);
    revalidatePublicJobPaths(job.slug);
    return { success: true, jobId: job.id, slug: job.slug };
  } catch {
    return { success: false, error: "Could not update the job. Please try again." };
  }
}

export async function deleteJobAction(id: string): Promise<JobActionResult> {
  try {
    await assertAdminAndRateLimit("delete-job");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  try {
    const job = await deleteJob(id);
    revalidatePath("/admin/jobs");
    revalidatePublicJobPaths(job.slug);
    return { success: true, jobId: job.id };
  } catch {
    return { success: false, error: "Could not delete the job. Please try again." };
  }
}

export async function duplicateJobAction(id: string): Promise<JobActionResult> {
  try {
    await assertAdminAndRateLimit("duplicate-job");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  try {
    const job = await duplicateJob(id);
    revalidatePath("/admin/jobs");
    return { success: true, jobId: job.id, slug: job.slug };
  } catch {
    return { success: false, error: "Could not duplicate the job. Please try again." };
  }
}

export async function publishJobAction(id: string): Promise<JobActionResult> {
  try {
    await assertAdminAndRateLimit("publish-job");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  try {
    const job = await publishJob(id);
    revalidatePath("/admin/jobs");
    revalidatePublicJobPaths(job.slug);
    return { success: true, jobId: job.id, slug: job.slug };
  } catch {
    return { success: false, error: "Could not publish the job. Please try again." };
  }
}

export async function unpublishJobAction(id: string): Promise<JobActionResult> {
  try {
    await assertAdminAndRateLimit("unpublish-job");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  try {
    const job = await unpublishJob(id);
    revalidatePath("/admin/jobs");
    revalidatePublicJobPaths(job.slug);
    return { success: true, jobId: job.id, slug: job.slug };
  } catch {
    return { success: false, error: "Could not unpublish the job. Please try again." };
  }
}

export async function archiveJobAction(id: string): Promise<JobActionResult> {
  try {
    await assertAdminAndRateLimit("archive-job");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  try {
    const job = await archiveJob(id);
    revalidatePath("/admin/jobs");
    revalidatePublicJobPaths(job.slug);
    return { success: true, jobId: job.id, slug: job.slug };
  } catch {
    return { success: false, error: "Could not archive the job. Please try again." };
  }
}

export async function scheduleJobAction(id: string, publishAt: Date): Promise<JobActionResult> {
  try {
    await assertAdminAndRateLimit("schedule-job");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  try {
    const job = await scheduleJob(id, publishAt);
    revalidatePath("/admin/jobs");
    return { success: true, jobId: job.id, slug: job.slug };
  } catch (err) {
    // Never forward the raw error (could be a Prisma/DB error revealing
    // column/constraint names) to the admin UI — log it server-side and
    // return a generic, user-facing message instead.
    console.error("scheduleJobAction failed:", err);
    return { success: false, error: "Could not schedule the job. Please try again." };
  }
}

export type BulkJobActionType = "publish" | "unpublish" | "archive" | "delete";

export interface BulkJobActionResult extends JobActionResult {
  count?: number;
}

/** Powers the table's bulk-action toolbar — Publish/Unpublish/Archive/Delete across every selected row at once. */
export async function bulkJobsAction(ids: string[], actionType: BulkJobActionType): Promise<BulkJobActionResult> {
  try {
    await assertAdminAndRateLimit("bulk-job-action");
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  if (ids.length === 0) {
    return { success: false, error: "No jobs selected." };
  }

  try {
    let count = 0;
    switch (actionType) {
      case "publish":
        count = await bulkPublishJobs(ids);
        break;
      case "unpublish":
        count = await bulkUnpublishJobs(ids);
        break;
      case "archive":
        count = await bulkArchiveJobs(ids);
        break;
      case "delete":
        count = await bulkSoftDeleteJobs(ids);
        break;
    }

    revalidatePath("/admin/jobs");
    revalidatePublicJobPaths();
    return { success: true, count };
  } catch {
    return { success: false, error: "Bulk action failed. Please try again." };
  }
}
