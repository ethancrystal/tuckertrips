-- Sign-Up Button Click Analytics
-- This migration adds tracking for Sign-Up button clicks to measure conversion funnel performance
-- Created: 2026-02-19

-- Create signup_clicks table
CREATE TABLE IF NOT EXISTS public.signup_clicks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  session_id TEXT,
  user_agent TEXT,
  referrer TEXT,
  button_location TEXT CHECK (button_location IN ('header', 'hero_start_trip', 'hero_browse_trips', 'auth_modal_tab', 'auth_modal_submit')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS signup_clicks_clicked_at_idx ON public.signup_clicks(clicked_at DESC);
CREATE INDEX IF NOT EXISTS signup_clicks_button_location_idx ON public.signup_clicks(button_location);
CREATE INDEX IF NOT EXISTS signup_clicks_session_id_idx ON public.signup_clicks(session_id);

-- Enable Row Level Security
ALTER TABLE public.signup_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow anyone to insert (public tracking)
CREATE POLICY "Anyone can track signup clicks"
  ON public.signup_clicks FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Only admins can view analytics (handled by service role in API)
-- No SELECT policy for regular users - only accessible via admin API

-- Add helpful comment
COMMENT ON TABLE public.signup_clicks IS 'Tracks Sign-Up button clicks for conversion analytics. Public insert, admin-only read.';
COMMENT ON COLUMN public.signup_clicks.button_location IS 'Location of the Sign-Up button: header, hero_start_trip, hero_browse_trips, auth_modal_tab, auth_modal_submit';
COMMENT ON COLUMN public.signup_clicks.session_id IS 'Anonymous session identifier for tracking unique visitors';
COMMENT ON COLUMN public.signup_clicks.user_agent IS 'Browser user agent string for device tracking';
COMMENT ON COLUMN public.signup_clicks.referrer IS 'Referrer URL for traffic source tracking';
