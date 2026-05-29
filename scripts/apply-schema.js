const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applySchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // Read the schema file
    const schemaPath = path.join(__dirname, '../complete-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Applying schema...');
    await client.query(schema);

    console.log('✅ Schema applied successfully!');
    console.log('\nTables created:');
    console.log('- profiles');
    console.log('- trips');
    console.log('- trip_categories');
    console.log('- friendships');
    console.log('- trip_shares');
    console.log('\nRLS policies enabled and configured.');
    console.log('\nYour database is ready! 🎉');

  } catch (error) {
    console.error('❌ Error applying schema:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

applySchema();
