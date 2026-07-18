"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildAdminCategoriesQueryString } from "@/lib/admin-categories-url";
import type { AdminCategorySearchInput } from "@/lib/validations/admin-category";

/** Search + filter drawer + sort control for `/admin/categories`, matching the reference spec (300ms-debounced live search, status/featured/popular filters, sort). */
export function CategoryToolbar({ filters }: { filters: AdminCategorySearchInput }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(filters.query ?? "");
  const [open, setOpen] = useState(false);

  function push(update: Partial<AdminCategorySearchInput>) {
    const qs = buildAdminCategoriesQueryString({ ...filters, ...update, page: 1 });
    router.push(`${pathname}${qs}`);
  }

  let debounceTimer: ReturnType<typeof setTimeout>;
  function onSearchChange(value: string) {
    setQuery(value);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => push({ query: value || undefined }), 300);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search categories..."
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setOpen((v) => !v)}>
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
        <Select value={filters.sort} onValueChange={(v) => push({ sort: v as AdminCategorySearchInput["sort"] })}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="display_order">Display Order</SelectItem>
            <SelectItem value="name_az">Alphabetical (A–Z)</SelectItem>
            <SelectItem value="name_za">Alphabetical (Z–A)</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="job_count">Most Jobs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {open && (
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border/60 bg-card p-5 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label>Status</Label>
            <Select
              value={filters.status ?? "any"}
              onValueChange={(v) => push({ status: v === "any" ? undefined : (v as "active" | "inactive") })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
            <Label className="cursor-pointer font-normal">Featured only</Label>
            <input
              type="checkbox"
              checked={Boolean(filters.featured)}
              onChange={(e) => push({ featured: e.target.checked || undefined })}
              className="h-4 w-4 rounded border-input accent-primary"
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
            <Label className="cursor-pointer font-normal">Popular only</Label>
            <input
              type="checkbox"
              checked={Boolean(filters.popular)}
              onChange={(e) => push({ popular: e.target.checked || undefined })}
              className="h-4 w-4 rounded border-input accent-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
}
