# Project map (Supabase schema sync)

## Canonical source of truth

- `aligned-schema.sql`

## Often consulted (intent / history)

- `SCHEMA_ALIGNMENT.md`
- `SUPABASE_INTEGRATION_SUMMARY.md`

## Derived / legacy schema artifacts (do not treat as canonical unless user overrides)

- `supabase/migrations/*`
- `scripts/complete-app-schema.sql`
- `supabase-enhanced-schema.sql`
- `complete-schema.sql`

## MCP configuration (Supabase)

- `.mcp.json` (repo root)
- `.vscode/mcp.json` (VS Code MCP config)

## Verification / fallback scripts

- `scripts/comprehensive-schema-verification.js` (uses `DATABASE_URL`)
- `scripts/deploy-tucker-trips-schema.js` (direct deploy via `DATABASE_URL`, plus storage bucket attempt)
- `scripts/verify-schema.js` (basic public table + RLS listing via `DATABASE_URL`)

