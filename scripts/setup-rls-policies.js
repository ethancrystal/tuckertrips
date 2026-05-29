const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function setupRLSPolicies() {
  try {
    console.log('Setting up RLS policies for storage...')

    // Drop existing policies if they exist
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Public View Photos" ON storage.objects;',
      'DROP POLICY IF EXISTS "Authenticated Upload Photos" ON storage.objects;',
      'DROP POLICY IF EXISTS "Update Own Photos" ON storage.objects;',
      'DROP POLICY IF EXISTS "Delete Own Photos" ON storage.objects;'
    ]

    for (const sql of dropPolicies) {
      await supabaseAdmin.rpc('exec_sql', { sql_query: sql })
    }

    // Enable RLS on storage.objects if not already enabled
    await supabaseAdmin.rpc('exec_sql', {
      sql_query: 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;'
    })

    // Create new policies
    const policies = [
      // Allow anyone to view photos (public bucket)
      `CREATE POLICY "Public View Photos" ON storage.objects FOR SELECT
       USING (bucket_id = 'trip-photos');`,

      // Allow authenticated users to upload photos
      `CREATE POLICY "Authenticated Upload Photos" ON storage.objects FOR INSERT
       WITH CHECK (
         bucket_id = 'trip-photos' AND
         auth.role() = 'authenticated'
       );`,

      // Allow authenticated users to update photos
      `CREATE POLICY "Authenticated Update Photos" ON storage.objects FOR UPDATE
       USING (
         bucket_id = 'trip-photos' AND
         auth.role() = 'authenticated'
       );`,

      // Allow authenticated users to delete photos
      `CREATE POLICY "Authenticated Delete Photos" ON storage.objects FOR DELETE
       USING (
         bucket_id = 'trip-photos' AND
         auth.role() = 'authenticated'
       );`
    ]

    for (const sql of policies) {
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql })
      if (error) {
        console.error('Error creating policy:', error)
      } else {
        console.log('✓ Policy created:', sql.split('\n')[0].substring(14, 50) + '...')
      }
    }

    console.log('\nRLS policies setup complete!')

  } catch (error) {
    console.error('Setup failed:', error)
  }
}

setupRLSPolicies()