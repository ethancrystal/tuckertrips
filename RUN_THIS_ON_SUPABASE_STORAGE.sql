-- ============================================
-- SUPABASE STORAGE SETUP FOR TRIP PHOTOS
-- ============================================
-- This sets up the storage bucket and policies for photo uploads
--
-- Instructions:
-- 1. Go to: https://supabase.com/dashboard/project/rogrzxjxtypzsempesrf/storage
-- 2. Click "Create a new bucket" button
-- 3. Name it: trip-photos
-- 4. Make it: Public bucket (toggle ON)
-- 5. Click "Create bucket"
--
-- OR run this SQL below to set it up programmatically:
-- ============================================

-- Insert storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trip-photos',
  'trip-photos',
  true,
  52428800, -- 50MB limit
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

-- Grant public access for viewing photos
CREATE POLICY IF NOT EXISTS "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'trip-photos');

-- Allow authenticated users to upload photos
CREATE POLICY IF NOT EXISTS "Authenticated Upload Access"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'trip-photos' AND
    auth.role() = 'authenticated'
  );

-- Allow users to update their own photos
CREATE POLICY IF NOT EXISTS "User Update Own Photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'trip-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own photos
CREATE POLICY IF NOT EXISTS "User Delete Own Photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'trip-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- VERIFICATION
-- ============================================

-- To verify the bucket exists:
-- SELECT * FROM storage.buckets WHERE id = 'trip-photos';

-- To verify the policies exist:
-- SELECT * FROM storage.policies WHERE bucket_id = 'trip-photos';
