import type { Metadata } from "next";

import { CompaniesManager } from "@/components/admin/companies/companies-manager";
import { parseMasterDataSearchParams, type RawMasterDataSearchParams } from "@/lib/admin-master-data-url";
import { getAdminCompaniesList } from "@/services/companies.service";

export const metadata: Metadata = { title: "Companies | Admin" };
export const dynamic = "force-dynamic";

interface AdminCompaniesPageProps {
  searchParams: Promise<RawMasterDataSearchParams>;
}

/**
 * `/admin/companies` — Master Data Management for companies. No
 * recruiter accounts, no logo upload: this is pure reference-data CRUD
 * (name, slug, optional description/website) the admin manages so job
 * postings have a consistent company to point at.
 */
export default async function AdminCompaniesPage({ searchParams }: AdminCompaniesPageProps) {
  const filters = parseMasterDataSearchParams(await searchParams);
  const results = await getAdminCompaniesList(filters);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">Companies</h1>
        <p className="text-sm text-muted-foreground">Manage the company names used across job vacancies.</p>
      </div>

      <CompaniesManager
        rows={results.items}
        total={results.total}
        page={results.page}
        totalPages={results.totalPages}
        filters={filters}
      />
    </div>
  );
}
