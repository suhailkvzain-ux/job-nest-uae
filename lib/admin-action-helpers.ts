import type { ZodError } from "zod";

import { requireAdmin } from "@/lib/admin-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Shared guard for every admin mutation Server Action (Jobs, Companies,
 * Categories, Locations, Advertisements, Settings, ...): checks the
 * request's origin (CSRF defense-in-depth, see `lib/csrf.ts`),
 * re-validates the admin session (same rule `middleware.ts` and the
 * protected layout already enforce, checked again here since Server
 * Actions can be invoked directly and don't pass through a page-level
 * layout render), then rate-limits by caller IP, keyed per action name
 * so e.g. bulk-archiving jobs doesn't share a budget with deleting
 * companies.
 */
export async function assertAdminAndRateLimit(action: string, limit = 30): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();

  const ip = await getClientIp();
  const result = rateLimit(`admin:${action}:${ip}`, limit, 60_000);

  if (!result.allowed) {
    throw new Error(`Too many requests — try again in ${Math.ceil(result.retryAfterMs / 1000)}s`);
  }
}

/** Flattens a Zod validation error into a flat `{ field: message }` map — the shape every admin form's `setError` loop expects. */
export function flattenZodErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (path && !out[path]) out[path] = issue.message;
  }
  return out;
}
