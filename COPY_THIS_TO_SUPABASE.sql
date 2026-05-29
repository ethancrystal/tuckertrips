-- ============================================
-- TUCKER TRIPS - COMPLETE DATABASE SCHEMA
-- ============================================
-- Instructions:
-- 1. Go to: https://supabase.com/dashboard/project/rogrzxjxtypzsempesrf/sql
-- 2. Click "New Query"
-- 3. Copy EVERYTHING below this line
er();

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trips table
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
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trip_categories table
CREATE TABLE IF NOT EXISTS public.trip_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  category_name TEXT CHECK (category_name IN ('rental', 'food', 'accommodation', 'airline', 'excursions')) NOT NULL,
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

-- Create trip_shares table
CREATE TABLE IF NOT EXISTS public.trip_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  shared_with UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  permission TEXT CHECK (permission IN ('view', 'edit')) DEFAULT 'view',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id, shared_with)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_shares ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trips policies
CREATE POLICY "Users can view own trips" ON public.trips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public trips" ON public.trips FOR SELECT USING (visibility = 'public');
CREATE POLICY "Users can view friends trips" ON public.trips FOR SELECT USING (visibility = 'friends' AND user_id IN (SELECT friend_id FROM public.friendships WHERE user_id = auth.uid() AND status = 'accepted' UNION SELECT user_id FROM public.friendships WHERE friend_id = auth.uid() AND status = 'accepted'));
CREATE POLICY "Users can create own trips" ON public.trips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trips" ON public.trips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trips" ON public.trips FOR DELETE USING (auth.uid() = user_id);

-- Trip categories policies
CREATE POLICY "Users can view categories of accessible trips" ON public.trip_categories FOR SELECT USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()) OR trip_id IN (SELECT id FROM public.trips WHERE visibility = 'public') OR trip_id IN (SELECT id FROM public.trips WHERE visibility = 'friends' AND user_id IN (SELECT friend_id FROM public.friendships WHERE user_id = auth.uid() AND status = 'accepted' UNION SELECT user_id FROM public.friendships WHERE friend_id = auth.uid() AND status = 'accepted')));
CREATE POLICY "Users can create categories for own trips" ON public.trip_categories FOR INSERT WITH CHECK (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));
CREATE POLICY "Users can update categories for own trips" ON public.trip_categories FOR UPDATE USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete categories for own trips" ON public.trip_categories FOR DELETE USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

-- Friendships policies
CREATE POLICY "Users can view own friendships" ON public.friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can create friendships" ON public.friendships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update friendships they're part of" ON public.friendships FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can delete own friendship requests" ON public.friendships FOR DELETE USING (auth.uid() = user_id);

-- Trip shares policies
CREATE POLICY "Users can view trips shared with them" ON public.trip_shares FOR SELECT USING (auth.uid() = shared_with);
CREATE POLICY "Users can view trips they shared" ON public.trip_shares FOR SELECT USING (auth.uid() = shared_by);
CREATE POLICY "Users can create trip shares" ON public.trip_shares FOR INSERT WITH CHECK (auth.uid() = shared_by);
CREATE POLICY "Users can delete trips they shared" ON public.trip_shares FOR DELETE USING (auth.uid() = shared_by);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS trips_user_id_idx ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS trips_trip_type_idx ON public.trips(trip_type);
CREATE INDEX IF NOT EXISTS trips_visibility_idx ON public.trips(visibility);
CREATE INDEX IF NOT EXISTS trip_categories_trip_id_idx ON public.trip_categories(trip_id);
CREATE INDEX IF NOT EXISTS friendships_user_id_idx ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS friendships_friend_id_idx ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS trip_shares_trip_id_idx ON public.trip_shares(trip_id);
CREATE INDEX IF NOT EXISTS trip_shares_shared_with_idx ON public.trip_shares(shared_with);

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

-- Add comments to document the schema
COMMENT ON TABLE public.profiles IS 'User profile information extending auth.users';
COMMENT ON TABLE public.trips IS 'Main trips table with user_id foreign key';
COMMENT ON TABLE public.trip_categories IS 'Category ratings for trips (rental, food, accommodation, airline, excursions)';
COMMENT ON TABLE public.friendships IS 'User friendship relationships for social features';
COMMENT ON TABLE public.trip_shares IS 'Trip sharing functionality for sharing trips with other users';
