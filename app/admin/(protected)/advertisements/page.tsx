import type { Metadata } from "next";

import { AdvertisementsManager } from "@/components/admin/advertisements/advertisements-manager";
import { parseAdminAdSearchParams, type RawAdminAdSearchParams } from "@/lib/admin-advertisements-url";
import { getAdminAdvertisementsList } from "@/services/advertisements.service";

export const metadata: Metadata = { title: "Advertisements | Admin" };
export const dynamic = "force-dynamic";

interface AdminAdvertisementsPageProps {
  searchParams: Promise<RawAdminAdSearchParams>;
}

/**
 * `/admin/advertisements` — the Advertisement Manager. Lets the single
 * administrator manage every ad placement across the site (AdSense,
 * Custom HTML, Image Banner) without ever touching code, per the Phase
 * 11 spec's stated purpose.
 */
export default async function AdminAdvertisementsPage({ searchParams }: AdminAdvertisementsPageProps) {
  const filters = parseAdminAdSearchParams(await searchParams);
  const results = await getAdminAdvertisementsList(filters);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">Advertisements</h1>
        <p className="text-sm text-muted-foreground">
          Manage every ad placement across the site — Google AdSense, Custom HTML, and Image Banner ads.
        </p>
      </div>

      <AdvertisementsManager
        ads={results.items}
        total={results.total}
        page={results.page}
        totalPages={results.totalPages}
        filters={filters}
      />
    </div>
  );
}
