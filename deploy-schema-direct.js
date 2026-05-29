#!/usr/bin/env node
/**
 * Deploy schema directly using pg library with IPv4 forcing
 */

const fs = require('fs');
const dns = require('dns');
const { Client } = require('pg');

// Force IPv4 resolution
dns.setDefaultResultOrder('ipv4first');

// Read schema
const schema = fs.readFileSync('./apply-schema.sql', 'utf8');

// Connection config with IPv4 preference
const client = new Client({
  host: 'db.rogrzxjxtypzsempesrf.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'Cp3oipVpEhTX1ksy',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

console.log('🔌 Connecting to database...');

client.connect()
  .then(() => {
    console.log('✅ Connected successfully!\n');
    console.log('📝 Executing schema...\n');
    return client.query(schema);
  })
  .then((result) => {
    console.log('✅ Schema deployed successfully!');
    console.log(`📊 Rows affected: ${result.rowCount || 'N/A'}`);
    return client.end();
  })
  .then(() => {
    console.log('\n🎉 Deployment complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    if (err.stack) {
      console.error('\nStack trace:', err.stack);
    }
    client.end();
    process.exit(1);
  });
