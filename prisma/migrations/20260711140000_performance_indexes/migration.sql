-- Phase 15: Performance Optimization & Core Web Vitals — database-level
-- search/sort indexes. Purely additive; no existing columns/data
-- touched.

-- Composite indexes matching /jobs' "Highest Salary" and "A–Z" sort
-- options combined with the `status = 'PUBLISHED'` filter every public
-- job query applies first (see the matching `@@index` additions on
-- Job in schema.prisma).
CREATE INDEX IF NOT EXISTS "jobs_status_salary_max_idx" ON "jobs" ("status", "salary_max");
CREATE INDEX IF NOT EXISTS "jobs_status_salary_min_idx" ON "jobs" ("status", "salary_min");
CREATE INDEX IF NOT EXISTS "jobs_status_title_idx" ON "jobs" ("status", "title");

-- Trigram indexes accelerate the keyword search's `ILIKE '%term%'`
-- queries (Prisma's `contains`, `mode: "insensitive"`) on `title` and
-- `description` — a plain B-tree index (like the single-column ones
-- above) cannot be used for a substring match with a leading wildcard,
-- so without this, every search request falls back to a full
-- sequential scan of the jobs table. This is the standard Postgres
-- answer to "index a frequently searched free-text column" short of a
-- full dedicated search engine, which this project's scale doesn't
-- warrant.
--
-- Requires the `pg_trgm` extension. Most managed Postgres providers
-- (including Supabase) allow the project's own database role to
-- create it; if a particular hosting environment restricts extension
-- creation, this migration step can be skipped — every other index in
-- this file is independent of it and still applies.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "jobs_title_trgm_idx" ON "jobs" USING gin ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "jobs_description_trgm_idx" ON "jobs" USING gin ("description" gin_trgm_ops);
