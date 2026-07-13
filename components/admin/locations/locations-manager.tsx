"use client";

import {
  createLocationAction,
  deleteLocationAction,
  updateLocationAction,
} from "@/actions/admin-locations.actions";
import { MasterDataManager } from "@/components/admin/master-data/master-data-manager";
import type { MasterDataSearchInput } from "@/lib/validations/admin-master-data";
import type { MasterDataFormValues, MasterDataRow } from "@/types/master-data";

/** Thin per-entity adapter — see `CompaniesManager` for the rationale. Locations have no `website` field. */
export function LocationsManager({
  rows,
  total,
  page,
  totalPages,
  filters,
}: {
  rows: MasterDataRow[];
  total: number;
  page: number;
  totalPages: number;
  filters: MasterDataSearchInput;
}) {
  async function handleCreate(values: MasterDataFormValues) {
    return createLocationAction({
      name: values.name,
      slug: values.slug,
      description: values.description ?? null,
    });
  }

  async function handleUpdate(id: string, values: MasterDataFormValues) {
    return updateLocationAction(id, {
      name: values.name,
      description: values.description ?? null,
    });
  }

  async function handleDelete(id: string) {
    return deleteLocationAction(id);
  }

  return (
    <MasterDataManager
      entityLabel="Location"
      entityLabelPlural="Locations"
      basePath="/admin/locations"
      publicBasePath="/locations"
      rows={rows}
      total={total}
      page={page}
      totalPages={totalPages}
      filters={filters}
      createAction={handleCreate}
      updateAction={handleUpdate}
      deleteAction={handleDelete}
    />
  );
}
