-- Phase 11 part 2: backfill data using the enum values/columns added
-- in the previous migration, then tighten constraints. Kept as a
-- separate file/transaction so the enum values added moments ago are
-- safe to reference here (see the previous migration's header comment).

-- Give every pre-Phase-11 row a readable name derived from its
-- position, since `name` didn't exist before this phase.
UPDATE "advertisements" SET "name" = INITCAP(REPLACE("position"::text, '_', ' ')) WHERE "name" IS NULL;
ALTER TABLE "advertisements" ALTER COLUMN "name" SET NOT NULL;

-- Carry the old boolean `enabled` flag into the new `status` enum,
-- then retire it — `status` is now the single source of truth for
-- whether an ad is eligible to render.
UPDATE "advertisements" SET "status" = 'DISABLED' WHERE "enabled" = false;
ALTER TABLE "advertisements" DROP COLUMN "enabled";
