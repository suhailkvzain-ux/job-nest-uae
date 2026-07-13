/**
 * Shared shapes for the Master Data Management module
 * (`/admin/companies`, `/admin/categories`, `/admin/locations`).
 * Companies, Categories, and Locations are structurally identical from
 * the admin list/form's point of view (name, slug, optional
 * description, job count, timestamps) — Company additionally carries an
 * optional `website`, gated behind the `hasWebsite` config flag rather
 * than a separate type per entity. One generic `MasterDataManager`
 * (table + search + sort + pagination + create/edit dialog + delete
 * confirmation) is driven by these shapes plus a small per-entity
 * adapter, instead of three near-duplicate CRUD UIs.
 */

export interface MasterDataRow {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  website?: string | null;
  jobCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface MasterDataActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  slug?: string;
}

export interface MasterDataFormValues {
  name: string;
  slug?: string;
  description?: string | null;
  website?: string | null;
}

export type MasterDataCreateFn = (input: MasterDataFormValues) => Promise<MasterDataActionResult>;
export type MasterDataUpdateFn = (id: string, input: MasterDataFormValues) => Promise<MasterDataActionResult>;
export type MasterDataDeleteFn = (id: string) => Promise<MasterDataActionResult>;
