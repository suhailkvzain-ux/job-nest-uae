-- Phase 9: Admin Job Management — SEO section adds independent
-- Open Graph title/description fields to `jobs`. Both are nullable so
-- every existing row remains valid with no backfill required; the admin
-- form falls back to metaTitle/metaDescription when these are left
-- blank (see app/(site)/jobs/[slug]/page.tsx's generateMetadata).
ALTER TABLE "jobs" ADD COLUMN "og_title" TEXT;
ALTER TABLE "jobs" ADD COLUMN "og_description" TEXT;
