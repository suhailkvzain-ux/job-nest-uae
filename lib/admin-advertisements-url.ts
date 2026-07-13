import { adminAdSearchSchema, type AdminAdSearchInput } from "@/lib/validations/admin-advertisement";

export type RawAdminAdSearchParams = Record<string, string | string[] | undefined>;

function toSingle(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseAdminAdSearchParams(searchParams: RawAdminAdSearchParams): AdminAdSearchInput {
  const raw = {
    query: toSingle(searchParams.search),
    position: toSingle(searchParams.position),
    status: toSingle(searchParams.status),
    adType: toSingle(searchParams.adType),
    sort: toSingle(searchParams.sort),
    page: toSingle(searchParams.page),
    pageSize: 20,
  };

  const parsed = adminAdSearchSchema.safeParse(raw);
  return parsed.success ? parsed.data : adminAdSearchSchema.parse({});
}

export function buildAdminAdQueryString(filters: Partial<AdminAdSearchInput>): string {
  const params = new URLSearchParams();

  if (filters.query) params.set("search", filters.query);
  if (filters.position) params.set("position", filters.position);
  if (filters.status) params.set("status", filters.status);
  if (filters.adType) params.set("adType", filters.adType);
  if (filters.sort && filters.sort !== "display_order") params.set("sort", filters.sort);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
