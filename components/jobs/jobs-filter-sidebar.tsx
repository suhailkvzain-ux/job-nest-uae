"use client";

import type { EmploymentType } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { CategoryFilter } from "@/components/filters/category-filter";
import { CompanyFilter } from "@/components/filters/company-filter";
import { EducationFilter } from "@/components/filters/education-filter";
import { EmploymentTypeFilter } from "@/components/filters/employment-type-filter";
import { ExperienceFilter } from "@/components/filters/experience-filter";
import { FeaturedVerifiedFilter } from "@/components/filters/featured-verified-filter";
import { LocationFilter } from "@/components/filters/location-filter";
import { PostedWithinFilter } from "@/components/filters/posted-within-filter";
import { ResetFilters } from "@/components/filters/reset-filters";
import { SalaryFilter } from "@/components/filters/salary-filter";
import { VisaStatusFilter } from "@/components/filters/visa-status-filter";
import { Divider } from "@/components/layout/divider";
import type { EntityOption } from "@/components/search/entity-search";
import { Button } from "@/components/ui/button";
import { buildJobsQueryString, countActiveFilters } from "@/lib/jobs-url";
import type { JobSearchInput, PostedWithin } from "@/lib/validations/job";

interface JobsFilterSidebarProps {
  initialFilters: JobSearchInput;
  locations: EntityOption[];
  categories: EntityOption[];
  companies: EntityOption[];
  educationOptions: string[];
  visaStatusOptions: string[];
}

type DraftFilters = Pick<
  JobSearchInput,
  | "locationSlugs"
  | "categorySlugs"
  | "companySlugs"
  | "employmentTypes"
  | "experience"
  | "salaryMin"
  | "salaryMax"
  | "education"
  | "visaStatus"
  | "featured"
  | "verified"
  | "postedWithin"
>;

function draftFromFilters(filters: JobSearchInput): DraftFilters {
  return {
    locationSlugs: filters.locationSlugs,
    categorySlugs: filters.categorySlugs,
    companySlugs: filters.companySlugs,
    employmentTypes: filters.employmentTypes,
    experience: filters.experience,
    salaryMin: filters.salaryMin,
    salaryMax: filters.salaryMax,
    education: filters.education,
    visaStatus: filters.visaStatus,
    featured: filters.featured,
    verified: filters.verified,
    postedWithin: filters.postedWithin,
  };
}

const EMPTY_DRAFT: DraftFilters = {
  locationSlugs: [],
  categorySlugs: [],
  companySlugs: [],
  employmentTypes: [],
  experience: undefined,
  salaryMin: undefined,
  salaryMax: undefined,
  education: [],
  visaStatus: [],
  featured: undefined,
  verified: undefined,
  postedWithin: undefined,
};

/**
 * All /jobs filter facets, staged locally and only pushed to the URL when
 * "Apply Filters" is clicked (per spec — unlike the live/debounced search
 * bar, filters are explicit-apply). Shared verbatim between the desktop
 * sticky sidebar and the mobile slide-over drawer.
 */
export function JobsFilterSidebar({
  initialFilters,
  locations,
  categories,
  companies,
  educationOptions,
  visaStatusOptions,
}: JobsFilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [draft, setDraft] = useState<DraftFilters>(draftFromFilters(initialFilters));

  const activeCount = countActiveFilters({ ...initialFilters, ...draft });

  function patch(update: Partial<DraftFilters>) {
    setDraft((prev) => ({ ...prev, ...update }));
  }

  function applyFilters() {
    const qs = buildJobsQueryString({ ...initialFilters, ...draft, page: 1 });
    router.push(`${pathname}${qs}`);
  }

  function clearFilters() {
    setDraft(EMPTY_DRAFT);
    const qs = buildJobsQueryString({ ...initialFilters, ...EMPTY_DRAFT, page: 1 });
    router.push(`${pathname}${qs}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Filters</h2>
        <ResetFilters onReset={clearFilters} activeCount={activeCount} />
      </div>

      <LocationFilter
        options={locations.map((l) => ({ label: l.name, value: l.slug }))}
        selected={draft.locationSlugs}
        onChange={(v) => patch({ locationSlugs: v })}
      />
      <Divider />
      <CategoryFilter
        options={categories.map((c) => ({ label: c.name, value: c.slug }))}
        selected={draft.categorySlugs}
        onChange={(v) => patch({ categorySlugs: v })}
      />
      <Divider />
      <CompanyFilter
        options={companies.map((c) => ({ label: c.name, value: c.slug }))}
        selected={draft.companySlugs}
        onChange={(v) => patch({ companySlugs: v })}
      />
      <Divider />
      <EmploymentTypeFilter
        selected={draft.employmentTypes as EmploymentType[]}
        onChange={(v) => patch({ employmentTypes: v })}
      />
      <Divider />
      <ExperienceFilter value={draft.experience} onChange={(v) => patch({ experience: v })} />
      <Divider />
      <SalaryFilter
        value={[draft.salaryMin ?? 0, draft.salaryMax ?? 50000]}
        onChange={([min, max]) => patch({ salaryMin: min, salaryMax: max })}
      />
      <Divider />
      <EducationFilter
        options={educationOptions}
        selected={draft.education}
        onChange={(v) => patch({ education: v })}
      />
      <Divider />
      <VisaStatusFilter
        options={visaStatusOptions}
        selected={draft.visaStatus}
        onChange={(v) => patch({ visaStatus: v })}
      />
      <Divider />
      <FeaturedVerifiedFilter
        featured={Boolean(draft.featured)}
        verified={Boolean(draft.verified)}
        onFeaturedChange={(v) => patch({ featured: v })}
        onVerifiedChange={(v) => patch({ verified: v })}
      />
      <Divider />
      <PostedWithinFilter
        value={draft.postedWithin as PostedWithin | undefined}
        onChange={(v) => patch({ postedWithin: v })}
      />

      <Button variant="cta" size="lg" className="w-full" onClick={applyFilters}>
        Apply Filters
      </Button>
    </div>
  );
}
