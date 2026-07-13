import type { Metadata } from "next";

import { LocationsManager } from "@/components/admin/locations/locations-manager";
import { parseMasterDataSearchParams, type RawMasterDataSearchParams } from "@/lib/admin-master-data-url";
import { getAdminLocationsList } from "@/services/locations.service";

export const metadata: Metadata = { title: "Locations | Admin" };
export const dynamic = "force-dynamic";

interface AdminLocationsPageProps {
  searchParams: Promise<RawMasterDataSearchParams>;
}

/** `/admin/locations` — Master Data Management for the UAE location taxonomy. */
export default async function AdminLocationsPage({ searchParams }: AdminLocationsPageProps) {
  const filters = parseMasterDataSearchParams(await searchParams);
  const results = await getAdminLocationsList(filters);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">Locations</h1>
        <p className="text-sm text-muted-foreground">Manage the UAE locations used to organize vacancies.</p>
      </div>

      <LocationsManager
        rows={results.items}
        total={results.total}
        page={results.page}
        totalPages={results.totalPages}
        filters={filters}
      />
    </div>
  );
}
