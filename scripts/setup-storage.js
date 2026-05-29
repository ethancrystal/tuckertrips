const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  try {
    console.log('Setting up Supabase storage for trip photos...')

    // 1. Create the storage bucket if it doesn't exist
    console.log('Creating storage bucket...')
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('trip-photos', {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: 10485760 // 10MB
    })

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('Error creating bucket:', bucketError)
    } else {
      console.log('Bucket "trip-photos" created or already exists')
    }

    // 2. Create policies for the bucket
    console.log('Setting up storage policies...')

    // Policy to allow anyone to view images
    const { error: policyError1 } = await supabase.rpc('create_policy', {
      policy_name: 'Allow public uploads',
      bucket_name: 'trip-photos',
      definition: {
        SELECT: true,
        INSERT: true,
        UPDATE: true,
        DELETE: false
      },
      roles: ['anon', 'authenticated'],
      condition: 'true'
    })

    // Alternative approach using SQL
    const sqlPolicies = [
      // Allow public access to view photos
      `CREATE POLICY IF NOT EXISTS "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'trip-photos');`,

      // Allow authenticated users to upload photos
      `CREATE POLICY IF NOT EXISTS "Upload Photos" ON storage.objects FOR INSERT WITH CHECK (
        bucket_id = 'trip-photos' AND
        auth.role() = 'authenticated'
      );`,

      // Allow users to update their own photos
      `CREATE POLICY IF NOT EXISTS "Update Own Photos" ON storage.objects FOR UPDATE USING (
        bucket_id = 'trip-photos' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );`,

      // Allow users to delete their own photos
      `CREATE POLICY IF NOT EXISTS "Delete Own Photos" ON storage.objects FOR DELETE USING (
        bucket_id = 'trip-photos' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );`
    ]

    for (const sql of sqlPolicies) {
      const { error: sqlError } = await supabase.rpc('exec_sql', { sql_query: sql })
      if (sqlError && !sqlError.message.includes('already exists')) {
        console.error('Error executing SQL policy:', sql, sqlError)
      }
    }

    console.log('Storage setup completed successfully!')

    // 3. Test upload by checking bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const tripPhotosBucket = buckets.find(b => b.name === 'trip-photos')

    if (tripPhotosBucket) {
      console.log('✓ Bucket "trip-photos" is ready')
      console.log('Bucket details:', tripPhotosBucket)
    } else {
      console.log('⚠ Bucket creation may have failed')
    }

  } catch (error) {
    console.error('Setup failed:', error)
  }
}

setupStorage()