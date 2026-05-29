---
name: supabase-schema-sync-mcp
description: Keep a Supabase database schema and this codebase in sync via the Supabase MCP server. Use when investigating schema drift, generating Supabase migrations, updating RLS policies, verifying RPCs/functions/triggers, or aligning TypeScript DB types (e.g. types/database.ts) to the canonical schema in aligned-schema.sql.
---

# Supabase Schema Sync Engineer (MCP)

Maintain a single source of truth for the database schema and keep the Supabase project and repo aligned.

## Canonical source of truth

- Treat `aligned-schema.sql` as the canonical schema specification.
- Use `SCHEMA_ALIGNMENT.md` only to understand intent and historical decisions (do not treat it as executable truth).
- Treat these as derived/legacy unless the user explicitly overrides:
  - `supabase/migrations/*`
  - `scripts/complete-app-schema.sql`
  - `supabase-enhanced-schema.sql`
  - `complete-schema.sql`

## Safety and environment rules

- Confirm the target environment (prod vs branch vs local) before applying anything.
- Use the MCP server named `supabase` (configured in `.mcp.json` and/or `.vscode/mcp.json`).
- Never ask the user to paste secrets into chat; never print or commit tokens/keys.
- Do not modify `.env.local`, `.mcp.json`, or `.vscode/mcp.json` unless explicitly requested.

## Workflow (hybrid mode: propose → confirm → apply)

### 1) Confirm target and access

- Identify which Supabase project/branch is being targeted.
- Confirm MCP server name is `supabase`.
- If MCP access is unavailable, fall back to `DATABASE_URL` checks:
  - `node scripts/comprehensive-schema-verification.js`
  - `node scripts/check-app-database.js`

### 2) Load the canonical schema

- Read `aligned-schema.sql`.
- If a discrepancy looks intentional, consult `SCHEMA_ALIGNMENT.md` to confirm the decision.

### 3) Fetch actual DB state (prefer MCP)

Use MCP “database” capabilities to extract:
- Tables, columns, types, nullability, defaults
- Constraints (PK/FK/check/unique)
- Indexes
- RLS enablement + policies (pg_policies)
- Functions/RPCs (pg_proc), triggers (pg_trigger), views (information_schema.views)

If MCP cannot provide a specific view of state, use SQL against Postgres system catalogs via MCP (preferred) or via `DATABASE_URL` (fallback).

### 4) Diff and decide (canonical wins)

- Treat `aligned-schema.sql` as truth. Drift is defined as “DB != aligned-schema.sql”.
- Prefer additive/backward-compatible changes:
  - Add columns with defaults
  - Add/expand allowed values in constraints
  - Add indexes
  - Add views/RPCs/triggers
  - Rename columns only with compatibility in mind (consider generated columns or sync triggers)
- Avoid destructive changes (dropping columns/tables, narrowing types) unless user explicitly asks.

### 5) Propose a minimal migration (repo-tracked)

- Create a new file under `supabase/migrations/` named:
  - `<UTC_TIMESTAMP>_<slug>.sql`
  - Timestamp format: `YYYYMMDDHHMMSS`
- The migration must be minimal and idempotent where possible:
  - Use `CREATE ... IF NOT EXISTS`
  - Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
  - Use `DO $$ ... $$;` guards for renames or constraint surgery
- For RLS drift, explicitly drop and recreate policies to match canonical intent (avoid silent drift).
- Include a short header comment in the migration describing what it aligns to (e.g. “Align with aligned-schema.sql”).

### 6) Propose code/type updates (repo-tracked)

- Update TypeScript schema types to match the canonical schema:
  - Primary target: `types/database.ts`
- When the app uses field aliases (e.g., `trip_name` vs `title`, `status` vs `trip_type`), align types to the canonical names and document any compatibility notes in the drift report.
- Identify and list code paths that likely need mapping changes (do not guess silently).

### 7) Apply changes (only after explicit confirmation)

- Do not apply DB changes until the user explicitly says to apply.
- Apply the migration via MCP SQL execution (preferred).
- If MCP apply is not possible, provide a fallback apply path (Supabase SQL editor / psql), and clearly state what was applied.

### 8) Verify

- Re-fetch DB state and confirm it matches `aligned-schema.sql`.
- If `DATABASE_URL` is available, run:
  - `node scripts/comprehensive-schema-verification.js`
- Spot-check key behaviors:
  - RLS enabled and policies exist for core tables
  - Expected RPCs/views exist if canonical schema requires them

## Required outputs (every time)

1) Drift report
   - What differs (DB vs `aligned-schema.sql`) grouped by: tables/columns, constraints, indexes, RLS/policies, functions/RPCs/triggers/views
   - Why it matters (runtime breakage risk, security risk, type mismatch risk)
2) Proposed migration
   - The exact `supabase/migrations/<timestamp>_<slug>.sql` path and full SQL contents
3) Proposed code/type updates
   - A bullet list of repo file paths to change (at minimum `types/database.ts` when relevant)
4) Verification checklist + results
   - What was checked and whether it passed (pre-apply and post-apply when applicable)
