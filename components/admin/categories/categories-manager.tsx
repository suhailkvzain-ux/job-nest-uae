"use client";

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/actions/admin-categories.actions";
import { MasterDataManager } from "@/components/admin/master-data/master-data-manager";
import type { MasterDataSearchInput } from "@/lib/validations/admin-master-data";
import type { MasterDataFormValues, MasterDataRow } from "@/types/master-data";

/** Thin per-entity adapter — see `CompaniesManager` for the rationale. Categories have no `website` field. */
export function CategoriesManager({
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
    return createCategoryAction({
      name: values.name,
      slug: values.slug,
      description: values.description ?? null,
    });
  }

  async function handleUpdate(id: string, values: MasterDataFormValues) {
    return updateCategoryAction(id, {
      name: values.name,
      description: values.description ?? null,
    });
  }

  async function handleDelete(id: string) {
    return deleteCategoryAction(id);
  }

  return (
    <MasterDataManager
      entityLabel="Category"
      entityLabelPlural="Categories"
      basePath="/admin/categories"
      publicBasePath="/categories"
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
