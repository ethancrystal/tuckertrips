-- Add IP tracking to profiles and signup_clicks
-- Created: 2026-03-19

-- Add registration_ip to profiles to track account creation source
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registration_ip TEXT;

-- Add ip_address to signup_clicks for better click analytics
ALTER TABLE public.signup_clicks ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Add index for IP lookups
CREATE INDEX IF NOT EXISTS profiles_registration_ip_idx ON public.profiles(registration_ip);
CREATE INDEX IF NOT EXISTS signup_clicks_ip_address_idx ON public.signup_clicks(ip_address);

-- Update handle_new_user function to include registration_ip from metadata
-- Supabase can pass IP through raw_user_meta_data if we set it during signUp
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, registration_ip)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'registration_ip'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON COLUMN public.profiles.registration_ip IS 'IP address used during account registration for limiting accounts per IP';
COMMENT ON COLUMN public.signup_clicks.ip_address IS 'IP address of the user who clicked the signup button';
