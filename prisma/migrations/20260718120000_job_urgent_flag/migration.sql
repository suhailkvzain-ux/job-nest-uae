-- Admin Jobs Management: adds "Urgent Hiring" as its own independent
-- flag alongside featured/verified, matching the admin spec's
-- Featured/Urgent/Premium toggle set. Nullable-free with a default so
-- every existing row stays valid with no backfill required, and an
-- index since the admin table/filters and the public urgent badge both
-- filter on it directly (same pattern as the existing featured/verified
-- indexes above).
ALTER TABLE "jobs" ADD COLUMN "urgent" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "jobs_urgent_idx" ON "jobs"("urgent");
