/**
 * Shared Trip API Route — GET /api/shared-trips/[id]
 *
 * Public-facing endpoint used by the /shared/[tripId] page.
 * Replaces the previous pattern where the client page directly queried
 * Supabase and performed its own access-control checks.
 *
 * Access rules (enforced server-side via checkTripAccess):
 *   - Public trips  → accessible by anyone, including unauthenticated guests
 *   - Shared trips  → accessible by the owner and users in trip_shares
 *   - Private trips → 403 Forbidden
 */

import { createSupabaseRouteClient } from '@/lib/supabase-server'
import { checkTripAccess } from '@/lib/trip-access-utils'
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  errorResponse,
} from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const supabase = createSupabaseRouteClient()

    // Resolve the requesting user — may be null for unauthenticated guests
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // checkTripAccess handles all visibility/share logic centrally
    const { canEdit } = await checkTripAccess(supabase, params.id, user?.id ?? null)

    // Fetch the full trip payload
    const { data: fullTrip, error } = await supabase
      .from('trips')
      .select(
        `*,
        profiles:profiles(id, full_name, avatar_url),
        trip_categories(*)`
      )
      .eq('id', params.id)
      .single()

    if (error) throw error

    return successResponse({ ...fullTrip, canEdit })
  } catch (error) {
    console.error('Shared trip fetch error:', error)

    if (error.message === 'Trip not found') return notFoundResponse('Trip not found')
    if (error.message === 'Access denied') return forbiddenResponse('This trip is private')

    return errorResponse('Failed to load trip', 500, error)
  }
}
