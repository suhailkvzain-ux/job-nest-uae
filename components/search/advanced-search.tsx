"use client";

import { useState } from "react";

import type { EntityOption } from "@/components/search/entity-search";
import { KeywordSearch } from "@/components/search/keyword-search";
import { SearchButton } from "@/components/search/search-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EXPERIENCE_RANGES = ["0-1 years", "1-3 years", "3-5 years", "5-8 years", "8+ years"];

export interface AdvancedSearchValue {
  query: string;
  locationSlug?: string;
  categorySlug?: string;
  experience?: string;
}

interface AdvancedSearchProps {
  locations: EntityOption[];
  categories: EntityOption[];
  onSubmit: (value: AdvancedSearchValue) => void;
  className?: string;
}

/**
 * The homepage hero search — keyword + location + category in one bar,
 * collapsing to a stacked layout on mobile. This is the primary entry
 * point into `searchJobs()`.
 */
export function AdvancedSearch({ locations, categories, onSubmit, className }: AdvancedSearchProps) {
  const [query, setQuery] = useState("");
  const [locationSlug, setLocationSlug] = useState<string>();
  const [categorySlug, setCategorySlug] = useState<string>();
  const [experience, setExperience] = useState<string>();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ query, locationSlug, categorySlug, experience });
      }}
      className={className}
    >
      <div className="glass flex flex-col gap-3 rounded-2xl p-3 shadow-soft-lg md:flex-row md:items-center md:rounded-full md:p-2">
        <KeywordSearch value={query} onChange={setQuery} className="flex-1" />

        <Select value={locationSlug} onValueChange={setLocationSlug}>
          <SelectTrigger className="md:w-36 md:border-0 md:shadow-none">
            <SelectValue placeholder="Any location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location.slug} value={location.slug}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categorySlug} onValueChange={setCategorySlug}>
          <SelectTrigger className="md:w-36 md:border-0 md:shadow-none">
            <SelectValue placeholder="Any category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.slug} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={experience} onValueChange={setExperience}>
          <SelectTrigger className="md:w-40 md:border-0 md:shadow-none">
            <SelectValue placeholder="Any Experience" />
          </SelectTrigger>
          <SelectContent>
            {EXPERIENCE_RANGES.map((range) => (
              <SelectItem key={range} value={range}>
                {range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <SearchButton className="md:rounded-full" />
      </div>
    </form>
  );
}
