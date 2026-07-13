/**
 * Shared, framework-level TypeScript types.
 *
 * Domain types (Job, Company, Category, ...) will be added once the
 * Prisma schema is designed in the next phase — at that point, prefer
 * generating/deriving types from `@prisma/client` rather than hand-rolling
 * duplicates here. This file stays focused on generic, reusable shapes.
 */

/** Standard shape for any paginated list response. */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Common pagination + sorting query params shared across list views. */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: "asc" | "desc";
}

/** Generic wrapper for server action / API responses. */
export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

/** Narrow helper for components that render one of several UI states. */
export type AsyncState = "idle" | "loading" | "success" | "empty" | "error";
