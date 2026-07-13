import { Eye } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { JobStatusBadge } from "@/components/badges/status-badges";
import { JobDetails } from "@/components/jobs/job-details";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/constants/site";
import { getJobByIdWithRelations, getRelatedJobs } from "@/services/jobs.service";

export const metadata: Metadata = { title: "Preview Job | Admin" };
export const dynamic = "force-dynamic";

interface PreviewJobPageProps {
  params: Promise<{ id: string }>;
}

/**
 * `/admin/jobs/[id]/preview` — renders the exact public `JobDetails`
 * composition regardless of the job's status, so the admin can see a
 * draft/scheduled job exactly as it will look once published. Unlike
 * the public `/jobs/[slug]` route, this page never 404s on draft/
 * archived/scheduled/expired — only a genuinely missing or soft-deleted
 * `id` is treated as not-found. Click tracking (`onWebsiteClick`/
 * `onEmailClick`/`onShare`) and view-count increments are deliberately
 * omitted here — a preview is an admin looking at their own draft, not
 * a real candidate visit, so it shouldn't pollute analytics.
 */
export default async function PreviewJobPage({ params }: PreviewJobPageProps) {
  const { id } = await params;
  const job = await getJobByIdWithRelations(id);

  if (!job || job.deletedAt) {
    return (
      <EmptyState
        title="Job not found"
        description="This job may have been deleted. Go back to the job list to find what you're looking for."
        action={
          <Button asChild variant="outline">
            <Link href="/admin/jobs">Back to Jobs</Link>
          </Button>
        }
      />
    );
  }

  const relatedJobs = await getRelatedJobs(job.id, 6).catch(() => []);
  const jobUrl = `${siteConfig.url}/jobs/${job.slug}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 text-primary" />
          <div className="flex flex-col">
            <p className="text-sm font-medium text-foreground">Preview mode</p>
            <p className="text-xs text-muted-foreground">
              This is exactly how the job will appear on the public site once published.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <JobStatusBadge status={job.status} />
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/jobs/${job.id}/edit`}>Back to Edit</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-background p-4 sm:p-6 lg:p-8">
        <JobDetails job={job} relatedJobs={relatedJobs} jobUrl={jobUrl} />
      </div>
    </div>
  );
}
