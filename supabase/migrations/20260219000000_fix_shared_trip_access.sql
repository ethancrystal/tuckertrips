-- ============================================================================
-- Migration: Fix Shared Trip Access
-- Date: 2026-02-19
-- Description: Ensures RLS policies correctly enforce shared trip access.
--   - Users in trip_shares can SELECT shared trips
--   - Trip categories also respect sharing rules via trip_shares
--   - Private trips not owned or shared are never returned from queries
-- ============================================================================

-- ============================================================================
-- 1. DROP existing policies that need to be replaced (safe: IF EXISTS)
-- ============================================================================

-- Drop the old "Users can view shared trips" policy on trips (if it exists)
-- This old policy may rely on the legacy shared_with UUID[] array field
DROP POLICY IF EXISTS "Users can view shared trips" ON public.trips;

-- Drop the old "Users can view trips shared with them" policy (from supabase-shared-trips-policy.sql)
DROP POLICY IF EXISTS "Users can view trips shared with them" ON public.trips;

-- Drop the old trip_categories policy that may not include trip_shares
DROP POLICY IF EXISTS "Users can view categories of accessible trips" ON public.trip_categories;

-- ============================================================================
-- 2. CREATE updated RLS policies for trips table
-- ============================================================================

-- Policy: Allow users to view trips that have been explicitly shared with them
-- via the trip_shares table. This is the canonical source of truth for sharing.
CREATE POLICY "Users can view shared trips via trip_shares"
  ON public.trips FOR SELECT
  USING (
    id IN (
      SELECT trip_id
      FROM public.trip_shares
      WHERE shared_with = auth.uid()
    )
  );

-- ============================================================================
-- 3. CREATE updated RLS policies for trip_categories table
-- ============================================================================

-- Policy: Allow users to view categories of trips they have access to.
-- This includes: own trips, public trips, friend trips, AND shared trips.
CREATE POLICY "Users can view categories of accessible trips"
  ON public.trip_categories FOR SELECT
  USING (
    -- User owns the trip
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
    OR
    -- Trip is public
    trip_id IN (SELECT id FROM public.trips WHERE visibility = 'public')
    OR
    -- Trip is shared with user via trip_shares table
    trip_id IN (
      SELECT trip_id FROM public.trip_shares WHERE shared_with = auth.uid()
    )
    OR
    -- Trip is visible to friends
    trip_id IN (
      SELECT id FROM public.trips WHERE visibility = 'friends' AND user_id IN (
        SELECT friend_id FROM public.friendships
        WHERE user_id = auth.uid() AND status = 'accepted'
        UNION
        SELECT user_id FROM public.friendships
        WHERE friend_id = auth.uid() AND status = 'accepted'
      )
    )
  );

-- ============================================================================
-- 4. VERIFY existing trip_shares RLS policies are correct
-- ============================================================================

-- Ensure trip_shares table has RLS enabled
ALTER TABLE public.trip_shares ENABLE ROW LEVEL SECURITY;

-- Drop and recreate trip_shares policies to ensure correctness
DROP POLICY IF EXISTS "Users can view their shares" ON public.trip_shares;
DROP POLICY IF EXISTS "Users can create shares for own trips" ON public.trip_shares;
DROP POLICY IF EXISTS "Users can delete shares for own trips" ON public.trip_shares;

-- Users can see shares they created or received
CREATE POLICY "Users can view their shares"
  ON public.trip_shares FOR SELECT
  USING (auth.uid() = shared_by OR auth.uid() = shared_with);

-- Users can create shares only for trips they own
CREATE POLICY "Users can create shares for own trips"
  ON public.trip_shares FOR INSERT
  WITH CHECK (
    auth.uid() = shared_by
    AND trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  );

-- Users can delete shares for trips they own (unshare)
CREATE POLICY "Users can delete shares for own trips"
  ON public.trip_shares FOR DELETE
  USING (
    auth.uid() = shared_by
    OR trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  );

-- ============================================================================
-- 5. ENSURE pending_shares table exists with proper RLS
-- ============================================================================

-- Create pending_shares table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pending_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_email TEXT NOT NULL,
  invite_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id, recipient_email)
);

ALTER TABLE public.pending_shares ENABLE ROW LEVEL SECURITY;

-- Drop and recreate pending_shares policies
DROP POLICY IF EXISTS "Users can view their pending shares" ON public.pending_shares;
DROP POLICY IF EXISTS "Users can create pending shares" ON public.pending_shares;
DROP POLICY IF EXISTS "Users can delete pending shares" ON public.pending_shares;

CREATE POLICY "Users can view their pending shares"
  ON public.pending_shares FOR SELECT
  USING (auth.uid() = shared_by);

CREATE POLICY "Users can create pending shares"
  ON public.pending_shares FOR INSERT
  WITH CHECK (
    auth.uid() = shared_by
    AND trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete pending shares"
  ON public.pending_shares FOR DELETE
  USING (
    auth.uid() = shared_by
    OR trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  );

-- ============================================================================
-- 6. CREATE indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS pending_shares_trip_id_idx ON public.pending_shares(trip_id);
CREATE INDEX IF NOT EXISTS pending_shares_shared_by_idx ON public.pending_shares(shared_by);
CREATE INDEX IF NOT EXISTS pending_shares_recipient_email_idx ON public.pending_shares(recipient_email);

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed):
-- ============================================================================
-- To rollback this migration, run the following:
--
-- DROP POLICY IF EXISTS "Users can view shared trips via trip_shares" ON public.trips;
-- DROP POLICY IF EXISTS "Users can view categories of accessible trips" ON public.trip_categories;
-- DROP POLICY IF EXISTS "Users can view their shares" ON public.trip_shares;
-- DROP POLICY IF EXISTS "Users can create shares for own trips" ON public.trip_shares;
-- DROP POLICY IF EXISTS "Users can delete shares for own trips" ON public.trip_shares;
-- DROP POLICY IF EXISTS "Users can view their pending shares" ON public.pending_shares;
-- DROP POLICY IF EXISTS "Users can create pending shares" ON public.pending_shares;
-- DROP POLICY IF EXISTS "Users can delete pending shares" ON public.pending_shares;
--
-- Then re-apply the original policies from supabase-enhanced-schema.sql
-- ============================================================================
