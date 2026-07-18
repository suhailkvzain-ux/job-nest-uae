import { adminCategorySearchSchema, type AdminCategorySearchInput } from "@/lib/validations/admin-category";

export type RawAdminCategorySearchParams = Record<string, string | string[] | undefined>;

function toSingle(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseAdminCategoriesSearchParams(
  searchParams: RawAdminCategorySearchParams,
): AdminCategorySearchInput {
  const raw = {
    query: toSingle(searchParams.search),
    status: toSingle(searchParams.status),
    featured: toSingle(searchParams.featured) === "true" ? true : undefined,
    popular: toSingle(searchParams.popular) === "true" ? true : undefined,
    sort: toSingle(searchParams.sort),
    page: toSingle(searchParams.page),
  };

  const parsed = adminCategorySearchSchema.safeParse(raw);
  return parsed.success ? parsed.data : adminCategorySearchSchema.parse({});
}

export function buildAdminCategoriesQueryString(filters: Partial<AdminCategorySearchInput>): string {
  const params = new URLSearchParams();

  if (filters.query) params.set("search", filters.query);
  if (filters.status) params.set("status", filters.status);
  if (filters.featured) params.set("featured", "true");
  if (filters.popular) params.set("popular", "true");
  if (filters.sort && filters.sort !== "display_order") params.set("sort", filters.sort);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
