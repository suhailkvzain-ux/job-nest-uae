#!/usr/bin/env bash
set -euo pipefail

# Job Nest UAE — on-demand logical database backup.
#
# Supabase already takes automatic daily backups on every paid plan,
# with Point-in-Time Recovery (PITR) on Pro and above — see the README's
# "Backup & Restore" section for how those work and their limits. This
# script is the supplementary, admin-triggered backup for the two cases
# Supabase's own schedule doesn't cover: an on-demand snapshot right
# before a risky migration/deploy, and an export you actually hold
# yourself rather than trusting entirely to the hosting provider's
# retention window.
#
# Requires `DIRECT_URL` (the non-pooled connection string — pg_dump
# needs a direct connection, not the pgbouncer pooled one `DATABASE_URL`
# points at) and the `pg_dump` client to be installed locally.
#
# Usage: npm run db:backup

if [ -z "${DIRECT_URL:-}" ]; then
  echo "Error: DIRECT_URL is not set. Load your .env first (e.g. 'export \$(grep -v '^#' .env | xargs)') or run this via a tool that does." >&2
  exit 1
fi

mkdir -p backups
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
out="backups/job-nest-uae-${timestamp}.dump"

echo "Backing up database to ${out} ..."
# Custom format (-Fc): compressed, and restorable selectively/in
# parallel with pg_restore — a plain .sql dump can't do either.
pg_dump "$DIRECT_URL" -Fc -f "$out"

echo "Done: ${out}"
echo "Store this somewhere durable outside this machine (encrypted cloud storage, a secrets-aware backup service, ...) — a local-only backup defeats the point."
