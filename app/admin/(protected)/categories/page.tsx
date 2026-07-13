import type { Metadata } from "next";

import { CategoriesManager } from "@/components/admin/categories/categories-manager";
import { parseMasterDataSearchParams, type RawMasterDataSearchParams } from "@/lib/admin-master-data-url";
import { getAdminCategoriesList } from "@/services/categories.service";

export const metadata: Metadata = { title: "Categories | Admin" };
export const dynamic = "force-dynamic";

interface AdminCategoriesPageProps {
  searchParams: Promise<RawMasterDataSearchParams>;
}

/** `/admin/categories` — Master Data Management for the job-category taxonomy. */
export default async function AdminCategoriesPage({ searchParams }: AdminCategoriesPageProps) {
  const filters = parseMasterDataSearchParams(await searchParams);
  const results = await getAdminCategoriesList(filters);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">Categories</h1>
        <p className="text-sm text-muted-foreground">Manage the job categories used to organize vacancies.</p>
      </div>

      <CategoriesManager
        rows={results.items}
        total={results.total}
        page={results.page}
        totalPages={results.totalPages}
        filters={filters}
      />
    </div>
  );
}
