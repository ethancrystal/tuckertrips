#!/usr/bin/env bash
# Tucker Trips — full physical backup via pg_dump (gold standard, restorable).
#
# Produces a complete compressed dump (schema + ALL data, incl. auth & storage
# metadata) that can be restored with pg_restore. Run from a machine with
# direct database access (Supabase's direct connection is IPv6; if you only
# have IPv4, use the Session pooler connection string from the dashboard).
#
# Requires: pg_dump (PostgreSQL client 15+), and DATABASE_URL set to the
# Supabase connection string (Dashboard -> Project Settings -> Database).
#
#   export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.<ref>.supabase.co:5432/postgres"
#   bash scripts/backup-supabase-full.sh
set -euo pipefail

: "${DATABASE_URL:?Set DATABASE_URL to your Supabase connection string}"
DIR="$(cd "$(dirname "$0")/.." && pwd)/backups"
mkdir -p "$DIR"
STAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
OUT="$DIR/tuckertrips-full-${STAMP}.dump"

echo "Dumping to $OUT ..."
pg_dump "$DATABASE_URL" \
  --format=custom \
  --no-owner --no-privileges \
  --schema=public --schema=auth --schema=storage \
  --file="$OUT"

echo "Done: $OUT"
echo "Restore with: pg_restore --no-owner --no-privileges -d \"\$TARGET_DATABASE_URL\" \"$OUT\""
