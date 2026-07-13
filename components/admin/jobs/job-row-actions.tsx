"use client";

import {
  Archive,
  Copy,
  Eye,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  archiveJobAction,
  duplicateJobAction,
  publishJobAction,
  unpublishJobAction,
  deleteJobAction,
} from "@/actions/admin-jobs.actions";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import type { JobWithRelations } from "@/services/jobs.service";

/**
 * Per-row action menu — View/Preview/Edit/Duplicate/Publish/Unpublish/
 * Archive/Soft Delete, exactly per spec. Delete is the only one gated
 * behind a confirmation modal (`AlertDialog`); every other action fires
 * immediately with a toast, since they're all non-destructive and
 * already reversible (unpublish undoes publish, restore isn't built yet
 * but soft-delete alone is the only truly hard-to-casually-undo action
 * here).
 */
export function JobRowActions({ job }: { job: JobWithRelations }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  function runAction(
    label: string,
    action: () => Promise<{ success: boolean; error?: string }>,
  ) {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast({ title: label, variant: "success" });
        router.refresh();
      } else {
        toast({ title: "Action failed", description: result.error, variant: "destructive" });
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${job.title}`} disabled={isPending}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <Link href={`/jobs/${job.slug}`} target="_blank">
              <Eye className="h-4 w-4" /> View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/jobs/${job.id}/preview`}>
              <Eye className="h-4 w-4" /> Preview
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/jobs/${job.id}/edit`}>
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => runAction("Job duplicated", () => duplicateJobAction(job.id))}
          >
            <Copy className="h-4 w-4" /> Duplicate
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {job.status !== "PUBLISHED" && (
            <DropdownMenuItem onSelect={() => runAction("Job published", () => publishJobAction(job.id))}>
              <Send className="h-4 w-4" /> Publish
            </DropdownMenuItem>
          )}
          {job.status === "PUBLISHED" && (
            <DropdownMenuItem onSelect={() => runAction("Job unpublished", () => unpublishJobAction(job.id))}>
              <Undo2 className="h-4 w-4" /> Unpublish
            </DropdownMenuItem>
          )}
          {job.status !== "ARCHIVED" && (
            <DropdownMenuItem onSelect={() => runAction("Job archived", () => archiveJobAction(job.id))}>
              <Archive className="h-4 w-4" /> Archive
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => setDeleteOpen(true)}
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{job.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes it from every public page immediately. It's a soft delete — the record stays in the
              database and can be restored from the database if needed, but there's no undo in this dashboard yet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDeleteOpen(false);
                runAction("Job deleted", () => deleteJobAction(job.id));
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
