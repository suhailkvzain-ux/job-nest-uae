"use client";

import type { Advertisement } from "@prisma/client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdDeleteDialog } from "@/components/admin/advertisements/ad-delete-dialog";
import { AdPreviewDialog } from "@/components/admin/advertisements/ad-preview-dialog";
import { AdminAdsFilters } from "@/components/admin/advertisements/admin-ads-filters";
import { AdminAdsPagination } from "@/components/admin/advertisements/admin-ads-pagination";
import { AdminAdsSearchBar } from "@/components/admin/advertisements/admin-ads-search-bar";
import { AdminAdsSortControl } from "@/components/admin/advertisements/admin-ads-sort-control";
import { AdvertisementFormDialog } from "@/components/admin/advertisements/advertisement-form-dialog";
import { AdvertisementsTable } from "@/components/admin/advertisements/advertisements-table";
import { Button } from "@/components/ui/button";
import type { AdminAdSearchInput } from "@/lib/validations/admin-advertisement";
import { formatNumber } from "@/utils/format";

interface AdvertisementsManagerProps {
  ads: Advertisement[];
  total: number;
  page: number;
  totalPages: number;
  filters: AdminAdSearchInput;
}

/** Orchestrates `/admin/advertisements`: search/filter/sort/pagination, the table, and the three dialogs (create/edit, preview, delete) — one shared instance of each, keyed off which row (if any) is currently targeted. */
export function AdvertisementsManager({ ads, total, page, totalPages, filters }: AdvertisementsManagerProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [previewAd, setPreviewAd] = useState<Advertisement | null>(null);
  const [deleteAd, setDeleteAd] = useState<Advertisement | null>(null);

  function handleCreateClick() {
    setEditingAd(null);
    setFormOpen(true);
  }

  function handleEditClick(ad: Advertisement) {
    setEditingAd(ad);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{formatNumber(total)}</span> total advertisements
        </p>
        <Button className="gap-2" onClick={handleCreateClick}>
          <Plus className="h-4 w-4" /> Create Advertisement
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <AdminAdsSearchBar />
        <div className="flex flex-wrap items-center gap-2">
          <AdminAdsFilters filters={filters} />
          <AdminAdsSortControl filters={filters} />
        </div>
      </div>

      <AdvertisementsTable ads={ads} onPreview={setPreviewAd} onEdit={handleEditClick} onDelete={setDeleteAd} />

      <AdminAdsPagination filters={filters} page={page} totalPages={totalPages} />

      <AdvertisementFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingAd={editingAd}
        onSaved={() => router.refresh()}
      />

      <AdPreviewDialog open={Boolean(previewAd)} onOpenChange={(open) => !open && setPreviewAd(null)} ad={previewAd} />

      <AdDeleteDialog
        open={Boolean(deleteAd)}
        onOpenChange={(open) => !open && setDeleteAd(null)}
        ad={deleteAd}
        onDeleted={() => {
          setDeleteAd(null);
          router.refresh();
        }}
      />
    </div>
  );
}
