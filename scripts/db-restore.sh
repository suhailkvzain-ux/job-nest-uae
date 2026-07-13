#!/usr/bin/env bash
set -euo pipefail

# Job Nest UAE — restores a backup created by `npm run db:backup`
# (or any custom-format pg_dump of this schema) into the database
# `DIRECT_URL` points at.
#
# DESTRUCTIVE: this restores INTO the target database, which can
# overwrite/duplicate existing data depending on flags. Only ever run
# this against a database you intend to overwrite (a fresh/empty
# database, or one you've deliberately decided to roll back) — never
# run it against production without first taking a fresh backup of
# *that*, in case the restore itself needs undoing.
#
# Usage: npm run db:restore -- backups/job-nest-uae-20260101T000000Z.dump

if [ -z "${DIRECT_URL:-}" ]; then
  echo "Error: DIRECT_URL is not set." >&2
  exit 1
fi

file="${1:-}"
if [ -z "$file" ] || [ ! -f "$file" ]; then
  echo "Usage: npm run db:restore -- <path-to-backup.dump>" >&2
  exit 1
fi

echo "About to restore '${file}' into the database at DIRECT_URL."
read -r -p "Type 'yes' to continue: " confirm
if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 1
fi

# --clean drops existing objects before recreating them (so the restore
# matches the dump exactly rather than merging with whatever's already
# there); --if-exists avoids errors on a target that's already empty.
pg_restore --clean --if-exists --no-owner --no-privileges -d "$DIRECT_URL" "$file"

echo "Restore complete. Run 'npm run prisma:generate' if the schema changed, and spot-check the app before considering this done."
