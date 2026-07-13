"use client";

import { useState } from "react";

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
import { useToast } from "@/hooks/use-toast";
import type { MasterDataDeleteFn, MasterDataRow } from "@/types/master-data";

interface MasterDataDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityLabel: string;
  row: MasterDataRow | null;
  deleteAction: MasterDataDeleteFn;
  onDeleted: () => void;
}

/**
 * Delete confirmation for Companies/Categories/Locations. The
 * job-count guard itself lives server-side (each `delete*Action`
 * refuses when `jobCount > 0`) — this dialog just surfaces whatever
 * message that action returns, including the spec's exact wording when
 * the row still has jobs attached, rather than duplicating the count
 * check on the client where it could drift out of sync with the
 * database.
 */
export function MasterDataDeleteDialog({
  open,
  onOpenChange,
  entityLabel,
  row,
  deleteAction,
  onDeleted,
}: MasterDataDeleteDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    if (!row) return;
    setIsDeleting(true);
    try {
      const result = await deleteAction(row.id);
      if (!result.success) {
        toast({ title: "Could not delete", description: result.error, variant: "destructive" });
        onOpenChange(false);
        return;
      }
      toast({ title: `${entityLabel} deleted`, variant: "success" });
      onOpenChange(false);
      onDeleted();
    } catch {
      toast({ title: "Server error", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {row?.name ?? `this ${entityLabel.toLowerCase()}`}?</AlertDialogTitle>
          <AlertDialogDescription>
            {row && row.jobCount > 0
              ? `This ${entityLabel.toLowerCase()} has ${row.jobCount} job${row.jobCount === 1 ? "" : "s"} attached. Remove it from those jobs before deleting.`
              : `This permanently deletes the ${entityLabel.toLowerCase()}. This cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
            disabled={isDeleting || (row ? row.jobCount > 0 : false)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
