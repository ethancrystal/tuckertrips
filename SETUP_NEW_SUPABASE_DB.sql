-- Complete Tucker Trips Database Schema for New Supabase Project
-- Project: rogrzxjxtypzsempesrf
-- Run this ENTIRE file in your Supabase SQL Editor: 
-- https://supabase.com/dashboard/project/rogrzxjxtypzsempesrf/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- DROP EXISTING TABLES (clean slate)
-- =====================
DROP TABLE IF EXISTS public.signup_clicks CASCADE;
DROP TABLE IF EXISTS public.pending_shares CASCADE;
DROP TABLE IF EXISTS public.trip_shares CASCADE;
DROP TABLE IF EXISTS public.trip_categories CASCADE;
DROP TABLE IF EXISTS public.friendships CASCADE;
DROP TABLE IF EXISTS public.trips CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS trips_updated_at ON public.trips;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP VIEW IF EXISTS public.shared_trips_view;

-- =====================
-- CREATE TABLES
-- =====================

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trips table (main trip data)
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  trip_name TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  trip_type TEXT CHECK (trip_type IN ('taken', 'future')) DEFAULT 'future',
  visibility TEXT CHECK (visibility IN ('private', 'friends', 'public')) DEFAULT 'private',
  cover_image TEXT,
  cover_photo_url TEXT,
  photo_urls TEXT[],
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  is_shared BOOLEAN DEFAULT FALSE,
  shared_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trip_categories table
CREATE TABLE IF NOT EXISTS public.trip_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  category_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  average_price DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  big_wins TEXT,
  do_differently TEXT,
  timing_tips TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id, category_name)
);

-- Create friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Create trip_shares table (for sharing with existing members)
CREATE TABLE IF NOT EXISTS public.trip_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  shared_with UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  share_type TEXT CHECK (share_type IN ('email', 'link')) DEFAULT 'email',
  permission TEXT CHECK (permission IN ('view', 'edit')) DEFAULT 'view',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id, shared_with)
);

-- Create pending_shares table (for invitations to non-members)
CREATE TABLE IF NOT EXISTS public.pending_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_email TEXT NOT NULL,
  invite_link TEXT NOT NULL,
  claimed BOOLEAN DEFAULT FALSE,
  claimed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create signup_clicks table for admin analytics
CREATE TABLE IF NOT EXISTS public.signup_clicks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  session_id TEXT,
  user_agent TEXT,
  referrer TEXT,
  button_location TEXT CHECK (button_location IN ('header', 'hero_start_trip', 'hero_browse_trips', 'auth_modal_tab', 'auth_modal_submit')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- ENABLE ROW LEVEL SECURITY
-- =====================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signup_clicks ENABLE ROW LEVEL SECURITY;

-- =====================
-- PROFILES POLICIES
-- =====================
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================
-- TRIPS POLICIES
-- =====================
CREATE POLICY "Users can view own trips"
  ON public.trips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public trips"
  ON public.trips FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users can view shared trips"
  ON public.trips FOR SELECT
  USING (
    id IN (SELECT trip_id FROM public.trip_shares WHERE shared_with = auth.uid())
  );

CREATE POLICY "Users can view friends trips"
  ON public.trips FOR SELECT
  USING (
    visibility = 'friends' AND
    user_id IN (
      SELECT friend_id FROM public.friendships
      WHERE user_id = auth.uid() AND status = 'accepted'
      UNION
      SELECT user_id FROM public.friendships
      WHERE friend_id = auth.uid() AND status = 'accepted'
    )
  );

CREATE POLICY "Users can create own trips"
  ON public.trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips"
  ON public.trips FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips"
  ON public.trips FOR DELETE
  USING (auth.uid() = user_id);

-- =====================
-- TRIP CATEGORIES POLICIES
-- =====================
CREATE POLICY "Users can view categories of accessible trips"
  ON public.trip_categories FOR SELECT
  USING (
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
    OR
    trip_id IN (SELECT id FROM public.trips WHERE visibility = 'public')
    OR
    trip_id IN (SELECT trip_id FROM public.trip_shares WHERE shared_with = auth.uid())
  );

CREATE POLICY "Users can create categories for own trips"
  ON public.trip_categories FOR INSERT
  WITH CHECK (
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update categories for own trips"
  ON public.trip_categories FOR UPDATE
  USING (
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete categories for own trips"
  ON public.trip_categories FOR DELETE
  USING (
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  );

-- =====================
-- FRIENDSHIPS POLICIES
-- =====================
CREATE POLICY "Users can view own friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendships they're part of"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete own friendship requests"
  ON public.friendships FOR DELETE
  USING (auth.uid() = user_id);

-- =====================
-- TRIP SHARES POLICIES
-- =====================
CREATE POLICY "Users can view shares involving them"
  ON public.trip_shares FOR SELECT
  USING (auth.uid() = shared_by OR auth.uid() = shared_with);

CREATE POLICY "Users can create shares for own trips"
  ON public.trip_shares FOR INSERT
  WITH CHECK (
    shared_by = auth.uid() AND
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete shares they created"
  ON public.trip_shares FOR DELETE
  USING (auth.uid() = shared_by);

-- =====================
-- PENDING SHARES POLICIES
-- =====================
CREATE POLICY "Users can view pending shares they created"
  ON public.pending_shares FOR SELECT
  USING (auth.uid() = shared_by);

CREATE POLICY "Users can create pending shares for own trips"
  ON public.pending_shares FOR INSERT
  WITH CHECK (
    shared_by = auth.uid() AND
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view pending shares for their email"
  ON public.pending_shares FOR SELECT
  USING (
    recipient_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update pending shares claimed status"
  ON public.pending_shares FOR UPDATE
  USING (
    recipient_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- =====================
-- SIGNUP CLICKS POLICIES
-- =====================
CREATE POLICY "Anyone can track signup clicks"
  ON public.signup_clicks FOR INSERT
  WITH CHECK (true);

-- =====================
-- CREATE INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS trips_user_id_idx ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS trips_trip_type_idx ON public.trips(trip_type);
CREATE INDEX IF NOT EXISTS trips_visibility_idx ON public.trips(visibility);
CREATE INDEX IF NOT EXISTS trip_categories_trip_id_idx ON public.trip_categories(trip_id);
CREATE INDEX IF NOT EXISTS friendships_user_id_idx ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS friendships_friend_id_idx ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS trip_shares_trip_id_idx ON public.trip_shares(trip_id);
CREATE INDEX IF NOT EXISTS trip_shares_shared_with_idx ON public.trip_shares(shared_with);
CREATE INDEX IF NOT EXISTS pending_shares_recipient_email_idx ON public.pending_shares(recipient_email);
CREATE INDEX IF NOT EXISTS pending_shares_trip_id_idx ON public.pending_shares(trip_id);
CREATE INDEX IF NOT EXISTS signup_clicks_clicked_at_idx ON public.signup_clicks(clicked_at DESC);
CREATE INDEX IF NOT EXISTS signup_clicks_button_location_idx ON public.signup_clicks(button_location);

-- =====================
-- CREATE FUNCTIONS
-- =====================

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trips_updated_at BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================
-- COMMENTS
-- =====================
COMMENT ON TABLE public.profiles IS 'User profile information extending auth.users';
COMMENT ON TABLE public.trips IS 'Main trips table with user_id foreign key';
COMMENT ON TABLE public.trip_categories IS 'Category ratings for trips';
COMMENT ON TABLE public.friendships IS 'User friendship relationships for social features';
COMMENT ON TABLE public.trip_shares IS 'Trip sharing functionality for sharing trips with other users';
COMMENT ON TABLE public.pending_shares IS 'Pending invitations to non-members';
COMMENT ON TABLE public.signup_clicks IS 'Tracks Sign-Up button clicks for conversion analytics';

-- =====================
-- SUCCESS MESSAGE
-- =====================
DO $$
BEGIN
  RAISE NOTICE 'Tucker Trips database schema created successfully!';
END $$;
