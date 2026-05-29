-- Create storage bucket for trip photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trip-photos',
  'trip-photos',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public View Photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Photos" ON storage.objects;

-- Allow public access to view photos
CREATE POLICY "Public View Photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'trip-photos');

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated Upload Photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'trip-photos' AND
  auth.role() = 'authenticated'
);