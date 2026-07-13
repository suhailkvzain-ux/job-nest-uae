"use client";

import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MasterDataRow } from "@/types/master-data";
import { formatDate } from "@/utils/format";

interface MasterDataTableProps {
  rows: MasterDataRow[];
  entityLabel: string;
  publicBasePath: string;
  onEdit: (row: MasterDataRow) => void;
  onDelete: (row: MasterDataRow) => void;
}

/**
 * Shared list table for Companies/Categories/Locations — Name, Slug,
 * Number of Jobs, Created Date, Actions, exactly per the spec's three
 * (structurally identical) column lists. Row actions are a
 * `DropdownMenu` (View → the public entity page in a new tab; Edit/
 * Delete → hand the row up to the parent `MasterDataManager`, which
 * owns the single shared form/delete dialog instances).
 */
export function MasterDataTable({
  rows,
  entityLabel,
  publicBasePath,
  onEdit,
  onDelete,
}: MasterDataTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title={`No ${entityLabel.toLowerCase()}s found`}
        description={`Try a different search, or create a new ${entityLabel.toLowerCase()}.`}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="sticky top-16 z-dropdown bg-card py-3 pl-4 pr-4 font-medium">
              {entityLabel} Name
            </th>
            <th scope="col" className="sticky top-16 z-dropdown bg-card py-3 pr-4 font-medium">
              Slug
            </th>
            <th scope="col" className="sticky top-16 z-dropdown bg-card py-3 pr-4 font-medium">
              Number of Jobs
            </th>
            <th scope="col" className="sticky top-16 z-dropdown bg-card py-3 pr-4 font-medium">
              Created Date
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
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="max-w-64 truncate py-3 pl-4 pr-4 font-medium text-foreground">
                {row.name}
              </td>
              <td className="max-w-56 truncate py-3 pr-4 text-muted-foreground">{row.slug}</td>
              <td className="py-3 pr-4">
                <Badge variant={row.jobCount > 0 ? "default" : "secondary"}>{row.jobCount}</Badge>
              </td>
              <td className="py-3 pr-4 text-muted-foreground">{formatDate(row.createdAt)}</td>
              <td className="py-3 pl-4 pr-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`Actions for ${row.name}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <Link href={`${publicBasePath}/${row.slug}`} target="_blank">
                        <Eye className="h-4 w-4" /> View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onEdit(row)}>
                      <Pencil className="h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => onDelete(row)}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
