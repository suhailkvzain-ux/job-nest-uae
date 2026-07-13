import { useEffect, useState } from "react";

/**
 * Debounces a fast-changing value (e.g. a search input) so expensive work
 * — filtering thousands of jobs, hitting an API — only runs after the user
 * pauses typing.
 *
 * const debouncedQuery = useDebounce(query, 300);
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
