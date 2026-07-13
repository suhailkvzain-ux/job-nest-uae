import { masterDataSearchSchema, type MasterDataSearchInput } from "@/lib/validations/admin-master-data";

/**
 * URL⇄filter-object mapping shared by `/admin/companies`,
 * `/admin/categories`, and `/admin/locations` — the master-data
 * equivalent of `lib/admin-jobs-url.ts`, generic because all three
 * entities share the exact same search/sort/pagination shape.
 */

export type RawMasterDataSearchParams = Record<string, string | string[] | undefined>;

function toSingle(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseMasterDataSearchParams(searchParams: RawMasterDataSearchParams): MasterDataSearchInput {
  const raw = {
    query: toSingle(searchParams.search),
    sort: toSingle(searchParams.sort),
    page: toSingle(searchParams.page),
    pageSize: 20,
  };

  const parsed = masterDataSearchSchema.safeParse(raw);
  return parsed.success ? parsed.data : masterDataSearchSchema.parse({});
}

export function buildMasterDataQueryString(filters: Partial<MasterDataSearchInput>): string {
  const params = new URLSearchParams();

  if (filters.query) params.set("search", filters.query);
  if (filters.sort && filters.sort !== "name_az") params.set("sort", filters.sort);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
