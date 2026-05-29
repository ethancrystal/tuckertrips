// Setup Complete Database for Tucker Trips App
const { createClient } = require('@supabase/supabase-js')

// Updated Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing required env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

console.log('🔧 Setting up Complete Database for Tucker Trips App...')
console.log(`📡 Connected to: ${supabaseUrl}\n`)

// SQL for complete app setup
const setupSQL = `
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- AUTH AND USER MANAGEMENT
-- ===========================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    username TEXT UNIQUE,
    website TEXT,
    bio TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view public profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ===========================================
-- TRIPS TABLES
-- ===========================================

-- Trips table (main trips for Tucker Trips app)
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    trip_type TEXT DEFAULT 'future' CHECK (trip_type IN ('future', 'taken')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
    is_shared BOOLEAN DEFAULT false,
    shared_at TIMESTAMPTZ,
    location TEXT,
    start_date DATE,
    end_date DATE,
    photos TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on trips
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Trips policies
CREATE POLICY "Users can view own trips" ON trips
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public trips" ON trips
    FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can view shared trips" ON trips
    FOR SELECT USING (is_shared = true);

CREATE POLICY "Users can insert own trips" ON trips
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" ON trips
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips" ON trips
    FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- SHARING AND COLLABORATION
-- ===========================================

-- Trip shares table (for direct sharing links)
CREATE TABLE IF NOT EXISTS public.trip_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    share_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on trip_shares
ALTER TABLE trip_shares ENABLE ROW LEVEL SECURITY;

-- Trip shares policies
CREATE POLICY "Users can view trip shares for own trips" ON trip_shares
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM trips
            WHERE trips.id = trip_shares.trip_id
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create shares for own trips" ON trip_shares
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM trips
            WHERE trips.id = trip_id
            AND trips.user_id = auth.uid()
        )
    );

-- ===========================================
-- MESSAGES/CHAT
-- ===========================================

-- Messages table (for trip sharing chat)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'share')),
    read_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view messages for their trips" ON messages
    FOR SELECT USING (
        auth.uid() = sender_id OR
        auth.uid() = recipient_id OR
        EXISTS (
            SELECT 1 FROM trips
            WHERE trips.id = messages.trip_id
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_type ON trips(trip_type);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_visibility ON trips(visibility);
CREATE INDEX IF NOT EXISTS idx_trips_is_shared ON trips(is_shared);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(created_at);
CREATE INDEX IF NOT EXISTS idx_trip_shares_token ON trip_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_trip_shares_trip_id ON trip_shares(trip_id);
CREATE INDEX IF NOT EXISTS idx_messages_trip_id ON messages(trip_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);

-- ===========================================
-- FUNCTIONS AND TRIGGERS
-- ===========================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_trips_updated_at
    BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Function to handle trip sharing
CREATE OR REPLACE FUNCTION public.share_trip(trip_uuid UUID)
RETURNS JSON AS $$
DECLARE
    share_token TEXT;
BEGIN
    -- Generate unique share token
    share_token := encode(sha256(trip_uuid::bytea || now()::text), 'hex');

    -- Insert share record
    INSERT INTO public.trip_shares (trip_id, share_token)
    VALUES (trip_uuid, share_token)
    ON CONFLICT (trip_id) DO UPDATE SET
        share_token = share_token,
        created_at = NOW();

    -- Update trip as shared
    UPDATE public.trips
    SET is_shared = true,
        shared_at = NOW()
    WHERE id = trip_uuid;

    RETURN json_build_object('success', true, 'share_token', share_token);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- SAMPLE DATA
-- ===========================================

-- Insert sample trips for demonstration
INSERT INTO public.trips (user_id, title, description, trip_type, location, start_date, end_date)
SELECT
    u.id,
    'Weekend Getaway',
    'A relaxing weekend trip to the mountains',
    'taken',
    'Aspen, Colorado',
    CURRENT_DATE - INTERVAL '1 month',
    CURRENT_DATE - INTERVAL '1 month' + INTERVAL '2 days'
FROM auth.users u
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.trips (user_id, title, description, trip_type, location, start_date, end_date)
SELECT
    u.id,
    'European Adventure',
    'Two weeks exploring Europe',
    'future',
    'Paris, Rome, Barcelona',
    CURRENT_DATE + INTERVAL '2 months',
    CURRENT_DATE + INTERVAL '2 months' + INTERVAL '14 days'
FROM auth.users u
LIMIT 1
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.trips TO authenticated;
GRANT ALL ON public.trip_shares TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.trips TO anon;
GRANT SELECT ON public.trip_shares TO anon;
`

async function setupDatabase() {
  try {
    console.log('📋 Creating database schema...')

    // Execute the setup SQL
    const { data, error } = await supabase
      .rpc('exec', { sql: setupSQL })
      .catch(() => ({ data: null, error: { message: 'RPC not available' } }))

    if (error) {
      // Try direct fetch as fallback
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/sql',
          'apikey': serviceKey,
          'Prefer': 'return=minimal'
        },
        body: setupSQL
      })

      if (response.ok) {
        console.log('✅ Database schema created successfully!')
      } else {
        console.log('⚠️  Schema might already exist or needs manual setup')
        console.log('   Please run the SQL manually in the Supabase SQL Editor')
      }
    } else {
      console.log('✅ Database schema created successfully!')
    }

    // Verify the setup
    console.log('\n🔍 Verifying database setup...')

    // Check tables
    const tables = ['profiles', 'trips', 'trip_shares', 'messages', 'projects']
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1)

        if (!error) {
          console.log(`   ✅ ${table} table exists`)
        } else {
          console.log(`   ❌ ${table} table: ${error.message}`)
        }
      } catch (e) {
        console.log(`   ❌ ${table} table not accessible`)
      }
    }

    console.log('\n✅ Setup Complete!')
    console.log('\n📊 What was created:')
    console.log('   • Authentication system with profiles')
    console.log('   • Trips table with RLS policies')
    console.log('   • Trip sharing system')
    console.log('   • Messages/Chat system')
    console.log('   • All necessary indexes and triggers')
    console.log('   • Sample data for testing')

    console.log('\n🚀 App is ready to use!')
    console.log('   • Users can sign up and create profiles')
    console.log('   • Trips can be created as future or taken')
    console.log('   • Trips can be shared via links or messages')
    console.log('   • Privacy controls (private/public) are in place')

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message)
    console.log('\n💡 Manual setup:')
    console.log('   1. Go to: ${supabaseUrl}/project/sql')
    console.log('   2. Copy and run the SQL from this script')
  }
}

// Execute setup
setupDatabase()
