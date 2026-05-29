#!/usr/bin/env node

const { Client } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

// Expected schema components from supabase-enhanced-schema.sql
const EXPECTED_TABLES = [
  'profiles',
  'trips',
  'trip_categories',
  'messages',
  'friendships',
  'trip_shares',
  'pending_shares',
];

const EXPECTED_FUNCTIONS = [
  'handle_new_user',
  'handle_updated_at',
  'update_user_heartbeat',
  'get_user_accessible_trips',
];

const EXPECTED_TRIGGERS = [
  { name: 'on_auth_user_created', table: 'users', schema: 'auth' },
  { name: 'profiles_updated_at', table: 'profiles', schema: 'public' },
  { name: 'trips_updated_at', table: 'trips', schema: 'public' },
  { name: 'friendships_updated_at', table: 'friendships', schema: 'public' },
];

const EXPECTED_INDEXES = [
  'profiles_email_idx',
  'profiles_is_online_idx',
  'profiles_last_seen_idx',
  'trips_user_id_idx',
  'trips_destination_idx',
  'trips_status_idx',
  'trips_visibility_idx',
  'trips_shared_with_idx',
  'trip_categories_trip_id_idx',
  'messages_sender_id_idx',
  'messages_recipient_id_idx',
  'messages_created_at_idx',
  'friendships_user_id_idx',
  'friendships_friend_id_idx',
  'friendships_status_idx',
  'trip_shares_trip_id_idx',
  'trip_shares_shared_with_idx',
  'pending_shares_recipient_email_idx',
  'pending_shares_expires_at_idx',
];

const EXPECTED_VIEWS = [
  'shared_trips_view',
];

const EXPECTED_EXTENSIONS = [
  'uuid-ossp',
];

async function verifySchema() {
  if (!DATABASE_URL) {
    console.error('❌ Missing DATABASE_URL in .env.local');
    process.exit(1);
  }

  // Force IPv4 by replacing hostname with IPv4 address or using family: 4
  const url = new URL(DATABASE_URL);
  const dns = require('dns');

  // Configure DNS to prefer IPv4
  dns.setDefaultResultOrder('ipv4first');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('🔌 Connected to database\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('           COMPREHENSIVE SCHEMA VERIFICATION REPORT            ');
    console.log('═══════════════════════════════════════════════════════════════\n');

    let hasIssues = false;

    // ========== CHECK EXTENSIONS ==========
    console.log('🔧 EXTENSIONS:');
    console.log('───────────────────────────────────────────────────────────────');
    const { rows: extensions } = await client.query(`
      SELECT extname FROM pg_extension
      WHERE extname = ANY($1)
      ORDER BY extname
    `, [EXPECTED_EXTENSIONS]);

    const installedExtensions = new Set(extensions.map(e => e.extname));
    for (const ext of EXPECTED_EXTENSIONS) {
      const exists = installedExtensions.has(ext);
      console.log(`${exists ? '✅' : '❌'} ${ext}`);
      if (!exists) hasIssues = true;
    }

    // ========== CHECK TABLES ==========
    console.log('\n📦 TABLES:');
    console.log('───────────────────────────────────────────────────────────────');
    const { rows: tables } = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename = ANY($1)
      ORDER BY tablename
    `, [EXPECTED_TABLES]);

    const existingTables = new Set(tables.map(t => t.tablename));
    for (const table of EXPECTED_TABLES) {
      const exists = existingTables.has(table);
      console.log(`${exists ? '✅' : '❌'} ${table}`);
      if (!exists) hasIssues = true;
    }

    // ========== CHECK RLS POLICIES ==========
    console.log('\n🔒 ROW LEVEL SECURITY (RLS):');
    console.log('───────────────────────────────────────────────────────────────');

    // Check if RLS is enabled on tables
    const { rows: rlsTables } = await client.query(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename = ANY($1)
      ORDER BY tablename
    `, [EXPECTED_TABLES]);

    for (const table of rlsTables) {
      console.log(`${table.rowsecurity ? '✅' : '❌'} ${table.tablename} - RLS ${table.rowsecurity ? 'enabled' : 'DISABLED'}`);
      if (!table.rowsecurity) hasIssues = true;
    }

    // Count policies per table
    const { rows: policyCounts } = await client.query(`
      SELECT schemaname, tablename, COUNT(*) as policy_count
      FROM pg_policies
      WHERE schemaname = 'public'
      AND tablename = ANY($1)
      GROUP BY schemaname, tablename
      ORDER BY tablename
    `, [EXPECTED_TABLES]);

    console.log('\n📋 RLS POLICIES COUNT:');
    for (const pc of policyCounts) {
      console.log(`   ${pc.tablename}: ${pc.policy_count} policies`);
    }

    // List all policies
    const { rows: policies } = await client.query(`
      SELECT tablename, policyname, cmd
      FROM pg_policies
      WHERE schemaname = 'public'
      AND tablename = ANY($1)
      ORDER BY tablename, policyname
    `, [EXPECTED_TABLES]);

    console.log('\n📜 ALL RLS POLICIES:');
    let currentTable = null;
    for (const policy of policies) {
      if (currentTable !== policy.tablename) {
        console.log(`\n   ${policy.tablename}:`);
        currentTable = policy.tablename;
      }
      console.log(`      • ${policy.policyname} (${policy.cmd})`);
    }

    // ========== CHECK FUNCTIONS ==========
    console.log('\n\n⚙️  FUNCTIONS:');
    console.log('───────────────────────────────────────────────────────────────');
    const { rows: functions } = await client.query(`
      SELECT proname
      FROM pg_proc
      WHERE pronamespace = 'public'::regnamespace
      AND proname = ANY($1)
      ORDER BY proname
    `, [EXPECTED_FUNCTIONS]);

    const existingFunctions = new Set(functions.map(f => f.proname));
    for (const func of EXPECTED_FUNCTIONS) {
      const exists = existingFunctions.has(func);
      console.log(`${exists ? '✅' : '❌'} ${func}()`);
      if (!exists) hasIssues = true;
    }

    // ========== CHECK TRIGGERS ==========
    console.log('\n🔔 TRIGGERS:');
    console.log('───────────────────────────────────────────────────────────────');
    const { rows: triggers } = await client.query(`
      SELECT
        t.tgname as trigger_name,
        c.relname as table_name,
        n.nspname as schema_name
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname IN ('public', 'auth')
      AND NOT t.tgisinternal
      ORDER BY n.nspname, c.relname, t.tgname
    `);

    for (const expectedTrigger of EXPECTED_TRIGGERS) {
      const exists = triggers.some(
        t => t.trigger_name === expectedTrigger.name &&
             t.table_name === expectedTrigger.table &&
             t.schema_name === expectedTrigger.schema
      );
      console.log(`${exists ? '✅' : '❌'} ${expectedTrigger.name} on ${expectedTrigger.schema}.${expectedTrigger.table}`);
      if (!exists) hasIssues = true;
    }

    // ========== CHECK INDEXES ==========
    console.log('\n📇 INDEXES:');
    console.log('───────────────────────────────────────────────────────────────');
    const { rows: indexes } = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname = ANY($1)
      ORDER BY indexname
    `, [EXPECTED_INDEXES]);

    const existingIndexes = new Set(indexes.map(i => i.indexname));
    let missingIndexCount = 0;
    for (const idx of EXPECTED_INDEXES) {
      const exists = existingIndexes.has(idx);
      console.log(`${exists ? '✅' : '⚠️ '} ${idx}`);
      if (!exists) missingIndexCount++;
    }
    if (missingIndexCount > 0) {
      console.log(`\n   ⚠️  ${missingIndexCount} indexes missing (performance may be affected)`);
    }

    // ========== CHECK VIEWS ==========
    console.log('\n👁️  VIEWS:');
    console.log('───────────────────────────────────────────────────────────────');
    const { rows: views } = await client.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      AND table_name = ANY($1)
      ORDER BY table_name
    `, [EXPECTED_VIEWS]);

    const existingViews = new Set(views.map(v => v.table_name));
    for (const view of EXPECTED_VIEWS) {
      const exists = existingViews.has(view);
      console.log(`${exists ? '✅' : '⚠️ '} ${view}`);
      if (!exists) {
        console.log('   (View is optional but helpful for queries)');
      }
    }

    // ========== CHECK CONSTRAINTS ==========
    console.log('\n🔐 CHECK CONSTRAINTS & ENUMS:');
    console.log('───────────────────────────────────────────────────────────────');
    const { rows: constraints } = await client.query(`
      SELECT
        tc.table_name,
        tc.constraint_name,
        cc.check_clause
      FROM information_schema.table_constraints tc
      JOIN information_schema.check_constraints cc
        ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_schema = 'public'
      AND tc.constraint_type = 'CHECK'
      AND tc.table_name = ANY($1)
      ORDER BY tc.table_name, tc.constraint_name
    `, [EXPECTED_TABLES]);

    if (constraints.length > 0) {
      let currentTable = null;
      for (const constraint of constraints) {
        if (currentTable !== constraint.table_name) {
          console.log(`\n   ${constraint.table_name}:`);
          currentTable = constraint.table_name;
        }
        console.log(`      • ${constraint.constraint_name}`);
        console.log(`        ${constraint.check_clause}`);
      }
    } else {
      console.log('   ⚠️  No check constraints found');
    }

    // ========== SUMMARY ==========
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('                         SUMMARY                               ');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Extensions:     ${installedExtensions.size}/${EXPECTED_EXTENSIONS.length}`);
    console.log(`Tables:         ${existingTables.size}/${EXPECTED_TABLES.length}`);
    console.log(`Functions:      ${existingFunctions.size}/${EXPECTED_FUNCTIONS.length}`);
    console.log(`Triggers:       ${triggers.length} found`);
    console.log(`Indexes:        ${existingIndexes.size}/${EXPECTED_INDEXES.length}`);
    console.log(`Views:          ${existingViews.size}/${EXPECTED_VIEWS.length}`);
    console.log(`RLS Policies:   ${policies.length} total`);
    console.log(`Check Constraints: ${constraints.length}`);

    console.log('\n');
    if (hasIssues) {
      console.log('❌ CRITICAL ISSUES FOUND - Schema deployment incomplete!');
      console.log('\n💡 To deploy the schema, run:');
      console.log('   node scripts/deploy-tucker-trips-schema.js');
      process.exit(1);
    } else {
      console.log('✅ ALL CRITICAL SCHEMA COMPONENTS DEPLOYED');
      if (missingIndexCount > 0 || existingViews.size < EXPECTED_VIEWS.length) {
        console.log('⚠️  Some optional components missing (indexes/views)');
        console.log('   Performance may be affected. Consider running full schema migration.');
      }
    }
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifySchema();
