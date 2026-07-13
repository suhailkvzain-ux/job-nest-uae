-- ─────────────────────────────────────────────────────────────
-- Job Nest UAE — Initial schema migration
-- Hand-authored to exactly match prisma/schema.prisma, following
-- Prisma Migrate's standard generated-migration format (CreateTable,
-- then CreateIndex, then AddForeignKey). This project's sandbox has no
-- network access to Prisma's engine-binary CDN, so `prisma migrate dev`
-- could not run this migration through the CLI directly — the DDL below
-- was instead validated by executing it against a real Postgres-compatible
-- engine (pg-mem) to confirm every statement is syntactically and
-- referentially correct. Once DATABASE_URL/DIRECT_URL point at a real
-- Supabase project, `prisma migrate deploy` will apply this file as-is.
-- ─────────────────────────────────────────────────────────────

-- Required for gen_random_uuid() used as the default for every primary key.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enums ──────────────────────────────────────────────────
CREATE TYPE "employment_type" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERNSHIP', 'REMOTE', 'HYBRID', 'FREELANCE');

CREATE TYPE "job_status" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED');

CREATE TYPE "advertisement_position" AS ENUM ('TOP_BANNER', 'MIDDLE_BANNER', 'BOTTOM_BANNER', 'SIDEBAR', 'MOBILE_BANNER');

-- ─── CreateTable: admins ────────────────────────────────────
CREATE TABLE "admins" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- ─── CreateTable: companies ─────────────────────────────────
CREATE TABLE "companies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- ─── CreateTable: categories ────────────────────────────────
CREATE TABLE "categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- ─── CreateTable: locations ─────────────────────────────────
CREATE TABLE "locations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- ─── CreateTable: jobs ──────────────────────────────────────
CREATE TABLE "jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "company_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "responsibilities" TEXT,
    "requirements" TEXT,
    "benefits" TEXT,
    "employment_type" "employment_type" NOT NULL,
    "experience" TEXT,
    "salary_min" INTEGER,
    "salary_max" INTEGER,
    "salary_currency" TEXT NOT NULL DEFAULT 'AED',
    "education" TEXT,
    "visa_status" TEXT,
    "nationality" TEXT,
    "languages" TEXT[],
    "vacancies" INTEGER NOT NULL DEFAULT 1,
    "official_website" TEXT,
    "official_email" TEXT,
    "application_deadline" TIMESTAMP(3),
    "status" "job_status" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- ─── CreateTable: advertisements ────────────────────────────
CREATE TABLE "advertisements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "position" "advertisement_position" NOT NULL,
    "ad_code" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advertisements_pkey" PRIMARY KEY ("id")
);

-- ─── CreateTable: analytics ─────────────────────────────────
CREATE TABLE "analytics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_id" UUID NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "website_clicks" INTEGER NOT NULL DEFAULT 0,
    "email_clicks" INTEGER NOT NULL DEFAULT 0,
    "share_clicks" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- ─── Unique indexes ─────────────────────────────────────────
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE UNIQUE INDEX "locations_slug_key" ON "locations"("slug");
CREATE UNIQUE INDEX "jobs_slug_key" ON "jobs"("slug");
CREATE UNIQUE INDEX "analytics_job_id_key" ON "analytics"("job_id");

-- ─── Secondary indexes ──────────────────────────────────────
CREATE INDEX "companies_name_idx" ON "companies"("name");
CREATE INDEX "categories_name_idx" ON "categories"("name");
CREATE INDEX "locations_name_idx" ON "locations"("name");

CREATE INDEX "jobs_status_idx" ON "jobs"("status");
CREATE INDEX "jobs_published_at_idx" ON "jobs"("published_at");
CREATE INDEX "jobs_location_id_idx" ON "jobs"("location_id");
CREATE INDEX "jobs_category_id_idx" ON "jobs"("category_id");
CREATE INDEX "jobs_company_id_idx" ON "jobs"("company_id");
CREATE INDEX "jobs_featured_idx" ON "jobs"("featured");
CREATE INDEX "jobs_verified_idx" ON "jobs"("verified");
CREATE INDEX "jobs_status_published_at_idx" ON "jobs"("status", "published_at");
CREATE INDEX "jobs_status_featured_idx" ON "jobs"("status", "featured");
CREATE INDEX "jobs_status_deleted_at_idx" ON "jobs"("status", "deleted_at");

CREATE INDEX "advertisements_position_idx" ON "advertisements"("position");
CREATE INDEX "advertisements_enabled_idx" ON "advertisements"("enabled");

-- ─── Foreign keys ───────────────────────────────────────────
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
