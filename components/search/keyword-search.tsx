"use client";

import { SearchInput } from "@/components/search/search-input";

/** Free-text keyword search — title/company/description. */
export function KeywordSearch({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <SearchInput
      value={value}
      onChange={onChange}
      placeholder="Job title, company, or keyword…"
      className={className}
    />
  );
}
