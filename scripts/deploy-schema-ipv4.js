#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const dns = require('dns');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Force DNS to use IPv4
dns.setDefaultResultOrder('ipv4first');

async function deploySchema() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ Missing DATABASE_URL in .env.local');
    process.exit(1);
  }

  // Parse the DATABASE_URL to convert to IPv4 pooler URL
  const url = new URL(databaseUrl);
  const hostname = url.hostname;

  // Convert direct connection to pooler (IPv4-friendly)
  let connectionString = databaseUrl;
  if (hostname.startsWith('db.')) {
    // Replace db.XXX.supabase.co:5432 with aws-0-us-west-1.pooler.supabase.com:6543
    // This is a workaround for IPv6 issues
    const projectRef = hostname.replace('db.', '').replace('.supabase.co', '');
    console.log(`⚠️  Direct connection has IPv6 issues. Please update DATABASE_URL to use pooler:`);
    console.log(`   postgresql://postgres.${projectRef}:${url.password}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`);
    console.log('');
    console.log('Or manually run the schema in Supabase SQL Editor:');
    console.log('   1. Open https://supabase.com/dashboard/project/rogrzxjxtypzsempesrf/sql/new');
    console.log('   2. Copy contents from: scripts/complete-app-schema.sql');
    console.log('   3. Click "Run"');
    console.log('');
    process.exit(1);
  }

  const { Client } = require('pg');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  const schemaPath = path.resolve(process.cwd(), 'scripts', 'complete-app-schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('🚀 Deploying Tucker Trips schema...');
  console.log(`📁 Schema file: ${schemaPath}`);
  console.log('');

  try {
    await client.connect();
    console.log('✅ Connected to database');

    await client.query(schemaSql);
    console.log('✅ Schema SQL executed');

    // Verify tables
    const { rows } = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('profiles', 'trips', 'trip_categories', 'friendships', 'trip_shares', 'pending_shares', 'messages')
      ORDER BY tablename
    `);

    console.log('');
    console.log('📦 Tucker Trips Tables Deployed:');
    rows.forEach(r => console.log(`   ✅ ${r.tablename}`));

    // Verify functions
    const { rows: functions } = await client.query(`
      SELECT proname
      FROM pg_proc
      WHERE pronamespace = 'public'::regnamespace
      AND proname IN ('tucker_handle_new_user', 'tucker_handle_updated_at', 'get_user_conversations', 'get_unread_message_count', 'mark_conversation_read')
      ORDER BY proname
    `);

    console.log('');
    console.log('⚙️  Functions Deployed:');
    functions.forEach(f => console.log(`   ✅ ${f.proname}()`));

    console.log('');
    console.log('✅ Tucker Trips schema fully deployed!');
    console.log('');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

deploySchema();
