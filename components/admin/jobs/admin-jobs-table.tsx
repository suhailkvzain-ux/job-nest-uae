"use client";

import { Archive, Send, Trash2, Undo2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { bulkJobsAction, type BulkJobActionType } from "@/actions/admin-jobs.actions";
import { JobRowActions } from "@/components/admin/jobs/job-row-actions";
import {
  EmploymentTypeBadge,
  FeaturedBadge,
  JobStatusBadge,
  VerifiedBadge,
} from "@/components/badges/status-badges";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import type { JobWithRelations } from "@/services/jobs.service";
import { formatDate, formatPostedTime } from "@/utils/format";

/**
 * The admin Jobs data table — sticky header, row-selection checkboxes,
 * and the bulk-action toolbar, all in one Client Component since the
 * toolbar and the checkboxes share the same `selectedIds` state.
 * Sorting/filtering/pagination stay server-side/URL-driven (handled by
 * the sibling `AdminJobsFilters`/`AdminJobsSortControl`/
 * `AdminJobsPagination`); this component only owns the client-only
 * concern of "which rows are currently checked."
 */
export function AdminJobsTable({ jobs }: { jobs: JobWithRelations[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const allSelected = jobs.length > 0 && jobs.every((job) => selected.has(job.id));
  const someSelected = selected.size > 0;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(jobs.map((j) => j.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  function runBulk(actionType: BulkJobActionType, label: string) {
    startTransition(async () => {
      const result = await bulkJobsAction(selectedIds, actionType);
      if (result.success) {
        toast({
          title: `${label} ${result.count} ${result.count === 1 ? "job" : "jobs"}`,
          variant: "success",
        });
        setSelected(new Set());
        router.refresh();
      } else {
        toast({ title: "Bulk action failed", description: result.error, variant: "destructive" });
      }
    });
  }

  if (jobs.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No jobs match the current filters.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {someSelected && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary/20 bg-brand-gradient-soft px-4 py-3">
          <span className="text-sm font-medium text-foreground">{selected.size} selected</span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => runBulk("publish", "Published")}
            >
              <Send className="h-3.5 w-3.5" /> Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => runBulk("unpublish", "Unpublished")}
            >
              <Undo2 className="h-3.5 w-3.5" /> Unpublish
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => runBulk("archive", "Archived")}
            >
              <Archive className="h-3.5 w-3.5" /> Archive
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={() => setConfirmBulkDelete(true)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border/60">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="sticky top-16 z-dropdown w-10 bg-card py-3 pl-4">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all jobs on this page"
                />
              </th>
              <th scope="col" className="sticky top-16 z-dropdown bg-card py-3 pr-4 font-medium">
                Job Title
              </th>
              <th scope="col" className="sticky top-16 z-dropdown bg-card py-3 pr-4 font-medium">
                Company
              </th>
              <th scope="col" className="sticky top-16 z-dropdown bg-card py-3 pr-4 font-medium">
                Category
              </th>
              <th scope="col" className="sticky top-16 z-dropdown bg-card py-3 pr-4 font-medium">
                Location
              </th>
              <th scope="col" className="sticky top-16 z-dropdown bg-card py-3 pr-4 font-medium">
                Type
              </th>
              <th scope="col" className="sticky top-16 z-dropdown bg-card py-3 pr-4 font-medium">
                Status
              </th>
              <th scope="col" className="sticky top-16 z-dropdown bg-card py-3 pr-4 font-medium">
                Featured
              </th>
              <th scope="col" className="sticky top-16 z-dropdown bg-card py-3 pr-4 font-medium">
                Verified
              </th>
              <th scope="col" className="sticky top-16 z-dropdown bg-card py-3 pr-4 font-medium">
                Published
              </th>
              <th scope="col" className="sticky top-16 z-dropdown bg-card py-3 pr-4 font-medium">
                Deadline
              </th>
              <th scope="col" className="sticky top-16 z-dropdown bg-card py-3 pr-4 font-medium">
                Last Updated
              </th>
              <th
                scope="col"
                className="sticky top-16 z-dropdown bg-card py-3 pl-4 pr-4 text-right font-medium"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {jobs.map((job) => (
              <tr key={job.id} className={selected.has(job.id) ? "bg-muted/40" : undefined}>
                <td className="py-3 pl-4">
                  <Checkbox
                    checked={selected.has(job.id)}
                    onCheckedChange={() => toggleOne(job.id)}
                    aria-label={`Select ${job.title}`}
                  />
                </td>
                <td className="max-w-56 truncate py-3 pr-4 font-medium text-foreground">
                  <Link
                    href={`/admin/jobs/${job.id}/edit`}
                    className="hover:text-primary hover:underline"
                  >
                    {job.title}
                  </Link>
                </td>
                <td className="max-w-40 truncate py-3 pr-4 text-muted-foreground">
                  {job.company.name}
                </td>
                <td className="max-w-36 truncate py-3 pr-4 text-muted-foreground">
                  {job.category.name}
                </td>
                <td className="py-3 pr-4 text-muted-foreground">{job.location.name}</td>
                <td className="py-3 pr-4">
                  <EmploymentTypeBadge type={job.employmentType} />
                </td>
                <td className="py-3 pr-4">
                  <JobStatusBadge status={job.status} />
                </td>
                <td className="py-3 pr-4">
                  {job.featured ? (
                    <FeaturedBadge />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  {job.verified ? (
                    <VerifiedBadge />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-3 pr-4 text-muted-foreground">
                  {job.publishedAt ? formatDate(job.publishedAt) : "—"}
                </td>
                <td className="py-3 pr-4 text-muted-foreground">
                  {job.applicationDeadline ? formatDate(job.applicationDeadline) : "—"}
                </td>
                <td className="py-3 pr-4 text-muted-foreground" title={formatDate(job.updatedAt)}>
                  {formatPostedTime(job.updatedAt)}
                </td>
                <td className="py-3 pl-4 pr-4 text-right">
                  <JobRowActions job={job} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selected.size} selected {selected.size === 1 ? "job" : "jobs"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes them from every public page immediately. It's a soft delete, not
              permanent — but there's no restore UI in this dashboard yet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmBulkDelete(false);
                runBulk("delete", "Deleted");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
