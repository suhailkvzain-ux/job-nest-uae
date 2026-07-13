-- Adds a free-text "area" field to jobs (e.g. "Al Quoz", "Al Karama") —
-- a manually-typed sub-area within the job's emirate. Deliberately NOT
-- a foreign key into `locations`: the Locations admin page is now
-- restricted to exactly the 7 emirates, so this column exists purely
-- as extra display detail, with no dedicated management table.
ALTER TABLE "jobs" ADD COLUMN "area" TEXT;
