-- ============================================================================
-- Tucker Trips - Add Missing Tables
-- ============================================================================
-- Run this in: https://supabase.com/dashboard/project/rogrzxjxtypzsempesrf/sql
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TRIP CATEGORIES TABLE
-- ============================================================================
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id, category_name)
);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- FRIENDSHIPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- ============================================================================
-- TRIP SHARES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trip_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  shared_with UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  share_type TEXT CHECK (share_type IN ('email', 'link')) DEFAULT 'email',
  permissions TEXT CHECK (permissions IN ('view', 'edit', 'comment')) DEFAULT 'view',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id, shared_with)
);

-- ============================================================================
-- PENDING SHARES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pending_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_email TEXT NOT NULL,
  invite_link TEXT NOT NULL,
  claimed BOOLEAN DEFAULT FALSE,
  claimed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.trip_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_shares ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Trip Categories Policies
CREATE POLICY "Users can view categories of accessible trips"
  ON public.trip_categories FOR SELECT USING (
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
    OR trip_id IN (SELECT id FROM public.trips WHERE visibility = 'public')
  );

CREATE POLICY "Users can create categories for own trips"
  ON public.trip_categories FOR INSERT WITH CHECK (
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update categories for own trips"
  ON public.trip_categories FOR UPDATE USING (
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete categories for own trips"
  ON public.trip_categories FOR DELETE USING (
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  );

-- Messages Policies
CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received messages"
  ON public.messages FOR UPDATE USING (auth.uid() = recipient_id);

CREATE POLICY "Users can delete own sent messages"
  ON public.messages FOR DELETE USING (auth.uid() = sender_id);

-- Friendships Policies
CREATE POLICY "Users can view own friendships"
  ON public.friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships"
  ON public.friendships FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendships they're part of"
  ON public.friendships FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete own friendship requests"
  ON public.friendships FOR DELETE USING (auth.uid() = user_id);

-- Trip Shares Policies
CREATE POLICY "Users can view shares involving them"
  ON public.trip_shares FOR SELECT USING (auth.uid() = shared_by OR auth.uid() = shared_with);

CREATE POLICY "Users can create shares for own trips"
  ON public.trip_shares FOR INSERT WITH CHECK (
    shared_by = auth.uid() AND
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete shares they created"
  ON public.trip_shares FOR DELETE USING (auth.uid() = shared_by);

-- Pending Shares Policies
CREATE POLICY "Users can view pending shares they created"
  ON public.pending_shares FOR SELECT USING (auth.uid() = shared_by);

CREATE POLICY "Users can create pending shares for own trips"
  ON public.pending_shares FOR INSERT WITH CHECK (
    shared_by = auth.uid() AND
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view pending shares for their email"
  ON public.pending_shares FOR SELECT USING (
    recipient_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS trip_categories_trip_id_idx ON public.trip_categories(trip_id);
CREATE INDEX IF NOT EXISTS trip_categories_category_name_idx ON public.trip_categories(category_name);

CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_recipient_id_idx ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at);

CREATE INDEX IF NOT EXISTS friendships_user_id_idx ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS friendships_friend_id_idx ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS friendships_status_idx ON public.friendships(status);

CREATE INDEX IF NOT EXISTS trip_shares_trip_id_idx ON public.trip_shares(trip_id);
CREATE INDEX IF NOT EXISTS trip_shares_shared_with_idx ON public.trip_shares(shared_with);
CREATE INDEX IF NOT EXISTS trip_shares_shared_by_idx ON public.trip_shares(shared_by);

CREATE INDEX IF NOT EXISTS pending_shares_recipient_email_idx ON public.pending_shares(recipient_email);
CREATE INDEX IF NOT EXISTS pending_shares_trip_id_idx ON public.pending_shares(trip_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trip_categories_updated_at BEFORE UPDATE ON public.trip_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER friendships_updated_at BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- DONE - Missing tables added!
-- ============================================================================
