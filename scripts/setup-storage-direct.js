const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  try {
    console.log('Connecting to Supabase...')
    console.log('URL:', supabaseUrl)

    // Test connection
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1)
    if (error && error.code !== 'PGRST116') {
      console.log('Connection test:', error.message)
    }

    // Create bucket
    console.log('\nCreating bucket "trip-photos"...')
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('trip-photos', {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: 10485760
    })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✓ Bucket already exists')
      } else {
        console.error('Error creating bucket:', bucketError)
      }
    } else {
      console.log('✓ Bucket created successfully')
    }

    // List buckets to verify
    console.log('\nListing buckets...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('Error listing buckets:', listError)
    } else {
      console.log('Available buckets:')
      buckets.forEach(b => {
        console.log(`  - ${b.name} (public: ${b.public})`)
      })
    }

    // Now let's create the SQL to set up RLS policies
    console.log('\nTo set up the Row Level Security policies, run the following SQL in your Supabase SQL Editor:')
    console.log(`
-- Allow public access to view photos
CREATE POLICY IF NOT EXISTS "Public View Photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'trip-photos');

-- Allow authenticated users to upload photos
CREATE POLICY IF NOT EXISTS "Authenticated Upload Photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'trip-photos' AND
  auth.role() = 'authenticated'
);

-- Allow users to update their own photos
CREATE POLICY IF NOT EXISTS "Update Own Photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'trip-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own photos
CREATE POLICY IF NOT EXISTS "Delete Own Photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'trip-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
`)

    // Test upload permissions by trying to get bucket info
    console.log('\nChecking bucket permissions...')
    const { data: bucketInfo } = await supabase.storage.getBucket('trip-photos')
    if (bucketInfo) {
      console.log('✓ Bucket is accessible')
      console.log('Bucket info:', bucketInfo)
    }

  } catch (err) {
    console.error('Error:', err)
  }
}

setupStorage()