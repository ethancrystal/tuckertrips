// Individual Trip API Routes — GET, PATCH, DELETE
// Uses withAuth HOF; checkTripAccess is imported from the shared utility.

import { withAuth } from '@/lib/auth-middleware'
import { checkTripAccess } from '@/lib/trip-access-utils'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  forbiddenResponse,
} from '@/lib/api-response'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const airlineSchema = z.object({
  name: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  cost: z.string().optional(),
  flightClass: z.string().optional(),
  notes: z.string().optional(),
})

const accommodationSchema = z.object({
  type: z.string().optional(),
  name: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  url: z.string().url().optional().or(z.literal('')),
  address: z.string().optional(),
  pricePerNight: z.string().optional(),
  notes: z.string().optional(),
})

const segmentSchema = z.object({
  title: z.string().min(1, 'Segment title is required'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  activities: z.array(z.string()).optional(),
  photos: z.array(z.string().url()).optional(),
})

const tripUpdateSchema = z
  .object({
    trip_name: z.string().min(1).max(200).optional(),
    destination: z.string().min(1).max(200).optional(),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
    trip_type: z.enum(['taken', 'future']).optional(),
    visibility: z.enum(['private', 'friends', 'public']).optional(),
    cover_image: z.string().nullable().optional(),
    overall_rating: z.number().int().min(1).max(5).nullable().optional(),
    description: z.string().max(2000).nullable().optional(),
    weather: z.string().max(500).nullable().optional(),
    overall_comment: z.string().max(2000).nullable().optional(),
    airlines: z.array(airlineSchema).optional(),
    accommodations: z.array(accommodationSchema).optional(),
    segments: z.array(segmentSchema).optional(),
    trip_images: z.array(z.string()).optional(),
    photo_urls: z.array(z.string().url()).optional(),
    /** @deprecated Use trip_shares table instead */
    shared_with: z.array(z.string().uuid()).optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return new Date(data.end_date) >= new Date(data.start_date)
      }
      return true
    },
    { message: 'End date must be after or equal to start date', path: ['end_date'] }
  )

// ---------------------------------------------------------------------------
// Field mapping helpers
// ---------------------------------------------------------------------------

const mapTripUpdate = (updates) => {
  const payload = {}

  if ('trip_name' in updates && typeof updates.trip_name === 'string') {
    payload.trip_name = updates.trip_name.trim()
  }
  if ('destination' in updates && typeof updates.destination === 'string') {
    payload.destination = updates.destination.trim()
  }
  if ('trip_type' in updates) payload.trip_type = updates.trip_type
  if ('visibility' in updates) payload.visibility = updates.visibility
  if ('start_date' in updates) payload.start_date = updates.start_date || null
  if ('end_date' in updates) payload.end_date = updates.end_date || null
  if ('cover_image' in updates) payload.cover_image = updates.cover_image || null
  if ('overall_rating' in updates) payload.overall_rating = updates.overall_rating || null

  payload.updated_at = new Date().toISOString()
  return payload
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

// GET — Fetch a specific trip (owner, shared users, or public)
export const GET = withAuth(async (request, { params }) => {
  try {
    const { user, supabase } = request
    const { trip, canEdit } = await checkTripAccess(supabase, params.id, user.id)

    const { data: fullTrip, error } = await supabase
      .from('trips')
      .select('*, profiles:profiles(id, full_name, avatar_url), trip_categories(*)')
      .eq('id', params.id)
      .single()

    if (error) throw error

    return successResponse({ ...fullTrip, canEdit })
  } catch (error) {
    console.error('Get trip error:', error)
    if (error.message === 'Trip not found') return notFoundResponse('Trip not found')
    if (error.message === 'Access denied') return forbiddenResponse('Access denied')
    return errorResponse('Failed to get trip', 500, error)
  }
})

// PATCH — Update a trip (owner only)
export const PATCH = withAuth(async (request, { params }) => {
  try {
    const { user, supabase } = request
    const { canEdit } = await checkTripAccess(supabase, params.id, user.id)

    if (!canEdit) return forbiddenResponse('Cannot edit this trip')

    const body = await request.json()
    const parsed = tripUpdateSchema.safeParse(body)
    if (!parsed.success) return validationErrorResponse(parsed.error.errors)

    const { data: updatedTrip, error } = await supabase
      .from('trips')
      .update({ ...mapTripUpdate(parsed.data), updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return successResponse(updatedTrip)
  } catch (error) {
    console.error('Update trip error:', error)
    if (error.message === 'Trip not found') return notFoundResponse('Trip not found')
    if (error.message === 'Access denied') return forbiddenResponse('Access denied')
    return errorResponse('Failed to update trip', 500, error)
  }
})

// DELETE — Delete a trip (owner only)
export const DELETE = withAuth(async (request, { params }) => {
  try {
    const { user, supabase } = request
    const { canEdit } = await checkTripAccess(supabase, params.id, user.id)

    if (!canEdit) return forbiddenResponse('Cannot delete this trip')

    const { error } = await supabase.from('trips').delete().eq('id', params.id)
    if (error) throw error

    return successResponse({ deleted: true })
  } catch (error) {
    console.error('Delete trip error:', error)
    if (error.message === 'Trip not found') return notFoundResponse('Trip not found')
    if (error.message === 'Access denied') return forbiddenResponse('Cannot delete this trip')
    return errorResponse('Failed to delete trip', 500, error)
  }
})
