-- Add Photo Support to Trips
-- Run this in your Supabase SQL Editor to add photo storage capabilities

-- 1. Create a storage bucket for trip photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trip-photos',
  'trip-photos',
  true,
  52428800, -- 50MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 2. Add photo columns to trips table
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS cover_photo_url TEXT,
ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}';

-- 3. Create trip_photos table for detailed photo information
CREATE TABLE IF NOT EXISTS public.trip_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type VARCHAR(20) NOT NULL DEFAULT 'gallery', -- 'cover' or 'gallery'
  caption TEXT,
  upload_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_trip_photos_trip_id ON public.trip_photos(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_photos_type ON public.trip_photos(photo_type);
CREATE INDEX IF NOT EXISTS idx_trip_photos_order ON public.trip_photos(upload_order);

-- 5. Update RLS policies for trip photos
ALTER TABLE public.trip_photos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view photos for public trips or their own trips
CREATE POLICY "Users can view trip photos"
ON public.trip_photos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.trips
    WHERE trips.id = trip_photos.trip_id
    AND (trips.visibility = 'public' OR trips.user_id = auth.uid())
  )
);

-- Policy: Users can insert photos for their own trips
CREATE POLICY "Users can insert trip photos"
ON public.trip_photos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trips
    WHERE trips.id = trip_photos.trip_id
    AND trips.user_id = auth.uid()
  )
);

-- Policy: Users can update photos for their own trips
CREATE POLICY "Users can update trip photos"
ON public.trip_photos FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.trips
    WHERE trips.id = trip_photos.trip_id
    AND trips.user_id = auth.uid()
  )
);

-- Policy: Users can delete photos for their own trips
CREATE POLICY "Users can delete trip photos"
ON public.trip_photos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.trips
    WHERE trips.id = trip_photos.trip_id
    AND trips.user_id = auth.uid()
  )
);

-- 6. Storage policies for trip photos bucket
CREATE POLICY "Anyone can view trip photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'trip-photos');

CREATE POLICY "Authenticated users can upload trip photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'trip-photos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own trip photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'trip-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own trip photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'trip-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 7. Function to handle photo uploads and updates
CREATE OR REPLACE FUNCTION public.update_trip_photos(
  p_trip_id UUID,
  p_cover_photo_url TEXT DEFAULT NULL,
  p_photo_urls TEXT[] DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update cover photo if provided
  IF p_cover_photo_url IS NOT NULL THEN
    UPDATE public.trips
    SET cover_photo_url = p_cover_photo_url
    WHERE id = p_trip_id AND user_id = auth.uid();
  END IF;

  -- Update photo URLs array if provided
  IF p_photo_urls IS NOT NULL THEN
    UPDATE public.trips
    SET photo_urls = p_photo_urls
    WHERE id = p_trip_id AND user_id = auth.uid();
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger to update updated_at timestamp for trip photos
CREATE OR REPLACE FUNCTION public.handle_trip_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trip_photos_updated_at ON public.trip_photos;
CREATE TRIGGER trip_photos_updated_at
  BEFORE UPDATE ON public.trip_photos
  FOR EACH ROW EXECUTE FUNCTION public.handle_trip_photos_updated_at();

-- 9. Update the main trips trigger to handle photo fields
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- If this is a profile update and the user is online, update last_seen
  IF TG_TABLE_NAME = 'profiles' AND NEW.is_online = TRUE THEN
    NEW.last_seen = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create a view for trips with photos
CREATE OR REPLACE VIEW public.trips_with_photos AS
SELECT
  t.*,
  COALESCE(
    JSON_AGG(
      JSON_BUILD_OBJECT(
        'id', tp.id,
        'photo_url', tp.photo_url,
        'photo_type', tp.photo_type,
        'caption', tp.caption,
        'upload_order', tp.upload_order
      ) ORDER BY tp.upload_order
    ) FILTER (WHERE tp.id IS NOT NULL),
    '[]'::json
  ) as photos
FROM public.trips t
LEFT JOIN public.trip_photos tp ON t.id = tp.trip_id
GROUP BY t.id, t.user_id, t.trip_name, t.destination, t.start_date, t.end_date,
         t.description, t.visibility, t.trip_type, t.overall_rating,
         t.created_at, t.updated_at, t.cover_photo_url, t.photo_urls;