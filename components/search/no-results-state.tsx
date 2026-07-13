import { SearchX } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

/** Specialized `EmptyState` for zero search/filter results. */
export function NoResultsState({ query, onClear }: { query?: string; onClear?: () => void }) {
  return (
    <EmptyState
      icon={SearchX}
      title={query ? `No results for "${query}"` : "No jobs match your filters"}
      description="Try a different keyword, or clear some filters to see more listings."
      action={
        onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-medium text-primary hover:underline"
          >
            Clear all filters
          </button>
        )
      }
    />
  );
}
