// Centralized Database Types and Utilities
// Single source of truth for all database-related types and helpers

// ============================================================================
// Database Table Types
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      trips: {
        Row: Trip
        Insert: TripInsert
        Update: TripUpdate
      }
      trip_categories: {
        Row: TripCategory
        Insert: TripCategoryInsert
        Update: TripCategoryUpdate
      }
      trip_shares: {
        Row: TripShare
        Insert: TripShareInsert
        Update: TripShareUpdate
      }
      pending_shares: {
        Row: PendingShare
        Insert: PendingShareInsert
        Update: PendingShareUpdate
      }
      messages: {
        Row: Message
        Insert: MessageInsert
        Update: MessageUpdate
      }
      friendships: {
        Row: Friendship
        Insert: FriendshipInsert
        Update: FriendshipUpdate
      }
    }
  }
}

// ============================================================================
// Profile Types
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

export interface ProfileInsert {
  id?: string
  email: string
  full_name?: string | null
  bio?: string | null
  avatar_url?: string | null
  cover_photo_url?: string | null
  is_online?: boolean
  last_seen?: string
  created_at?: string
  updated_at?: string
}

export interface ProfileUpdate {
  id?: string
  email?: string
  full_name?: string | null
  bio?: string | null
  avatar_url?: string | null
  cover_photo_url?: string | null
  is_online?: boolean
  last_seen?: string
  created_at?: string
  updated_at?: string
}

// ============================================================================
// Trip Types
// ============================================================================

export type TripStatus = 'taken' | 'future' | 'ongoing'
export type TripVisibility = 'private' | 'friends' | 'public'

export interface Trip {
  id: string
  user_id: string
  trip_name: string
  title?: string
  destination: string
  start_date: string | null
  end_date: string | null
  description: string | null
  trip_type: TripStatus
  status?: TripStatus
  visibility: TripVisibility
  cover_image: string | null
  cover_photo?: string | null
  cover_photo_url?: string | null
  trip_images?: string[]
  photo_urls?: string[]
  weather: string | null
  overall_comment: string | null
  overall_rating: number | null
  airlines: AirlineInfo[]
  accommodations: AccommodationInfo[]
  segments: TripSegment[]
  shared_with: string[]
  is_shared: boolean
  created_at: string
  updated_at: string
}

export interface TripInsert {
  id?: string
  user_id: string
  trip_name: string
  destination: string
  start_date?: string | null
  end_date?: string | null
  description?: string | null
  trip_type?: TripStatus
  visibility?: TripVisibility
  cover_image?: string | null
  weather?: string | null
  overall_comment?: string | null
  overall_rating?: number | null
  airlines?: AirlineInfo[]
  accommodations?: AccommodationInfo[]
  segments?: TripSegment[]
  shared_with?: string[]
  is_shared?: boolean
  created_at?: string
  updated_at?: string
}

export interface TripUpdate {
  id?: string
  user_id?: string
  trip_name?: string
  destination?: string
  start_date?: string | null
  end_date?: string | null
  description?: string | null
  trip_type?: TripStatus
  visibility?: TripVisibility
  cover_image?: string | null
  weather?: string | null
  overall_comment?: string | null
  overall_rating?: number | null
  airlines?: AirlineInfo[]
  accommodations?: AccommodationInfo[]
  segments?: TripSegment[]
  shared_with?: string[]
  is_shared?: boolean
  created_at?: string
  updated_at?: string
}

// ============================================================================
// Supporting Types for Trips
// ============================================================================

export interface AirlineInfo {
  name: string
  rating?: number
  cost?: number
  currency?: string
  notes?: string
}

export interface AccommodationInfo {
  name: string
  type: string
  rating?: number
  cost?: number
  currency?: string
  booking_url?: string
  notes?: string
}

export interface TripSegment {
  location: string
  start_date: string
  end_date: string
  description?: string
  activities?: string[]
}

// ============================================================================
// Trip Category Types
// ============================================================================

export type CategoryName = 'rental' | 'food' | 'accommodation' | 'airline' | 'excursions'

export interface TripCategory {
  id: string
  trip_id: string
  category_name: CategoryName
  rating: number | null
  average_price: number | null
  currency: string | null
  notes: string | null
  big_wins: string | null
  do_differently: string | null
  timing_tips: string | null
  created_at: string
  updated_at: string
}

export interface TripCategoryInsert {
  id?: string
  trip_id: string
  category_name: CategoryName
  rating?: number | null
  average_price?: number | null
  currency?: string | null
  notes?: string | null
  big_wins?: string | null
  do_differently?: string | null
  timing_tips?: string | null
  created_at?: string
  updated_at?: string
}

export interface TripCategoryUpdate {
  id?: string
  trip_id?: string
  category_name?: CategoryName
  rating?: number | null
  average_price?: number | null
  currency?: string | null
  notes?: string | null
  big_wins?: string | null
  do_differently?: string | null
  timing_tips?: string | null
  created_at?: string
  updated_at?: string
}

// ============================================================================
// Trip Share Types
// ============================================================================

export type ShareType = 'email' | 'link'

export interface TripShare {
  id: string
  trip_id: string
  shared_by: string
  shared_with: string
  share_type: ShareType
  created_at: string
}

export interface TripShareInsert {
  id?: string
  trip_id: string
  shared_by: string
  shared_with: string
  share_type: ShareType
  created_at?: string
}

export interface TripShareUpdate {
  id?: string
  trip_id?: string
  shared_by?: string
  shared_with?: string
  share_type?: ShareType
  created_at?: string
}

// ============================================================================
// Pending Share Types
// ============================================================================

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

export interface PendingShareInsert {
  id?: string
  trip_id: string
  shared_by: string
  recipient_email: string
  invite_link: string
  claimed?: boolean
  claimed_by?: string | null
  expires_at: string
  created_at?: string
}

export interface PendingShareUpdate {
  id?: string
  trip_id?: string
  shared_by?: string
  recipient_email?: string
  invite_link?: string
  claimed?: boolean
  claimed_by?: string | null
  expires_at?: string
  created_at?: string
}

// ============================================================================
// Message Types
// ============================================================================

export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface MessageInsert {
  id?: string
  sender_id: string
  recipient_id: string
  content: string
  is_read?: boolean
  created_at?: string
}

export interface MessageUpdate {
  id?: string
  sender_id?: string
  recipient_id?: string
  content?: string
  is_read?: boolean
  created_at?: string
}

// ============================================================================
// Friendship Types
// ============================================================================

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked'

export interface Friendship {
  id: string
  user_id: string
  friend_id: string
  status: FriendshipStatus
  created_at: string
  updated_at: string
}

export interface FriendshipInsert {
  id?: string
  user_id: string
  friend_id: string
  status?: FriendshipStatus
  created_at?: string
  updated_at?: string
}

export interface FriendshipUpdate {
  id?: string
  user_id?: string
  friend_id?: string
  status?: FriendshipStatus
  created_at?: string
  updated_at?: string
}

// ============================================================================
// Database Utilities
// ============================================================================

/**
 * Type-safe select query builder for Supabase
 */
export interface SelectQuery<T extends keyof Database['public']['Tables']> {
  table: T
  columns?: string
  filters?: Partial<Database['public']['Tables'][T]['Row']>
  orderBy?: {
    column: keyof Database['public']['Tables'][T]['Row']
    ascending?: boolean
  }
  limit?: number
  offset?: number
}

/**
 * Helper function to create a type-safe Supabase query
 */
export function createSelectQuery<T extends keyof Database['public']['Tables']>(
  table: T,
  options: Omit<SelectQuery<T>, 'table'> = {}
): SelectQuery<T> {
  return {
    table,
    ...options
  }
}

// ============================================================================
// Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ============================================================================
// Auth Types
// ============================================================================

export interface AuthUser {
  id: string
  email: string
  fullName?: string
  bio?: string
  avatarUrl?: string
  coverPhotoUrl?: string
  isOnline?: boolean
  lastSeen?: string
}

export interface AuthResponse {
  user: AuthUser
  session: {
    access_token: string
    refresh_token: string
    expires_in: number
    user: any
  }
}

// ============================================================================
// Export Type Helpers
// ============================================================================

export type Row<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Insert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type Update<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']