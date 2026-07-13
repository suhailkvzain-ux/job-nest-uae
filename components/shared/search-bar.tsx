"use client";

import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Presentational search input for job discovery (title, keyword, company).
 * Left uncontrolled from routing/data concerns — pair it with
 * `useDebounce` + a query param sync in the page that uses it.
 */
export function SearchBar({
  value,
  onChange,
  placeholder = "Search job title, company, or keyword…",
  className,
}: SearchBarProps) {
  return (
    <div
      className={cn(
        "flex h-14 items-center gap-3 rounded-full border border-border/60 bg-card px-5 shadow-soft",
        "transition-shadow focus-within:shadow-soft-lg focus-within:ring-2 focus-within:ring-ring",
        className,
      )}
    >
      <Search className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        aria-label="Search jobs"
      />
    </div>
  );
}
