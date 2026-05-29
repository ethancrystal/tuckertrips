-- Add policy to allow users to view trips that have been explicitly shared with them
-- This enables Private trips to be visible to email recipients

CREATE POLICY "Users can view trips shared with them"
  ON public.trips FOR SELECT
  USING (
    id IN (
      SELECT trip_id
      FROM public.trip_shares
      WHERE shared_with = auth.uid()
    )
  );
