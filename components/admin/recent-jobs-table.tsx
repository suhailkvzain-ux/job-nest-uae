import { Copy, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { JobStatusBadge } from "@/components/badges/status-badges";
import { Button } from "@/components/ui/button";
import type { JobWithRelations } from "@/services/jobs.service";
import { formatDate } from "@/utils/format";

/**
 * Recent Jobs table for the dashboard. Only "View" is wired to
 * something real (the public job page, in a new tab) — Edit/Duplicate/
 * Delete are rendered per spec but intentionally disabled, since Phase
 * 8's brief is the dashboard only ("Do NOT build CRUD pages yet"). Each
 * disabled action carries a `title` tooltip explaining why, rather than
 * silently doing nothing when clicked.
 */
export function RecentJobsTable({ jobs }: { jobs: JobWithRelations[] }) {
  if (jobs.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No jobs yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="py-3 pr-4 font-medium">
              Job Title
            </th>
            <th scope="col" className="py-3 pr-4 font-medium">
              Company
            </th>
            <th scope="col" className="py-3 pr-4 font-medium">
              Location
            </th>
            <th scope="col" className="py-3 pr-4 font-medium">
              Status
            </th>
            <th scope="col" className="py-3 pr-4 font-medium">
              Published Date
            </th>
            <th scope="col" className="py-3 pl-4 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {jobs.map((job) => (
            <tr key={job.id} className="align-middle">
              <td className="max-w-64 truncate py-3 pr-4 font-medium text-foreground">{job.title}</td>
              <td className="py-3 pr-4 text-muted-foreground">{job.company.name}</td>
              <td className="py-3 pr-4 text-muted-foreground">{job.location.name}</td>
              <td className="py-3 pr-4">
                <JobStatusBadge status={job.status} />
              </td>
              <td className="py-3 pr-4 text-muted-foreground">
                {job.publishedAt ? formatDate(job.publishedAt) : "—"}
              </td>
              <td className="py-3 pl-4">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" asChild aria-label={`View ${job.title}`}>
                    <Link href={`/jobs/${job.slug}`} target="_blank">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled
                    aria-label={`Edit ${job.title} (coming soon)`}
                    title="Job editing arrives in a future phase"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled
                    aria-label={`Duplicate ${job.title} (coming soon)`}
                    title="Job duplication arrives in a future phase"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled
                    aria-label={`Delete ${job.title} (coming soon)`}
                    title="Job deletion arrives in a future phase"
                    className="hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
