// Type Mapping Utilities
// Convert between camelCase (API/frontend) and snake_case (database)

import type { Profile, Trip } from '@/types/database'
import type { AuthUser } from '@/types/api'

// ============================================================================
// Generic Case Conversion Functions
// ============================================================================

/**
 * Convert an object's keys from snake_case to camelCase
 */
export function snakeToCamel<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())

    // Recursively handle nested objects
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[camelKey] = snakeToCamel(value)
    } else if (Array.isArray(value)) {
      // Handle arrays of objects
      result[camelKey] = value.map(item =>
        item && typeof item === 'object' ? snakeToCamel(item) : item
      )
    } else {
      result[camelKey] = value
    }
  }

  return result
}

/**
 * Convert an object's keys from camelCase to snake_case
 */
export function camelToSnake<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)

    // Recursively handle nested objects
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[snakeKey] = camelToSnake(value)
    } else if (Array.isArray(value)) {
      // Handle arrays of objects
      result[snakeKey] = value.map(item =>
        item && typeof item === 'object' ? camelToSnake(item) : item
      )
    } else {
      result[snakeKey] = value
    }
  }

  return result
}

// ============================================================================
// Profile-Specific Mappers
// ============================================================================

/**
 * Convert database Profile to API AuthUser format
 */
export function profileToAuthUser(profile: Profile): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name || '',
    bio: profile.bio || undefined,
    avatarUrl: profile.avatar_url || undefined,
    coverPhotoUrl: profile.cover_photo_url || undefined,
    isOnline: profile.is_online || false,
    lastSeen: profile.last_seen || undefined
  }
}

/**
 * Convert API AuthUser to database Profile format (partial)
 */
export function authUserToProfile(user: AuthUser): Partial<Profile> {
  const profile: Partial<Profile> = {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    bio: user.bio || null,
    avatar_url: user.avatarUrl || null,
    cover_photo_url: user.coverPhotoUrl || null,
    is_online: user.isOnline || false
  }

  if (user.lastSeen !== undefined) {
    profile.last_seen = user.lastSeen
  }

  return profile
}

// ============================================================================
// Trip-Specific Mappers
// ============================================================================

/**
 * Map trip field names from API format to database format
 */
export function mapTripApiToDb(data: Record<string, any>): Partial<Trip> {
  const mapped: Record<string, any> = {}

  // Direct mappings (already in snake_case)
  const directFields = [
    'trip_name',
    'destination',
    'start_date',
    'end_date',
    'description',
    'trip_type',
    'visibility',
    'cover_image',
    'weather',
    'overall_comment',
    'overall_rating',
    'airlines',
    'accommodations',
    'segments',
    'shared_with'
  ]

  for (const field of directFields) {
    if (field in data) {
      mapped[field] = data[field]
    }
  }

  if ('status' in data && !('trip_type' in data)) mapped.trip_type = data.status
  if ('cover_photo' in data && !('cover_image' in data)) mapped.cover_image = data.cover_photo
  if ('cover_photo_url' in data && !('cover_image' in data)) mapped.cover_image = data.cover_photo_url

  if ('tripName' in data) mapped.trip_name = data.tripName
  if ('startDate' in data) mapped.start_date = data.startDate
  if ('endDate' in data) mapped.end_date = data.endDate
  if ('coverPhoto' in data && !('cover_image' in data)) mapped.cover_image = data.coverPhoto
  if ('coverImage' in data) mapped.cover_image = data.coverImage
  if ('tripType' in data) mapped.trip_type = data.tripType
  if ('overallComment' in data) mapped.overall_comment = data.overallComment
  if ('overallRating' in data) mapped.overall_rating = data.overallRating
  if ('sharedWith' in data) mapped.shared_with = data.sharedWith

  return mapped as Partial<Trip>
}

/**
 * Map trip field names from database format to API format
 */
export function mapTripDbToApi(trip: Trip): Record<string, any> {
  return {
    id: trip.id,
    userId: trip.user_id,
    tripName: trip.trip_name,
    destination: trip.destination,
    startDate: trip.start_date,
    endDate: trip.end_date,
    description: trip.description,
    tripType: trip.trip_type,
    status: trip.trip_type,
    visibility: trip.visibility,
    coverImage: trip.cover_image,
    coverPhoto: trip.cover_image,
    weather: trip.weather,
    overallComment: trip.overall_comment,
    overallRating: trip.overall_rating,
    airlines: trip.airlines,
    accommodations: trip.accommodations,
    segments: trip.segments,
    sharedWith: trip.shared_with,
    createdAt: trip.created_at,
    updatedAt: trip.updated_at
  }
}

// ============================================================================
// Array Normalization Utilities
// ============================================================================

/**
 * Normalize various input formats into a string array
 * Handles: string[], comma-separated string, newline-separated string
 */
export function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (value === undefined || value === null) {
    return []
  }

  if (typeof value === 'string') {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return [String(value)]
}

/**
 * Normalize UUID array input
 */
export function normalizeUuidArray(value: unknown): string[] {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  const normalized = normalizeStringArray(value)
  return normalized.filter(item => uuidRegex.test(item))
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a valid Profile object
 */
export function isProfile(value: unknown): value is Profile {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'full_name' in value
  )
}

/**
 * Check if a value is a valid Trip object
 */
export function isTrip(value: unknown): value is Trip {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'user_id' in value &&
    ('trip_name' in value || 'title' in value) &&
    'destination' in value
  )
}

/**
 * Check if a value is a valid AuthUser object
 */
export function isAuthUser(value: unknown): value is AuthUser {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'fullName' in value
  )
}
