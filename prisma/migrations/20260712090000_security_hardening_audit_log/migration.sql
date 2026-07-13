-- Phase 16: Enterprise Security Hardening — audit logging additions.

-- Extend the activity_action enum with the admin actions the audit
-- logging spec explicitly requires (Login, Logout, Job Created,
-- Settings Changed) that weren't captured before this phase. Each
-- ALTER TYPE ... ADD VALUE is its own statement (Postgres requirement:
-- a newly added enum value cannot be used in the same transaction/
-- statement batch it was added in).
ALTER TYPE "activity_action" ADD VALUE IF NOT EXISTS 'JOB_CREATED';
ALTER TYPE "activity_action" ADD VALUE IF NOT EXISTS 'ADMIN_LOGIN';
ALTER TYPE "activity_action" ADD VALUE IF NOT EXISTS 'ADMIN_LOGOUT';
ALTER TYPE "activity_action" ADD VALUE IF NOT EXISTS 'SETTINGS_UPDATED';

-- Record *who* performed a logged action, not just what happened —
-- "administrator identity" per the audit logging spec. Nullable so
-- existing rows (written before this column existed) still read back
-- cleanly.
ALTER TABLE "activity_log" ADD COLUMN IF NOT EXISTS "admin_email" TEXT;
