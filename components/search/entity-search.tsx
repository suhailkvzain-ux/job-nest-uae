"use client";

import { useMemo, useState } from "react";

import { SearchDropdown } from "@/components/search/search-dropdown";

export interface EntityOption {
  name: string;
  slug: string;
}

interface EntitySearchProps {
  options: EntityOption[];
  onSelect: (option: EntityOption) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Shared implementation behind `LocationSearch`, `CategorySearch`, and
 * `CompanySearch` — a text field that filters a known option list
 * client-side and shows matches in a dropdown. Given the platform's
 * scale (dozens of locations/categories, hundreds of companies — not
 * millions), client-side filtering avoids a network round-trip per
 * keystroke.
 */
export function EntitySearch({ options, onSelect, placeholder, className }: EntitySearchProps) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return options.filter((o) => o.name.toLowerCase().includes(q)).slice(0, 8);
  }, [options, query]);

  return (
    <SearchDropdown
      value={query}
      onChange={setQuery}
      suggestions={matches.map((m) => m.name)}
      placeholder={placeholder}
      className={className}
      onSelect={(name) => {
        const option = options.find((o) => o.name === name);
        setQuery(name);
        if (option) onSelect(option);
      }}
    />
  );
}
