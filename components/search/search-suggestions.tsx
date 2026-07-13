import { Search, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

interface SearchSuggestionsProps {
  suggestions: string[];
  /** Shown when the user hasn't typed anything yet (e.g. "Trending searches"). */
  trending?: string[];
  onSelect: (value: string) => void;
  className?: string;
}

/** Dropdown list of matching/trending search terms. Render inside `SearchDropdown`. */
export function SearchSuggestions({ suggestions, trending, onSelect, className }: SearchSuggestionsProps) {
  const showTrending = suggestions.length === 0 && trending && trending.length > 0;
  const items = showTrending ? trending! : suggestions;

  if (items.length === 0) return null;

  return (
    <ul className={cn("flex flex-col py-1.5", className)}>
      {showTrending && (
        <li className="px-4 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Trending searches
        </li>
      )}
      {items.map((item) => (
        <li key={item}>
          <button
            type="button"
            onClick={() => onSelect(item)}
            className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
          >
            {showTrending ? (
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            {item}
          </button>
        </li>
      ))}
    </ul>
  );
}
