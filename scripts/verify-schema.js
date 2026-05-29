const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verifySchema() {
  try {
    await client.connect();
    console.log('🔌 Connected to database\n');

    // List all tables
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('✅ Tables created:');
    result.rows.forEach(row => console.log(`   - ${row.table_name}`));

    // Check RLS is enabled
    const rlsResult = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND rowsecurity = true
      ORDER BY tablename
    `);

    console.log('\n🔒 RLS enabled on:');
    rlsResult.rows.forEach(row => console.log(`   - ${row.tablename}`));

    console.log('\n✨ Database schema is ready!');
    console.log('🌐 Your app should now work at: https://tucker-trips.vercel.app\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifySchema();
