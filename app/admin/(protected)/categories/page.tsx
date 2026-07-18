import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CategoryGrid } from "@/components/admin/categories/category-grid";
import { CategoryPagination } from "@/components/admin/categories/category-pagination";
import { CategoryStats } from "@/components/admin/categories/category-stats";
import { CategoryToolbar } from "@/components/admin/categories/category-toolbar";
import { Button } from "@/components/ui/button";
import { parseAdminCategoriesSearchParams, type RawAdminCategorySearchParams } from "@/lib/admin-categories-url";
import { getAdminCategoriesList, getAdminCategoryStats } from "@/services/categories.service";

export const metadata: Metadata = { title: "Categories | Admin" };
export const dynamic = "force-dynamic";

interface AdminCategoriesPageProps {
  searchParams: Promise<RawAdminCategorySearchParams>;
}

/** `/admin/categories` — premium card-grid Categories Management, matching the reference spec. */
export default async function AdminCategoriesPage({ searchParams }: AdminCategoriesPageProps) {
  const filters = parseAdminCategoriesSearchParams(await searchParams);
  const [results, stats] = await Promise.all([getAdminCategoriesList(filters), getAdminCategoryStats()]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground">Job Categories</h1>
          <p className="text-sm text-muted-foreground">Manage job categories displayed on the JOB FOR UAE website.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/categories/new">
            <Plus className="h-4 w-4" /> Add Category
          </Link>
        </Button>
      </div>

      <CategoryStats stats={stats} />

      <CategoryToolbar filters={filters} />

      <CategoryGrid categories={results.items} />

      <CategoryPagination filters={filters} page={results.page} totalPages={results.totalPages} />
    </div>
  );
}
