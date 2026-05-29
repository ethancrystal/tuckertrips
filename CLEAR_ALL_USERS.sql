-- ============================================
-- CLEAR ALL USERS FROM DATABASE
-- ============================================
-- This will delete ALL users and their associated data
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/rogrzxjxtypzsempesrf/sql
-- ============================================

-- WARNING: This will delete ALL data. Make sure you want to do this!

-- Step 1: Delete from all tables that reference users (in correct order due to foreign keys)
DELETE FROM public.trip_shares;
DELETE FROM public.pending_shares;
DELETE FROM public.trip_categories;
DELETE FROM public.trips;
DELETE FROM public.friendships;
DELETE FROM public.messages;
DELETE FROM public.profiles;

-- Step 2: Delete from auth.users (requires service role access)
-- Note: This must be done from the Supabase dashboard SQL Editor
-- or using the service role key

DELETE FROM auth.users WHERE true;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check if all tables are empty:
-- SELECT COUNT(*) FROM public.profiles;
-- SELECT COUNT(*) FROM public.trips;
-- SELECT COUNT(*) FROM auth.users;

-- ============================================
-- ALTERNATIVE: Delete specific users by email
-- ============================================

-- If you only want to delete specific users, use this instead:
-- DELETE FROM public.profiles WHERE email IN ('user1@example.com', 'user2@example.com');
-- DELETE FROM public.trips WHERE user_id IN (SELECT id FROM auth.users WHERE email IN ('user1@example.com', 'user2@example.com'));
-- DELETE FROM auth.users WHERE email IN ('user1@example.com', 'user2@example.com');

-- ============================================
-- NOTES
-- ============================================
-- 1. This script uses CASCADE deletes where possible
-- 2. The auth.users table deletion requires admin privileges
-- 3. After running this, you can register with the same email addresses
-- 4. All trip data, friendships, and messages will be permanently deleted
