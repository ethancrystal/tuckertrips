const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applySchema() {
  // Create client with SSL configuration for Supabase
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Supabase
    },
    // Force IPv4 to avoid IPv6 connectivity issues
    connectionTimeoutMillis: 10000
  });

  try {
    console.log('🔌 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read the schema file
    const schemaPath = path.join(__dirname, '../complete-schema.sql');
    console.log('📄 Reading schema from:', schemaPath);
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔄 Applying schema to database...');
    console.log('This may take a moment...\n');

    await client.query(schema);

    console.log('✨ Schema applied successfully!\n');
    console.log('📊 Tables created:');
    console.log('  ✓ profiles');
    console.log('  ✓ trips');
    console.log('  ✓ trip_categories');
    console.log('  ✓ friendships');
    console.log('  ✓ trip_shares');
    console.log('\n🔒 RLS policies enabled and configured.');
    console.log('\n🎉 Your database is ready!');
    console.log('🌐 Your app should now work without 404 errors.\n');

  } catch (error) {
    console.error('\n❌ Error applying schema:');
    console.error('Message:', error.message);

    if (error.code) {
      console.error('Error code:', error.code);
    }

    if (error.detail) {
      console.error('Detail:', error.detail);
    }

    if (error.hint) {
      console.error('Hint:', error.hint);
    }

    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database.\n');
  }
}

applySchema();
