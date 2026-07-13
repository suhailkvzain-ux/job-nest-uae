"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { MasterDataDeleteDialog } from "@/components/admin/master-data/master-data-delete-dialog";
import { MasterDataFormDialog } from "@/components/admin/master-data/master-data-form-dialog";
import { MasterDataPagination } from "@/components/admin/master-data/master-data-pagination";
import { MasterDataSearchBar } from "@/components/admin/master-data/master-data-search-bar";
import { MasterDataSortControl } from "@/components/admin/master-data/master-data-sort-control";
import { MasterDataTable } from "@/components/admin/master-data/master-data-table";
import { Button } from "@/components/ui/button";
import type { MasterDataSearchInput } from "@/lib/validations/admin-master-data";
import type {
  MasterDataCreateFn,
  MasterDataDeleteFn,
  MasterDataRow,
  MasterDataUpdateFn,
} from "@/types/master-data";
import { formatNumber } from "@/utils/format";

interface MasterDataManagerProps {
  entityLabel: string;
  entityLabelPlural: string;
  basePath: string;
  publicBasePath: string;
  hasWebsite?: boolean;
  rows: MasterDataRow[];
  total: number;
  page: number;
  totalPages: number;
  filters: MasterDataSearchInput;
  createAction: MasterDataCreateFn;
  updateAction: MasterDataUpdateFn;
  deleteAction: MasterDataDeleteFn;
}

/**
 * The full Master Data Management surface — search, sort, pagination,
 * table, create/edit dialog, and delete confirmation — for one
 * reference-data entity. `/admin/companies`, `/admin/categories`, and
 * `/admin/locations` are each a thin Server Component page that fetches
 * its own data and instantiates this once, passing in its own
 * (adapted) Server Actions. Dialog state lives here, once, rather than
 * per-row, since only one row can be edited or deleted at a time.
 */
export function MasterDataManager({
  entityLabel,
  entityLabelPlural,
  basePath,
  publicBasePath,
  hasWebsite = false,
  rows,
  total,
  page,
  totalPages,
  filters,
  createAction,
  updateAction,
  deleteAction,
}: MasterDataManagerProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<MasterDataRow | null>(null);
  const [deleteRow, setDeleteRow] = useState<MasterDataRow | null>(null);

  function handleCreateClick() {
    setEditingRow(null);
    setFormOpen(true);
  }

  function handleEditClick(row: MasterDataRow) {
    setEditingRow(row);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{formatNumber(total)}</span> total {entityLabelPlural.toLowerCase()}
        </p>
        <Button className="gap-2" onClick={handleCreateClick}>
          <Plus className="h-4 w-4" /> Create {entityLabel}
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <MasterDataSearchBar placeholder={`Search ${entityLabelPlural.toLowerCase()}…`} />
        <MasterDataSortControl filters={filters} />
      </div>

      <MasterDataTable
        rows={rows}
        entityLabel={entityLabel}
        publicBasePath={publicBasePath}
        onEdit={handleEditClick}
        onDelete={setDeleteRow}
      />

      <MasterDataPagination basePath={basePath} filters={filters} page={page} totalPages={totalPages} />

      <MasterDataFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        entityLabel={entityLabel}
        hasWebsite={hasWebsite}
        editingRow={editingRow}
        createAction={createAction}
        updateAction={updateAction}
        onSaved={() => router.refresh()}
      />

      <MasterDataDeleteDialog
        open={Boolean(deleteRow)}
        onOpenChange={(open) => !open && setDeleteRow(null)}
        entityLabel={entityLabel}
        row={deleteRow}
        deleteAction={deleteAction}
        onDeleted={() => {
          setDeleteRow(null);
          router.refresh();
        }}
      />
    </div>
  );
}
