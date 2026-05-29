-- ============================================
-- FIX DATABASE SCHEMA INCONSISTENCIES
-- ============================================
-- Run this in Supabase SQL Editor to fix schema issues
-- https://supabase.com/dashboard/project/rogrzxjxtypzsempesrf/sql
-- ============================================

-- 1. Add updated_at column to messages table
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create trigger to update updated_at for messages
CREATE OR REPLACE FUNCTION public.update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS messages_updated_at ON public.messages;

CREATE TRIGGER messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_messages_updated_at();

-- 3. Add aliases/comments for clarity
COMMENT ON COLUMN messages.updated_at IS 'Last time the message was modified';

-- 4. Ensure trip_name and title are both handled
-- (Note: We keep both fields for compatibility, add comment for clarity)
COMMENT ON COLUMN trips.trip_name IS 'Primary trip name (use this field)';
COMMENT ON COLUMN trips.title IS 'Alternate title field (legacy, use trip_name)';

-- 5. Add trigger to sync title with trip_name for consistency
CREATE OR REPLACE FUNCTION public.sync_trip_title()
RETURNS TRIGGER AS $$
BEGIN
  -- If trip_name is set but title is not, sync them
  IF NEW.trip_name IS NOT NULL AND (OLD.trip_name IS NULL OR OLD.trip_name !== NEW.trip_name) THEN
    NEW.title = NEW.trip_name;
  END IF;
  -- If title is set but trip_name is not, sync them
  IF NEW.title IS NOT NULL AND (OLD.title IS NULL OR OLD.title !== NEW.title) THEN
    NEW.trip_name = NEW.title;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_trip_name_title ON public.trips;

CREATE TRIGGER sync_trip_name_title
  BEFORE INSERT OR UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_trip_title();

-- 6. Fix restaurant/food category naming inconsistency
-- Add a comment to clarify the mapping
COMMENT ON COLUMN trip_categories.category_name IS '
  Category type: rental, food, accommodation, airline, excursions
  Note: "food" and "restaurant" both refer to dining experiences
';

-- 7. Add helper function to get normalized category name
CREATE OR REPLACE FUNCTION public.normalize_category_name(category TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Map restaurant to food for consistency
  IF category = 'restaurant' THEN
    RETURN 'food';
  END IF;
  -- Map dining to food
  IF category = 'dining' THEN
    RETURN 'food';
  END IF;
  RETURN category;
END;
$$ LANGUAGE plpgsql;

-- 8. Add index for better performance on messages
CREATE INDEX IF NOT EXISTS messages_updated_at_idx ON public.messages(updated_at DESC);

-- 9. Add composite index for trips visibility queries
CREATE INDEX IF NOT EXISTS trips_visibility_user_idx ON public.trips(visibility, user_id)
  WHERE visibility IN ('public', 'friends');

-- 10. Verification queries
-- SELECT '✅ Schema fixes applied successfully!' as status;
