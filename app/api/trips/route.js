// Trips API Routes
// CRUD operations for trips using Supabase

import { NextResponse } from 'next/server'
import { createSupabaseRouteClient } from '@/lib/supabase-server'
import { authenticateOrThrow } from '@/lib/auth-middleware'
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse } from '@/lib/api-response'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Nested data validation schemas
const airlineSchema = z.object({
  name: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  cost: z.string().optional(),
  flightClass: z.string().optional(),
  notes: z.string().optional()
})

const accommodationSchema = z.object({
  type: z.string().optional(),
  name: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  url: z.string().url().optional().or(z.literal('')),
  address: z.string().optional(),
  pricePerNight: z.string().optional(),
  notes: z.string().optional()
})

const segmentSchema = z.object({
  title: z.string().min(1, 'Segment title is required'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  activities: z.array(z.string()).optional(),
  photos: z.array(z.string().url()).optional()
})

// Main trip schema with nested validation
const tripSchema = z.object({
  trip_name: z.string().min(1, 'Trip name is required').max(200, 'Trip name too long'),
  destination: z.string().min(1, 'Destination is required').max(200, 'Destination too long'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  trip_type: z.enum(['taken', 'future']).optional(),
  visibility: z.enum(['private', 'friends', 'public']).optional(),
  cover_image: z.string().optional(),
  overall_rating: z.number().int().min(1).max(5).optional(),
  description: z.string().max(2000).optional(),
  weather: z.string().max(500).optional(),
  overall_comment: z.string().max(2000).optional(),
  airlines: z.array(airlineSchema).optional(),
  accommodations: z.array(accommodationSchema).optional(),
  segments: z.array(segmentSchema).optional(),
  trip_images: z.array(z.string()).optional(),
  photo_urls: z.array(z.string().url()).optional()
}).refine((data) => {
  // Validate that end_date is after start_date if both are provided
  if (data.start_date && data.end_date) {
    const start = new Date(data.start_date)
    const end = new Date(data.end_date)
    return end >= start
  }
  return true
}, {
  message: 'End date must be after or equal to start date',
  path: ['end_date']
})

const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  if (value === undefined || value === null) return []
  if (typeof value === 'string') {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return [String(value)]
}

const mapTripInsert = (data, userId) => ({
  user_id: userId,
  trip_name: data.trip_name.trim(),
  destination: data.destination.trim(),
  trip_type: data.trip_type || 'future',
  visibility: data.visibility || 'private',
  start_date: data.start_date || null,
  end_date: data.end_date || null,
  cover_image: data.cover_image || null,
  overall_rating: data.overall_rating || null,
})

const mapTripResponse = (trip) => {
  if (!trip) return trip
  // Return trip data as-is from database (already uses correct column names)
  return trip
}


// GET - Get user's trips
export async function GET(request) {
  try {
    const supabase = createSupabaseRouteClient()
    const user = await authenticateOrThrow(request, supabase)

    const { searchParams } = new URL(request.url)
    const includePublic = searchParams.get('public') === 'true'
    const includeShared = searchParams.get('shared') === 'true'

    let query = supabase
      .from('trips')
      .select(`
        *,
        profiles:profiles(id, full_name, avatar_url)
      `)

    if (includePublic) {
      query = query.or(`visibility.eq.public,user_id.eq.${user.id}`)
    } else if (includeShared) {
      const { data: shares } = await supabase
        .from('trip_shares')
        .select('trip_id')
        .eq('shared_with', user.id)

      const sharedTripIds = (shares || []).map(s => s.trip_id)

      if (sharedTripIds.length > 0) {
        query = query.or(`user_id.eq.${user.id},id.in.(${sharedTripIds.join(',')})`)
      } else {
        query = query.eq('user_id', user.id)
      }
    } else {
      query = query.eq('user_id', user.id)
    }

    const { data: trips, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return successResponse((trips || []).map(mapTripResponse))

  } catch (error) {
    console.error('Get trips error:', error)

    if (error.message === 'Not authenticated') {
      return unauthorizedResponse()
    }

    return errorResponse('Failed to get trips', 500, error.message)
  }
}

// POST - Create new trip
export async function POST(request) {
  try {
    const supabase = createSupabaseRouteClient()
    const user = await authenticateOrThrow(request, supabase)
    const body = await request.json()

    // Validate input
    const validatedData = tripSchema.parse(body)

    const { data: trip, error } = await supabase
      .from('trips')
      .insert(mapTripInsert(validatedData, user.id))
      .select()
      .single()

    if (error) throw error

    return successResponse(mapTripResponse(trip), 201)

  } catch (error) {
    console.error('Create trip error:', error)

    if (error instanceof z.ZodError) {
      return validationErrorResponse(error.errors)
    }

    if (error.message === 'Not authenticated') {
      return unauthorizedResponse()
    }

    return errorResponse('Failed to create trip', 500, error.message)
  }
}
