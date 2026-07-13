-- Phase 11: Advertisement Manager — additive changes only. Split into
-- two migration files deliberately: Postgres won't let a newly added
-- enum value be *used* (e.g. in an UPDATE) within the same transaction
-- it was added in, and Prisma applies each migration.sql in its own
-- transaction. This file only adds enum values/columns; the backfill
-- that actually uses them lives in the next migration.

-- Rename to match the Phase 11 spec's exact position naming.
ALTER TYPE "advertisement_position" RENAME VALUE 'SIDEBAR' TO 'DESKTOP_SIDEBAR';

-- The 12 new page-specific positions from the spec.
ALTER TYPE "advertisement_position" ADD VALUE 'HOMEPAGE_HERO';
ALTER TYPE "advertisement_position" ADD VALUE 'HOMEPAGE_MIDDLE';
ALTER TYPE "advertisement_position" ADD VALUE 'HOMEPAGE_FOOTER';
ALTER TYPE "advertisement_position" ADD VALUE 'JOBS_LISTING_TOP';
ALTER TYPE "advertisement_position" ADD VALUE 'JOBS_LISTING_MIDDLE';
ALTER TYPE "advertisement_position" ADD VALUE 'JOBS_LISTING_BOTTOM';
ALTER TYPE "advertisement_position" ADD VALUE 'SINGLE_JOB_TOP';
ALTER TYPE "advertisement_position" ADD VALUE 'SINGLE_JOB_MIDDLE';
ALTER TYPE "advertisement_position" ADD VALUE 'SINGLE_JOB_BOTTOM';
ALTER TYPE "advertisement_position" ADD VALUE 'COMPANY_PAGE';
ALTER TYPE "advertisement_position" ADD VALUE 'CATEGORY_PAGE';
ALTER TYPE "advertisement_position" ADD VALUE 'LOCATION_PAGE';

-- New supporting enums.
CREATE TYPE "ad_device" AS ENUM ('DESKTOP', 'MOBILE', 'ALL');
CREATE TYPE "ad_type" AS ENUM ('ADSENSE', 'CUSTOM_HTML', 'IMAGE_BANNER');
CREATE TYPE "ad_status" AS ENUM ('ACTIVE', 'DISABLED');

-- New Advertisement columns. `name` is added nullable here and
-- tightened to NOT NULL in the next migration, once the existing rows
-- (seeded before Phase 11 introduced this field) have a value backfilled.
ALTER TABLE "advertisements" ADD COLUMN "name" TEXT;
ALTER TABLE "advertisements" ADD COLUMN "device" "ad_device" NOT NULL DEFAULT 'ALL';
ALTER TABLE "advertisements" ADD COLUMN "ad_type" "ad_type" NOT NULL DEFAULT 'CUSTOM_HTML';
ALTER TABLE "advertisements" ADD COLUMN "adsense_client" TEXT;
ALTER TABLE "advertisements" ADD COLUMN "adsense_slot" TEXT;
ALTER TABLE "advertisements" ADD COLUMN "image_url" TEXT;
ALTER TABLE "advertisements" ADD COLUMN "target_url" TEXT;
ALTER TABLE "advertisements" ADD COLUMN "width" INTEGER;
ALTER TABLE "advertisements" ADD COLUMN "height" INTEGER;
ALTER TABLE "advertisements" ADD COLUMN "status" "ad_status" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "advertisements" ADD COLUMN "display_order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "advertisements" ADD COLUMN "start_date" TIMESTAMP(3);
ALTER TABLE "advertisements" ADD COLUMN "end_date" TIMESTAMP(3);
ALTER TABLE "advertisements" ADD COLUMN "impressions" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "advertisements" ADD COLUMN "clicks" INTEGER NOT NULL DEFAULT 0;

-- The original free-form ad markup column, renamed and loosened —
-- it's now only required when ad_type = CUSTOM_HTML (Zod-enforced).
ALTER TABLE "advertisements" RENAME COLUMN "ad_code" TO "html_code";
ALTER TABLE "advertisements" ALTER COLUMN "html_code" DROP NOT NULL;
