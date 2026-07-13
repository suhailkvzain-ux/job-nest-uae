"use client";

import { useState } from "react";

import { SearchInput } from "@/components/search/search-input";
import { SearchSuggestions } from "@/components/search/search-suggestions";
import { cn } from "@/lib/utils";

interface SearchDropdownProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  trending?: string[];
  onSelect: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * `SearchInput` + a floating suggestions panel, opened on focus and
 * closed on blur (with a short delay so suggestion clicks register
 * before the panel unmounts). React's onFocus/onBlur bubble like
 * focusin/focusout, so wrapping input + panel together lets a single
 * pair of handlers track "is focus anywhere in this group".
 */
export function SearchDropdown({
  value,
  onChange,
  suggestions,
  trending,
  onSelect,
  placeholder,
  className,
}: SearchDropdownProps) {
  const [open, setOpen] = useState(false);
  const showPanel = open && (suggestions.length > 0 || (trending && trending.length > 0));

  return (
    <div
      className={cn("relative", className)}
      onFocus={() => setOpen(true)}
      onBlur={() => setTimeout(() => setOpen(false), 150)}
    >
      <SearchInput value={value} onChange={onChange} placeholder={placeholder} />
      {showPanel && (
        <div className="glass absolute left-0 right-0 top-[calc(100%+0.5rem)] z-dropdown rounded-2xl shadow-soft-lg">
          <SearchSuggestions
            suggestions={suggestions}
            trending={trending}
            onSelect={(v) => {
              onSelect(v);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
