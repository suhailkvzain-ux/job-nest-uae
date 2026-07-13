-- Phase 12: Analytics Dashboard — new event log + activity timeline
-- tables. Purely additive (no existing columns/tables touched), so
-- this is a single migration file/transaction, unlike Phase 11's
-- enum-then-backfill split.

CREATE TYPE "analytics_event_type" AS ENUM (
  'PAGE_VIEW',
  'JOB_VIEW',
  'WEBSITE_CLICK',
  'EMAIL_CLICK',
  'SHARE_CLICK',
  'SEARCH_QUERY'
);

CREATE TYPE "device_type" AS ENUM ('DESKTOP', 'MOBILE', 'UNKNOWN');

CREATE TYPE "activity_action" AS ENUM (
  'JOB_PUBLISHED',
  'JOB_UPDATED',
  'JOB_ARCHIVED',
  'JOB_DELETED',
  'ADVERTISEMENT_UPDATED'
);

CREATE TABLE "analytics_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "type" "analytics_event_type" NOT NULL,
  "job_id" UUID,
  "path" TEXT,
  "search_query" TEXT,
  "device_type" "device_type" NOT NULL DEFAULT 'UNKNOWN',
  "referrer" TEXT,
  "visitor_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- No foreign key to "jobs" on `job_id` — deliberate, see the model's
-- doc comment in schema.prisma: event history must outlive the job it
-- was recorded against.
CREATE INDEX "analytics_events_type_created_at_idx" ON "analytics_events" ("type", "created_at");
CREATE INDEX "analytics_events_job_id_idx" ON "analytics_events" ("job_id");
CREATE INDEX "analytics_events_visitor_id_idx" ON "analytics_events" ("visitor_id");
CREATE INDEX "analytics_events_created_at_idx" ON "analytics_events" ("created_at");

CREATE TABLE "activity_log" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "action" "activity_action" NOT NULL,
  "entity_label" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "activity_log_created_at_idx" ON "activity_log" ("created_at");
