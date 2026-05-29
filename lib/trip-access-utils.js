/**
 * Trip Access Control Utilities
 *
 * Centralises all trip-level authorisation logic so that API routes and
 * server utilities share a single, auditable source of truth.
 *
 * Previously this logic was duplicated across:
 *   - app/api/trips/[id]/route.js  (inline checkTripAccess)
 *   - app/shared/[tripId]/page.js  (client-side manual DB queries)
 *
 * Rules enforced:
 *   1. Trip owner  → full read + write access (canEdit: true)
 *   2. Public trip → read-only access for anyone, including unauthenticated
 *   3. Shared trip → read-only access for users listed in trip_shares
 *   4. Everything else → Access denied (throws, caller maps to 403)
 */

/**
 * Resolves whether a given user (or anonymous visitor) may access a trip,
 * and whether they have edit rights.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} tripId  - UUID of the trip to check
 * @param {string|null} userId - UUID of the requesting user, or null for guests
 * @returns {Promise<{ trip: object, canEdit: boolean }>}
 * @throws {Error} 'Trip not found' | 'Access denied'
 */
export async function checkTripAccess(supabase, tripId, userId) {
  const { data: trip, error } = await supabase
    .from('trips')
    .select('id, user_id, visibility')
    .eq('id', tripId)
    .single()

  if (error || !trip) {
    throw new Error('Trip not found')
  }

  // Rule 1: Owner gets full access
  if (userId && trip.user_id === userId) {
    return { trip, canEdit: true }
  }

  // Rule 2: Public trips are readable by anyone (including guests)
  if (trip.visibility === 'public') {
    return { trip, canEdit: false }
  }

  // Rules 3 & 4: Only authenticated users can be on the share list
  if (userId) {
    const { data: share } = await supabase
      .from('trip_shares')
      .select('id')
      .eq('trip_id', tripId)
      .eq('shared_with', userId)
      .limit(1)
      .maybeSingle()

    if (share) {
      return { trip, canEdit: false }
    }
  }

  throw new Error('Access denied')
}
