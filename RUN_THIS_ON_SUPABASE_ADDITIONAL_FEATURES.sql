-- ============================================
-- ADDITIONAL FEATURES FOR TUCKER TRIPS
-- ============================================
-- This adds ENHANCED features on top of the basic schema
-- Run this after the basic schema is already in place
--
-- Instructions:
-- 1. Go to: https://supabase.com/dashboard/project/rogrzxjxtypzsempesrf/sql
-- 2. Click "New Query"
-- 3. Copy and paste everything below
-- 4. Click "Run"
-- ============================================

-- ============================================
-- PART 1: ADD NEW COLUMNS TO EXISTING TABLES
-- ============================================

-- Add new columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cover_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add new columns to trips table
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS cover_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS trip_images TEXT[], -- Array of image URLs
  ADD COLUMN IF NOT EXISTS photo_urls TEXT[], -- Alias for trip_images
  ADD COLUMN IF NOT EXISTS weather TEXT,
  ADD COLUMN IF NOT EXISTS overall_comment TEXT,
  ADD COLUMN IF NOT EXISTS airlines TEXT[], -- Array of airline info
  ADD COLUMN IF NOT EXISTS accommodations TEXT[], -- Array of accommodation info
  ADD COLUMN IF NOT EXISTS segments TEXT[], -- Trip segments
  ADD COLUMN IF NOT EXISTS shared_with UUID[] DEFAULT '{}', -- Array of user IDs
  ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS shared_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add status enum expansion to include 'ongoing'
ALTER TABLE public.trips
  DROP CONSTRAINT IF EXISTS trips_trip_type_check;

ALTER TABLE public.trips
  ADD CONSTRAINT trips_trip_type_check
  CHECK (trip_type IN ('taken', 'future', 'ongoing'));

-- ============================================
-- PART 2: CREATE NEW TABLES
-- ============================================

-- Messages table (for direct messaging between users)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pending shares table (for sharing trips via email/link to non-users)
CREATE TABLE IF NOT EXISTS public.pending_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_email TEXT NOT NULL,
  invite_link TEXT NOT NULL,
  claimed BOOLEAN DEFAULT FALSE,
  claimed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PART 3: ENABLE RLS ON NEW TABLES
-- ============================================

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_shares ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 4: CREATE RLS POLICIES FOR NEW TABLES
-- ============================================

-- Messages policies
CREATE POLICY "Users can view messages sent to them"
  ON public.messages FOR SELECT
  USING (auth.uid() = recipient_id OR auth.uid() = sender_id);

CREATE POLICY "Users can create messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received"
  ON public.messages FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Pending shares policies
CREATE POLICY "Users can view pending shares they created"
  ON public.pending_shares FOR SELECT
  USING (auth.uid() = shared_by);

CREATE POLICY "Users can create pending shares"
  ON public.pending_shares FOR INSERT
  WITH CHECK (auth.uid() = shared_by);

CREATE POLICY "Users can delete pending shares they created"
  ON public.pending_shares FOR DELETE
  USING (auth.uid() = shared_by);

-- ============================================
-- PART 5: ADDITIONAL POLICIES FOR EXISTING TABLES
-- ============================================

-- Make profiles public (anyone can view profiles)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- ============================================
-- PART 6: CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_recipient_id_idx ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS pending_shares_trip_id_idx ON public.pending_shares(trip_id);
CREATE INDEX IF NOT EXISTS pending_shares_recipient_email_idx ON public.pending_shares(recipient_email);
CREATE INDEX IF NOT EXISTS pending_shares_expires_at_idx ON public.pending_shares(expires_at);

-- Indexes for shared trips
CREATE INDEX IF NOT EXISTS trips_is_shared_idx ON public.trips(is_shared) WHERE is_shared = TRUE;
CREATE INDEX IF NOT EXISTS trips_shared_at_idx ON public.trips(shared_at) WHERE shared_at IS NOT NULL;

-- ============================================
-- PART 7: CREATE HELPER FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to automatically update is_shared when visibility changes
CREATE OR REPLACE FUNCTION update_is_shared_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Set is_shared to true when visibility is set to public
    IF NEW.visibility = 'public' AND (OLD.visibility IS NULL OR OLD.visibility != 'public') THEN
        NEW.is_shared = TRUE;
        NEW.shared_at = COALESCE(NEW.shared_at, NOW());
    END IF;

    -- Allow manual setting of is_shared for private sharing
    IF NEW.is_shared = TRUE AND (OLD.is_shared = FALSE OR OLD.is_shared IS NULL) AND NEW.shared_at IS NULL THEN
        NEW.shared_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trips_update_is_shared_trigger ON public.trips;

-- Create the trigger
CREATE TRIGGER trips_update_is_shared_trigger
    BEFORE UPDATE ON public.trips
    FOR EACH ROW
    EXECUTE FUNCTION update_is_shared_trigger();

-- Update existing public trips to have is_shared = true
UPDATE public.trips
SET is_shared = TRUE, shared_at = created_at
WHERE visibility = 'public' AND (is_shared = FALSE OR is_shared IS NULL);

-- ============================================
-- PART 8: UPDATE EXISTING TRIGGERS IF NEEDED
-- ============================================

-- Update the handle_updated_at function to include new tables
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONE!
-- ============================================

-- Add helpful comments
COMMENT ON TABLE public.messages IS 'Direct messages between users';
COMMENT ON TABLE public.pending_shares IS 'Pending trip shares for non-users (email invitations)';
COMMENT ON COLUMN public.profiles.is_online IS 'Whether the user is currently online';
COMMENT ON COLUMN public.profiles.last_seen IS 'Last timestamp when user was active';
COMMENT ON COLUMN public.trips.is_shared IS 'Whether this trip has been shared';
COMMENT ON COLUMN public.trips.shared_at IS 'Timestamp when trip was first shared';
COMMENT ON COLUMN public.trips.shared_with IS 'Array of user IDs this trip is shared with';
COMMENT ON COLUMN public.trips.photo_urls IS 'Array of photo URLs for this trip';
