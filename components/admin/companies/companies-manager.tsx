"use client";

import {
  createCompanyAction,
  deleteCompanyAction,
  updateCompanyAction,
} from "@/actions/admin-companies.actions";
import { MasterDataManager } from "@/components/admin/master-data/master-data-manager";
import type { MasterDataSearchInput } from "@/lib/validations/admin-master-data";
import type { MasterDataFormValues, MasterDataRow } from "@/types/master-data";

/**
 * Thin per-entity adapter: maps the generic `MasterDataFormValues`
 * shape onto `CreateCompanyInput`/`UpdateCompanyInput` explicitly,
 * rather than relying on structural-typing edge cases to pass
 * `createCompanyAction` straight through as a prop. Company is the only
 * one of the three master-data entities with a `website` field, which
 * is why this file (unlike the Category/Location equivalents) actually
 * forwards it.
 */
export function CompaniesManager({
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
    return createCompanyAction({
      name: values.name,
      slug: values.slug,
      website: values.website ?? null,
      description: values.description ?? null,
    });
  }

  async function handleUpdate(id: string, values: MasterDataFormValues) {
    return updateCompanyAction(id, {
      name: values.name,
      website: values.website ?? null,
      description: values.description ?? null,
    });
  }

  async function handleDelete(id: string) {
    return deleteCompanyAction(id);
  }

  return (
    <MasterDataManager
      entityLabel="Company"
      entityLabelPlural="Companies"
      basePath="/admin/companies"
      publicBasePath="/companies"
      hasWebsite
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
