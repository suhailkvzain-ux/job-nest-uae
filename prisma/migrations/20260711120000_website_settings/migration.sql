-- Phase 13: Website Settings & System Configuration — a single
-- flexible key/value table backing every settings section (General,
-- Contact, Social, SEO, Google Integrations, Email, Behavior,
-- Branding). Purely additive.

CREATE TYPE "setting_type" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON');

CREATE TABLE "settings" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "setting_key" TEXT NOT NULL,
  "setting_value" TEXT,
  "setting_type" "setting_type" NOT NULL DEFAULT 'STRING',
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "settings_setting_key_key" ON "settings" ("setting_key");
