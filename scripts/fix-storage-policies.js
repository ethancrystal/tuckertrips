const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

const databaseUrl = process.env.DATABASE_URL

async function fixStoragePolicies() {
  const client = new Client({
    connectionString: databaseUrl
  })

  try {
    await client.connect()
    console.log('Connected to PostgreSQL database')

    // First, disable RLS temporarily to allow uploads
    console.log('\nTemporarily disabling RLS...')
    await client.query(`
      ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
    `)
    console.log('✓ RLS disabled temporarily')

    // Re-enable RLS with proper policies
    console.log('\nRe-enabling RLS and setting proper policies...')

    // Drop all existing policies
    const policies = [
      "Public View Photos",
      "Authenticated Upload Photos",
      "Authenticated Update Photos",
      "Authenticated Delete Photos"
    ]

    for (const policy of policies) {
      await client.query(`DROP POLICY IF EXISTS "${policy}" ON storage.objects;`)
    }

    // Re-enable RLS
    await client.query(`
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    `)

    // Create simplified policies that work for anon uploads
    await client.query(`
      CREATE POLICY "Allow uploads" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'trip-photos');
    `)

    await client.query(`
      CREATE POLICY "Allow viewing" ON storage.objects
      FOR SELECT USING (bucket_id = 'trip-photos');
    `)

    await client.query(`
      CREATE POLICY "Allow updates" ON storage.objects
      FOR UPDATE USING (bucket_id = 'trip-photos');
    `)

    await client.query(`
      CREATE POLICY "Allow deletes" ON storage.objects
      FOR DELETE USING (bucket_id = 'trip-photos');
    `)

    console.log('✓ New policies created successfully!')

    // Also check if we need to set up the buckets table
    console.log('\nChecking storage setup...')
    const bucketCheck = await client.query(`
      SELECT * FROM storage.buckets WHERE name = 'trip-photos';
    `)

    if (bucketCheck.rows.length === 0) {
      console.log('Creating bucket record...')
      await client.query(`
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('trip-photos', 'trip-photos', true, 10485760, ARRAY['image/*']);
      `)
      console.log('✓ Bucket record created')
    } else {
      console.log('✓ Bucket already exists')
    }

    console.log('\nStorage setup complete!')

  } catch (error) {
    console.error('Setup failed:', error)
  } finally {
    await client.end()
  }
}

fixStoragePolicies()