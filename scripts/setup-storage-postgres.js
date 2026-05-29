const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

const databaseUrl = process.env.DATABASE_URL

async function setupStorageWithPostgres() {
  const client = new Client({
    connectionString: databaseUrl
  })

  try {
    await client.connect()
    console.log('Connected to PostgreSQL database')

    // Drop existing policies
    console.log('\nDropping existing policies...')
    const dropQueries = [
      `DROP POLICY IF EXISTS "Public View Photos" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Authenticated Upload Photos" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Update Own Photos" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Delete Own Photos" ON storage.objects;`
    ]

    for (const query of dropQueries) {
      try {
        await client.query(query)
        console.log('✓ Dropped policy')
      } catch (err) {
        if (!err.message.includes('does not exist')) {
          console.log('Warning:', err.message)
        }
      }
    }

    // Create new policies
    console.log('\nCreating new policies...')
    const policyQueries = [
      // Public view policy
      `CREATE POLICY "Public View Photos" ON storage.objects
       FOR SELECT USING (bucket_id = 'trip-photos');`,

      // Authenticated upload policy
      `CREATE POLICY "Authenticated Upload Photos" ON storage.objects
       FOR INSERT WITH CHECK (
         bucket_id = 'trip-photos' AND
         auth.role() = 'authenticated'
       );`,

      // Authenticated update policy
      `CREATE POLICY "Authenticated Update Photos" ON storage.objects
       FOR UPDATE USING (
         bucket_id = 'trip-photos' AND
         auth.role() = 'authenticated'
       );`,

      // Authenticated delete policy
      `CREATE POLICY "Authenticated Delete Photos" ON storage.objects
       FOR DELETE USING (
         bucket_id = 'trip-photos' AND
         auth.role() = 'authenticated'
       );`
    ]

    for (const query of policyQueries) {
      try {
        await client.query(query)
        console.log('✓ Created policy:', query.split('POLICY')[1].split('ON')[0].trim())
      } catch (err) {
        console.error('Error creating policy:', err.message)
      }
    }

    // Check if RLS is enabled
    console.log('\nChecking RLS status...')
    const rlsResult = await client.query(`
      SELECT relname, relrowsecurity
      FROM pg_class
      WHERE relname = 'objects' AND relnamespace = (
        SELECT oid FROM pg_namespace WHERE nspname = 'storage'
      )
    `)

    if (rlsResult.rows.length > 0) {
      console.log('RLS enabled on storage.objects:', rlsResult.rows[0].relrowsecurity)
    }

    console.log('\nStorage policies setup complete!')

  } catch (error) {
    console.error('Setup failed:', error)
  } finally {
    await client.end()
  }
}

setupStorageWithPostgres()