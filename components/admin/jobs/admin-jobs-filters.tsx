"use client";

import type { EmploymentType } from "@prisma/client";
import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { employmentTypeLabels } from "@/components/badges/status-badges";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { buildAdminJobsQueryString, countActiveAdminFilters } from "@/lib/admin-jobs-url";
import type { AdminJobSearchInput } from "@/lib/validations/admin-job";

export interface AdminFilterOption {
  id: string;
  name: string;
}

interface AdminJobsFiltersProps {
  initialFilters: AdminJobSearchInput;
  companies: AdminFilterOption[];
  categories: AdminFilterOption[];
  locations: AdminFilterOption[];
}

type Draft = Pick<
  AdminJobSearchInput,
  | "status"
  | "companyId"
  | "categoryId"
  | "locationId"
  | "employmentType"
  | "featured"
  | "verified"
  | "publishedFrom"
  | "publishedTo"
  | "deadlineFrom"
  | "deadlineTo"
>;

function draftFromFilters(filters: AdminJobSearchInput): Draft {
  return {
    status: filters.status,
    companyId: filters.companyId,
    categoryId: filters.categoryId,
    locationId: filters.locationId,
    employmentType: filters.employmentType,
    featured: filters.featured,
    verified: filters.verified,
    publishedFrom: filters.publishedFrom,
    publishedTo: filters.publishedTo,
    deadlineFrom: filters.deadlineFrom,
    deadlineTo: filters.deadlineTo,
  };
}

const EMPTY_DRAFT: Draft = {
  status: undefined,
  companyId: undefined,
  categoryId: undefined,
  locationId: undefined,
  employmentType: undefined,
  featured: undefined,
  verified: undefined,
  publishedFrom: undefined,
  publishedTo: undefined,
  deadlineFrom: undefined,
  deadlineTo: undefined,
};

function toDateInputValue(date?: Date): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

/** Collapsible filter panel for the admin Jobs table — Status/Company/Category/Location/Employment Type/Featured/Verified/Published Date/Deadline, applied explicitly (not live) like the public site's filter sidebars. */
export function AdminJobsFilters({ initialFilters, companies, categories, locations }: AdminJobsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(draftFromFilters(initialFilters));

  const activeCount = countActiveAdminFilters({ ...initialFilters, ...draft });

  function patch(update: Partial<Draft>) {
    setDraft((prev) => ({ ...prev, ...update }));
  }

  function apply() {
    const qs = buildAdminJobsQueryString({ ...initialFilters, ...draft, page: 1 });
    router.push(`${pathname}${qs}`);
    setOpen(false);
  }

  function clear() {
    setDraft(EMPTY_DRAFT);
    const qs = buildAdminJobsQueryString({ ...initialFilters, ...EMPTY_DRAFT, page: 1 });
    router.push(`${pathname}${qs}`);
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <Button variant="outline" onClick={() => setOpen((v) => !v)} className="w-fit gap-2">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {activeCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-gradient text-xs text-primary-foreground">
            {activeCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border/60 bg-card p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-status">Status</Label>
            <Select value={draft.status ?? "any"} onValueChange={(v) => patch({ status: v === "any" ? undefined : (v as Draft["status"]) })}>
              <SelectTrigger id="filter-status">
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-company">Company</Label>
            <Select value={draft.companyId ?? "any"} onValueChange={(v) => patch({ companyId: v === "any" ? undefined : v })}>
              <SelectTrigger id="filter-company">
                <SelectValue placeholder="Any company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any company</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-category">Category</Label>
            <Select value={draft.categoryId ?? "any"} onValueChange={(v) => patch({ categoryId: v === "any" ? undefined : v })}>
              <SelectTrigger id="filter-category">
                <SelectValue placeholder="Any category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any category</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-location">Location</Label>
            <Select value={draft.locationId ?? "any"} onValueChange={(v) => patch({ locationId: v === "any" ? undefined : v })}>
              <SelectTrigger id="filter-location">
                <SelectValue placeholder="Any location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any location</SelectItem>
                {locations.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-type">Employment Type</Label>
            <Select
              value={draft.employmentType ?? "any"}
              onValueChange={(v) => patch({ employmentType: v === "any" ? undefined : (v as EmploymentType) })}
            >
              <SelectTrigger id="filter-type">
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any type</SelectItem>
                {Object.entries(employmentTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
            <Label htmlFor="filter-featured" className="cursor-pointer font-normal">
              Featured only
            </Label>
            <Switch id="filter-featured" checked={Boolean(draft.featured)} onCheckedChange={(v) => patch({ featured: v })} />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
            <Label htmlFor="filter-verified" className="cursor-pointer font-normal">
              Verified only
            </Label>
            <Switch id="filter-verified" checked={Boolean(draft.verified)} onCheckedChange={(v) => patch({ verified: v })} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Published Date</Label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                aria-label="Published from"
                value={toDateInputValue(draft.publishedFrom)}
                onChange={(e) => patch({ publishedFrom: e.target.value ? new Date(e.target.value) : undefined })}
                className="h-9 w-full rounded-lg border border-input bg-background px-2 text-xs"
              />
              <span className="text-muted-foreground">–</span>
              <input
                type="date"
                aria-label="Published to"
                value={toDateInputValue(draft.publishedTo)}
                onChange={(e) => patch({ publishedTo: e.target.value ? new Date(e.target.value) : undefined })}
                className="h-9 w-full rounded-lg border border-input bg-background px-2 text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Application Deadline</Label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                aria-label="Deadline from"
                value={toDateInputValue(draft.deadlineFrom)}
                onChange={(e) => patch({ deadlineFrom: e.target.value ? new Date(e.target.value) : undefined })}
                className="h-9 w-full rounded-lg border border-input bg-background px-2 text-xs"
              />
              <span className="text-muted-foreground">–</span>
              <input
                type="date"
                aria-label="Deadline to"
                value={toDateInputValue(draft.deadlineTo)}
                onChange={(e) => patch({ deadlineTo: e.target.value ? new Date(e.target.value) : undefined })}
                className="h-9 w-full rounded-lg border border-input bg-background px-2 text-xs"
              />
            </div>
          </div>

          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
            <Button onClick={apply} className="gap-2">
              Apply Filters
            </Button>
            {activeCount > 0 && (
              <Button variant="ghost" onClick={clear} className="gap-2 text-muted-foreground">
                <X className="h-3.5 w-3.5" /> Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
