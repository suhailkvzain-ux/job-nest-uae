# actions/

Next.js **Server Actions** live here — the mutation/write layer for the
future admin dashboard (create/update/expire a job listing, etc.).

## Convention (to follow once the data model exists)

- One file per domain: `jobs.actions.ts`, `companies.actions.ts`.
- Each action:
  1. Validates input with a Zod schema (colocated or imported from a
     `schemas/` module next to the domain).
  2. Calls into `services/` for the actual data access — actions stay thin
     and focus on auth checks, validation, and cache revalidation.
  3. Returns an `ActionResult<T>` (see `types/index.ts`) so client code has
     a consistent success/error shape to branch on.
  4. Calls `revalidatePath` / `revalidateTag` as needed.

No actions exist yet — this phase intentionally excludes the database
schema and admin panel. This file documents the pattern so the next phase
drops in cleanly.


## Existing actions

- `jobs.actions.ts` — `loadMoreLatestJobsAction(page)`, backing the
  homepage Latest Jobs "Load More" button. Thin wrapper over
  `services/jobs.service.ts`'s `getLatestJobs()`.
