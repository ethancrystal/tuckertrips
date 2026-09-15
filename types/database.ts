// Supabase Database Schema Types
// Generated to match the enhanced schema from the migration

// ============================================================================
// Nested Data Structures (JSON fields in Trip table)
// ============================================================================

export interface AirlineInfo {
  name?: string
  rating?: number
  cost?: string
  flightClass?: string
  notes?: string
}

export interface AccommodationInfo {
  type?: string
  name?: string
  rating?: number
  url?: string
  address?: string
  pricePerNight?: string
  notes?: string
}

export interface TripSegment {
  title: string
  description?: string
  startDate?: string
  endDate?: string
  location?: string
  activities?: string[]
  photos?: string[]
}

// ============================================================================
// Core Tables
// ============================================================================

export interface Profile {
  id: string
  email: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  cover_photo_url: string | null
  is_online: boolean
  last_seen: string
  created_at: string
  updated_at: string
}

export interface Trip {
  id: string
  user_id: string
  trip_name: string
  title?: string
  destination: string
  start_date: string | null
  end_date: string | null
  description: string | null
  trip_type: 'taken' | 'future' | 'ongoing'
  status?: 'taken' | 'future' | 'ongoing'
  visibility: 'private' | 'friends' | 'public'
  cover_image: string | null
  cover_photo?: string | null
  cover_photo_url?: string | null
  trip_images?: string[]
  photo_urls?: string[]
  weather: string | null
  overall_comment: string | null
  airlines: AirlineInfo[]
  accommodations: AccommodationInfo[]
  segments: TripSegment[]
  shared_with: string[]
  is_shared?: boolean
  overall_rating: number | null
  created_at: string
  updated_at: string
}

export interface TripCategory {
  id: string
  trip_id: string
  category_name: 'rental' | 'food' | 'accommodation' | 'airline' | 'excursions'
  rating: number | null
  average_price: number | null
  currency: string
  notes: string | null
  big_wins: string | null
  do_differently: string | null
  timing_tips: string | null
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  read: boolean
  created_at: string
}

export interface Friendship {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'blocked'
  created_at: string
  updated_at: string
}

export interface TripShare {
  id: string
  trip_id: string
  shared_by: string
  shared_with: string
  share_type: 'email' | 'link'
  permissions: 'view' | 'edit' | 'comment'
  created_at: string
}

export interface PendingShare {
  id: string
  trip_id: string
  shared_by: string
  recipient_email: string
  invite_link: string
  claimed: boolean
  claimed_by: string | null
  expires_at: string
  created_at: string
}

// ============================================================================
// Enhanced Types with Joins
// ============================================================================

export interface TripWithProfile extends Trip {
  profiles: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
  trip_categories?: TripCategory[]
}

export interface MessageWithUsers extends Message {
  sender: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  recipient: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

export interface Conversation {
  conversation_id: string
  other_user_id: string
  other_user_name: string | null
  other_user_avatar: string | null
  last_message_content: string
  last_message_time: string
  unread_count: number
}

// ============================================================================
// API Response Types
// ============================================================================

export interface DatabaseResponse<T = any> {
  data: T | null
  error: DatabaseError | null
}

export interface DatabaseError {
  code: string
  message: string
  details?: any
  hint?: any
}

// ============================================================================
// Supabase Auth Types
// ============================================================================

export interface AuthUser {
  id: string
  email?: string
  phone?: string
  email_confirmed_at?: string
  phone_confirmed_at?: string
  last_sign_in_at?: string
  created_at?: string
  updated_at?: string
  user_metadata: Record<string, any>
  app_metadata: Record<string, any>
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: AuthUser
}

// ============================================================================
// Utility Types
// ============================================================================

export type TripStatus = Trip['status']
export type TripVisibility = Trip['visibility']
export type CategoryName = TripCategory['category_name']
export type FriendshipStatus = Friendship['status']
export type ShareType = TripShare['share_type']
export type SharePermissions = TripShare['permissions']

// Insert types (without generated fields)
export type TripInsert = Omit<Trip, 'id' | 'created_at' | 'updated_at'>
export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>
export type MessageInsert = Omit<Message, 'id' | 'created_at' | 'is_read'>
export type FriendshipInsert = Omit<Friendship, 'id' | 'created_at' | 'updated_at'>

// Update types (all fields optional)
export type TripUpdate = Partial<TripInsert>
export type ProfileUpdate = Partial<Omit<ProfileInsert, 'email'>>

// ============================================================================
// Join Types for API Responses
// ============================================================================

export interface PublicTrip extends Trip {
  profiles: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}

export interface SharedTripView {
  id: string
  title: string
  destination: string
  start_date: string | null
  end_date: string | null
  status: TripStatus
  visibility: TripVisibility
  cover_photo: string | null
  shared_by: string
  share_type: ShareType
  shared_at: string
  owner_name: string | null
  owner_email: string
  created_at: string
}

// ============================================================================
// Search and Filter Types
// ============================================================================

export interface TripFilters {
  status?: TripStatus[]
  visibility?: TripVisibility[]
  destination?: string
  dateRange?: {
    start: string
    end: string
  }
  userId?: string
}

export interface SearchParams {
  query?: string
  filters?: TripFilters
  limit?: number
  offset?: number
  sortBy?: 'created_at' | 'updated_at' | 'start_date' | 'title'
  sortOrder?: 'asc' | 'desc'
}