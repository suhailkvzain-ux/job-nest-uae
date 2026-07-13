"use client";

import type { EmploymentType } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { EmploymentTypeFilter } from "@/components/filters/employment-type-filter";
import { ExperienceFilter } from "@/components/filters/experience-filter";
import { FeaturedVerifiedFilter } from "@/components/filters/featured-verified-filter";
import { PostedWithinFilter } from "@/components/filters/posted-within-filter";
import { ResetFilters } from "@/components/filters/reset-filters";
import { SalaryFilter } from "@/components/filters/salary-filter";
import { Divider } from "@/components/layout/divider";
import { Button } from "@/components/ui/button";
import { buildJobsQueryString, countActiveFilters } from "@/lib/jobs-url";
import type { JobSearchInput, PostedWithin } from "@/lib/validations/job";

type DraftFilters = Pick<
  JobSearchInput,
  "employmentTypes" | "experience" | "salaryMin" | "salaryMax" | "featured" | "verified" | "postedWithin"
>;

function draftFromFilters(filters: JobSearchInput): DraftFilters {
  return {
    employmentTypes: filters.employmentTypes,
    experience: filters.experience,
    salaryMin: filters.salaryMin,
    salaryMax: filters.salaryMax,
    featured: filters.featured,
    verified: filters.verified,
    postedWithin: filters.postedWithin,
  };
}

const EMPTY_DRAFT: DraftFilters = {
  employmentTypes: [],
  experience: undefined,
  salaryMin: undefined,
  salaryMax: undefined,
  featured: undefined,
  verified: undefined,
  postedWithin: undefined,
};

/**
 * Trimmed filter sidebar for the category/location/company detail pages
 * — only the six facets the Phase 7 spec calls for (Employment Type,
 * Experience, Salary Range, Featured, Verified, Posted Within).
 * Deliberately excludes Location/Category/Company pickers, unlike the
 * full `/jobs` `JobsFilterSidebar` — that facet is already fixed by the
 * page's own route, and re-exposing it here would be both redundant and
 * misleading (this page always stays scoped to the current entity, no
 * matter what's selected). `initialFilters` should be the *URL-parsed*
 * filters with the locked facet stripped out, so Apply/Clear never
 * writes a spurious `?category=`/`?location=`/`?company=` back into the
 * URL — the caller re-adds the locked facet server-side before querying.
 */
export function EntityJobsFilterSidebar({ initialFilters }: { initialFilters: JobSearchInput }) {
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
