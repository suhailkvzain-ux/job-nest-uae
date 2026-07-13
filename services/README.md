# services/

The **data access layer**. Services wrap Prisma (and, where relevant,
Supabase Storage) calls behind small, purpose-built functions — e.g.
`getPublishedJobs()`, `getJobBySlug()`, `getCompanyById()`.

## Why this layer exists

- Keeps `prisma.*` calls out of components, actions, and route handlers.
- Gives the codebase one place to add caching, query composition, or a
  future swap of data source without touching UI code.
- Each file should map to a domain, mirroring `actions/`: `jobs.service.ts`,
  `companies.service.ts`.

No services exist yet — they depend on the Prisma schema, which is out of
scope for this foundation phase.
