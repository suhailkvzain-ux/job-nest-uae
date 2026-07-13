"use client";

import type { Advertisement } from "@prisma/client";
import { Copy, Eye, MoreHorizontal, Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  disableAdvertisementAction,
  duplicateAdvertisementAction,
  enableAdvertisementAction,
} from "@/actions/admin-advertisements.actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface AdRowActionsProps {
  ad: Advertisement;
  onPreview: (ad: Advertisement) => void;
  onEdit: (ad: Advertisement) => void;
  onDelete: (ad: Advertisement) => void;
}

/** Per-row action menu — Preview/Edit/Duplicate/Enable-or-Disable/Delete, exactly per spec. Preview and Edit are handled by the parent `AdvertisementsManager` (shared dialog instances); Duplicate/Enable/Disable fire immediately with a toast, matching Job's row-action conventions. */
export function AdRowActions({ ad, onPreview, onEdit, onDelete }: AdRowActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  function runAction(label: string, action: () => Promise<{ success: boolean; error?: string }>) {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${ad.name}`} disabled={isPending}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => onPreview(ad)}>
          <Eye className="h-4 w-4" /> Preview
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onEdit(ad)}>
          <Pencil className="h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => runAction("Advertisement duplicated", () => duplicateAdvertisementAction(ad.id))}>
          <Copy className="h-4 w-4" /> Duplicate
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {ad.status === "ACTIVE" ? (
          <DropdownMenuItem onSelect={() => runAction("Advertisement disabled", () => disableAdvertisementAction(ad.id))}>
            <PowerOff className="h-4 w-4" /> Disable
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => runAction("Advertisement enabled", () => enableAdvertisementAction(ad.id))}>
            <Power className="h-4 w-4" /> Enable
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => onDelete(ad)}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
