-- Categories Management (admin spec): extend the previously minimal
-- Category model (name/slug/description only) with the fields the
-- admin Categories module needs — icon, explicit ordering, active
-- status, featured/popular/homepage-visibility flags, and SEO fields.
-- All nullable or defaulted so every existing category row stays valid
-- with no backfill required.
ALTER TABLE "categories" ADD COLUMN "icon" TEXT;
ALTER TABLE "categories" ADD COLUMN "display_order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "categories" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "categories" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "categories" ADD COLUMN "popular" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "categories" ADD COLUMN "show_on_homepage" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "categories" ADD COLUMN "seo_title" TEXT;
ALTER TABLE "categories" ADD COLUMN "seo_description" TEXT;
ALTER TABLE "categories" ADD COLUMN "seo_keywords" TEXT;
ALTER TABLE "categories" ADD COLUMN "og_image" TEXT;

CREATE INDEX "categories_display_order_idx" ON "categories"("display_order");
CREATE INDEX "categories_is_active_idx" ON "categories"("is_active");
