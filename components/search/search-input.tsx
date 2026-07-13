"use client";

import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

/**
 * Bare search text field (no button/dropdown chrome) — the building
 * block `SearchBar`/`AdvancedSearch` compose. Includes a clear (×) button
 * once there's a value.
 */
export function SearchInput({ value, onChange, placeholder = "Search…", className, autoFocus }: SearchInputProps) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="h-11 w-full rounded-full border border-border/60 bg-card pl-11 pr-9 text-sm shadow-sm outline-none transition-shadow focus:shadow-soft focus:ring-2 focus:ring-ring"
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
