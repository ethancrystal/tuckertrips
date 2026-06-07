#!/usr/bin/env node
/**
 * Tucker Trips — Supabase data backup
 * -----------------------------------
 * Exports all application tables (+ auth user identities) to a timestamped
 * JSON file under backups/. Safe to run on a schedule (cron / GitHub Action).
 *
 * Usage:
 *   node scripts/backup-supabase.mjs
 *   pnpm backup            (see package.json script)
 *
 * Required env (put them in .env.local or your shell):
 *   NEXT_PUBLIC_SUPABASE_URL   - project URL (https://<ref>.supabase.co)
 *   SUPABASE_SECRET_KEY        - new-format secret key (sb_secret_...)   [preferred]
 *      or SUPABASE_SERVICE_ROLE_KEY - legacy service_role JWT (only if legacy keys are ENABLED)
 *
 * NOTE: This is a *logical data* backup (rows as JSON). It does NOT include
 * auth password hashes or storage file binaries. For a full, restorable
 * physical backup use pg_dump (see BACKUP.md) from a machine with direct
 * (IPv4) database access.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

// Best-effort load of .env.local without adding a dependency.
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
} catch { /* ignore */ }

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or a secret/service key. See header for env requirements.');
  process.exit(1);
}

// Tables to export (public schema). Add new tables here as the schema grows.
const TABLES = [
  'profiles',
  'trips',
  'trip_categories',
  'trip_shares',
  'pending_shares',
  'friendships',
  'messages',
  'signup_clicks',
  'admin_counters',
  'admin_invitations',
  'admin_credentials',
  'admin_verification_codes',
];

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

async function dumpTable(name) {
  const rows = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase.from(name).select('*').range(from, from + pageSize - 1);
    if (error) throw new Error(`${name}: ${error.message}`);
    rows.push(...data);
    if (data.length < pageSize) break;
  }
  return rows;
}

async function dumpAuthUsers() {
  const users = [];
  let page = 1;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`auth.users: ${error.message}`);
    users.push(...data.users.map((u) => ({
      id: u.id, email: u.email, created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at, email_confirmed_at: u.email_confirmed_at,
      role: u.role, user_metadata: u.user_metadata, app_metadata: u.app_metadata,
    })));
    if (data.users.length < 1000) break;
    page += 1;
  }
  return users;
}

(async () => {
  const tables = {};
  const counts = {};
  for (const t of TABLES) {
    try {
      const rows = await dumpTable(t);
      tables[t] = rows;
      counts[t] = rows.length;
    } catch (e) {
      console.warn(`! skipped ${t}: ${e.message}`);
      tables[t] = [];
      counts[t] = `ERROR: ${e.message}`;
    }
  }
  try {
    const users = await dumpAuthUsers();
    tables.auth_users = users;
    counts.auth_users = users.length;
  } catch (e) {
    console.warn(`! auth users: ${e.message}`);
  }

  const ref = (() => { try { return new URL(URL).hostname.split('.')[0]; } catch { return 'unknown'; } })();
  const backup = {
    _meta: {
      project_ref: ref,
      project_url: URL,
      generated_at: new Date().toISOString(),
      generated_by: 'scripts/backup-supabase.mjs',
      note: 'Logical data backup (rows as JSON). No password hashes or storage binaries. Use pg_dump for a full physical backup.',
      row_counts: counts,
    },
    tables,
  };

  const dir = path.resolve(process.cwd(), 'backups');
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const out = path.join(dir, `tuckertrips-data-${stamp}.json`);
  fs.writeFileSync(out, JSON.stringify(backup, null, 2));
  fs.writeFileSync(path.join(dir, 'latest.json'), JSON.stringify(backup, null, 2));
  console.log('Backup written:', out);
  console.log('Row counts:', JSON.stringify(counts, null, 2));
})().catch((e) => { console.error(e); process.exit(1); });
