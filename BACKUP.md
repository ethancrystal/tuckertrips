# Tucker Trips — Data Backup Guide

Two backup methods are provided. Use **both** for safety: pg_dump for full
restorable snapshots, and the JSON exporter for a quick, schedulable,
human-readable copy of all rows.

| Method | Tool | What it captures | Restorable? | Best for |
|---|---|---|---|---|
| **Full** | `scripts/backup-supabase-full.sh` (pg_dump) | Schema + all data across `public`, `auth`, `storage` (incl. password hashes) | Yes (`pg_restore`) | Disaster recovery / project migration |
| **Logical** | `scripts/backup-supabase.mjs` (JSON) | All table rows + auth user identities (no password hashes, no file binaries) | Import row-by-row | Scheduled snapshots, inspection, transfer |

Backups are written to `backups/` and are **gitignored** (they contain real
user emails and personal notes — keep them out of git history). Move them to
secure storage (encrypted drive, private bucket) for long-term retention.

---

## 1. Logical JSON backup (recommended for routine/cron)

```bash
# one-time
cp .env.example .env.local        # ensure NEXT_PUBLIC_SUPABASE_URL + a secret key are set
corepack enable && pnpm install

# run a backup
pnpm backup                       # -> backups/tuckertrips-data-<timestamp>.json + backups/latest.json
```

Required env (in `.env.local` or shell):
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SECRET_KEY` — the **new-format** secret key (`sb_secret_...`).
  > ⚠️ The project's legacy `anon`/`service_role` JWT keys were **disabled on
  > 2026-04-29**. The script falls back to `SUPABASE_SERVICE_ROLE_KEY` only if
  > you re-enable legacy keys; otherwise use the new secret key.

### Schedule it (cron, every day at 02:00)

```cron
0 2 * * *  cd /path/to/tuckertrips && /usr/bin/node scripts/backup-supabase.mjs >> backups/backup.log 2>&1
```

---

## 2. Full pg_dump backup (gold standard)

```bash
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.rogrzxjxtypzsempesrf.supabase.co:5432/postgres"
bash scripts/backup-supabase-full.sh    # -> backups/tuckertrips-full-<timestamp>.dump
```

Restore into any Postgres/Supabase project:

```bash
pg_restore --no-owner --no-privileges -d "$TARGET_DATABASE_URL" backups/tuckertrips-full-<timestamp>.dump
```

> The direct `db.<ref>.supabase.co` host is IPv6-only. On an IPv4-only network,
> use the **Session pooler** connection string from the Supabase dashboard
> (Project Settings → Database → Connection string → Session pooler).

---

## Exact routine prompt (paste into Claude Code)

Use this whenever you want an on-demand backup committed/sent to you:

```
Run the Tucker Trips data backup: execute `node scripts/backup-supabase.mjs`
(ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are set). Confirm the
row counts in the output look sane versus the live database, then send me the
generated backups/latest.json file. Do NOT commit the backup data to git.
```

To make it fully automatic on an interval, you can also use the `/loop` skill, e.g.:

```
/loop 24h Run node scripts/backup-supabase.mjs and tell me the row counts; alert me if any table is empty that wasn't before.
```
