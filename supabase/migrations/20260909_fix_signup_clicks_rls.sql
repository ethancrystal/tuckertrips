-- Reconcile signup_clicks RLS and columns with the deployed database
-- Created: 2026-09-09
--
-- Background
-- ----------
-- Sign-up click tracking was failing in production with:
--   new row violates row-level security policy for table "signup_clicks"
--
-- The INSERT policy was never the problem: an anonymous INSERT succeeds. The
-- failure came from the API route issuing `.insert(...).select().single()`.
-- Postgres applies SELECT policies to `INSERT ... RETURNING`, and the SELECT
-- policy on this table is restricted to authenticated users, so the returning
-- clause tripped RLS for anonymous visitors.
--
-- The route now writes with the service role key (server-only, rate limited),
-- which is the real fix. This migration makes the checked-in schema match what
-- is actually deployed so a database rebuilt from these migrations behaves the
-- same way as production.

-- Columns present in the deployed table but missing from earlier migrations.
-- Note: 20260319_ip_tracking.sql added `ip_address`, but the deployed table and
-- the API route both use `ip_hash`. `page_url` is likewise deployed-only.
ALTER TABLE public.signup_clicks ADD COLUMN IF NOT EXISTS ip_hash TEXT;
ALTER TABLE public.signup_clicks ADD COLUMN IF NOT EXISTS page_url TEXT;

ALTER TABLE public.signup_clicks ENABLE ROW LEVEL SECURITY;

-- Recreate the policies idempotently under a single canonical name each, so the
-- repo and the deployed database stop drifting apart.
DROP POLICY IF EXISTS "Anyone can track signup clicks" ON public.signup_clicks;
DROP POLICY IF EXISTS "Anyone can insert signup clicks" ON public.signup_clicks;
DROP POLICY IF EXISTS "Authenticated users can view signup clicks" ON public.signup_clicks;

-- Public tracking: anonymous and authenticated visitors may record a click.
CREATE POLICY "Anyone can insert signup clicks"
  ON public.signup_clicks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Reads stay restricted. Admin analytics go through the service role, which
-- bypasses RLS entirely.
CREATE POLICY "Authenticated users can view signup clicks"
  ON public.signup_clicks FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON COLUMN public.signup_clicks.ip_hash IS 'IP address of the visitor who clicked the signup button';
COMMENT ON COLUMN public.signup_clicks.page_url IS 'URL of the page the signup button was clicked on';
