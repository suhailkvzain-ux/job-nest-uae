"use client";

import type { Advertisement } from "@prisma/client";
import { useState } from "react";

import { deleteAdvertisementAction } from "@/actions/admin-advertisements.actions";
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

interface AdDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ad: Advertisement | null;
  onDeleted: () => void;
}

export function AdDeleteDialog({ open, onOpenChange, ad, onDeleted }: AdDeleteDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    if (!ad) return;
    setIsDeleting(true);
    try {
      const result = await deleteAdvertisementAction(ad.id);
      if (!result.success) {
        toast({ title: "Could not delete", description: result.error, variant: "destructive" });
        onOpenChange(false);
        return;
      }
      toast({ title: "Advertisement deleted", variant: "success" });
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
          <AlertDialogTitle>Delete {ad?.name ?? "this advertisement"}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the advertisement and it will stop rendering everywhere immediately. This cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
            disabled={isDeleting}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
