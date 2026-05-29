// Enhanced API Client for Supabase
// Provides type-safe API methods for backend communication

import { supabase } from './supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

const client = supabase as unknown as SupabaseClient
import type {
  AuthUser,
  AuthResponse,
  ProfileUpdateRequest,
  CreateTripRequest,
  UpdateTripRequest,
  TripResponse,
  MessageResponse,
  ConversationResponse,
  OnlineUser,
  ShareTripRequest,
  ShareTripResponse,
  ApiError
} from '@/types/api'

export class ApiClient {
  // ============================================================================
  // Authentication Methods
  // ============================================================================

  static async register(email: string, password: string, fullName: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      })

      if (!response.ok) {
        const error: ApiError = await response.json()
        throw new Error(error.error || 'Registration failed')
      }

      return response.json()
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const error: ApiError = await response.json()
        throw new Error(error.error || 'Login failed')
      }

      return response.json()
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  static async logout(): Promise<void> {
    try {
      await client.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await fetch('/api/auth/me')

      if (!response.ok) {
        if (response.status === 401) return null
        throw new Error('Failed to get user')
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  static async updateProfile(updates: ProfileUpdateRequest): Promise<AuthUser> {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const error: ApiError = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  // ============================================================================
  // User Management
  // ============================================================================

  static async updateHeartbeat(): Promise<boolean> {
    try {
      const response = await fetch('/api/users/heartbeat', {
        method: 'POST'
      })

      return response.ok
    } catch (error) {
      console.error('Heartbeat error:', error)
      return false
    }
  }

  static async getOnlineUsers(): Promise<OnlineUser[]> {
    try {
      const response = await fetch('/api/users/online')

      if (!response.ok) {
        throw new Error('Failed to get online users')
      }

      return response.json()
    } catch (error) {
      console.error('Get online users error:', error)
      throw error
    }
  }

  // ============================================================================
  // Trip Management
  // ============================================================================

  static async getTrips(options: {
    public?: boolean
    shared?: boolean
    userId?: string
  } = {}): Promise<TripResponse[]> {
    try {
      const params = new URLSearchParams()
      if (options.public) params.set('public', 'true')
      if (options.shared) params.set('shared', 'true')
      if (options.userId) params.set('userId', options.userId)

      const response = await fetch(`/api/trips?${params}`)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized')
        }
        throw new Error('Failed to get trips')
      }

      return response.json()
    } catch (error) {
      console.error('Get trips error:', error)
      throw error
    }
  }

  static async getTrip(tripId: string): Promise<TripResponse> {
    try {
      const response = await fetch(`/api/trips/${tripId}`)

      if (!response.ok) {
        if (response.status === 404) throw new Error('Trip not found')
        if (response.status === 401) throw new Error('Unauthorized')
        if (response.status === 403) throw new Error('Access denied')
        throw new Error('Failed to get trip')
      }

      return response.json()
    } catch (error) {
      console.error('Get trip error:', error)
      throw error
    }
  }

  static async createTrip(tripData: CreateTripRequest): Promise<TripResponse> {
    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData)
      })

      if (!response.ok) {
        const error: ApiError = await response.json()
        if (error.details) {
          const details = Array.isArray(error.details) ? error.details[0] : error.details
          throw new Error(details || 'Failed to create trip')
        }
        throw new Error(error.error || 'Failed to create trip')
      }

      return response.json()
    } catch (error) {
      console.error('Create trip error:', error)
      throw error
    }
  }

  static async updateTrip(tripId: string, updates: UpdateTripRequest): Promise<TripResponse> {
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        if (response.status === 404) throw new Error('Trip not found')
        if (response.status === 403) throw new Error('Cannot edit this trip')
        throw new Error('Failed to update trip')
      }

      return response.json()
    } catch (error) {
      console.error('Update trip error:', error)
      throw error
    }
  }

  static async deleteTrip(tripId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        if (response.status === 404) throw new Error('Trip not found')
        if (response.status === 403) throw new Error('Cannot delete this trip')
        throw new Error('Failed to delete trip')
      }

      return { success: true }
    } catch (error) {
      console.error('Delete trip error:', error)
      throw error
    }
  }

  // ============================================================================
  // Message Management
  // ============================================================================

  static async sendMessage(recipientId: string, content: string): Promise<MessageResponse> {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId, content })
      })

      if (!response.ok) {
        const error: ApiError = await response.json()
        throw new Error(error.error || 'Failed to send message')
      }

      return response.json()
    } catch (error) {
      console.error('Send message error:', error)
      throw error
    }
  }

  static async getMessages(conversationId?: string): Promise<MessageResponse[] | ConversationResponse[]> {
    try {
      const params = conversationId ? `?conversation=${conversationId}` : ''
      const response = await fetch(`/api/messages${params}`)

      if (!response.ok) {
        throw new Error('Failed to get messages')
      }

      return response.json()
    } catch (error) {
      console.error('Get messages error:', error)
      throw error
    }
  }

  // ============================================================================
  // Trip Sharing
  // ============================================================================

  static async shareTrip(tripId: string, shareData: Omit<ShareTripRequest, 'tripId'>): Promise<ShareTripResponse> {
    try {
      const response = await fetch('/api/trips/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, ...shareData })
      })

      if (!response.ok) {
        const error: ApiError = await response.json()
        throw new Error(error.error || 'Failed to share trip')
      }

      return response.json()
    } catch (error) {
      console.error('Share trip error:', error)
      throw error
    }
  }

  static async getSharedTrips(): Promise<TripResponse[]> {
    try {
      const response = await fetch('/api/trips/shared')

      if (!response.ok) {
        throw new Error('Failed to get shared trips')
      }

      return response.json()
    } catch (error) {
      console.error('Get shared trips error:', error)
      throw error
    }
  }

  // ============================================================================
  // Friend Management
  // ============================================================================

  static async sendFriendRequest(userId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch('/api/friendships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: userId })
      })

      if (!response.ok) {
        throw new Error('Failed to send friend request')
      }

      return { success: true }
    } catch (error) {
      console.error('Send friend request error:', error)
      throw error
    }
  }

  static async getFriends(): Promise<any[]> {
    try {
      const response = await fetch('/api/friendships')

      if (!response.ok) {
        throw new Error('Failed to get friends')
      }

      return response.json()
    } catch (error) {
      console.error('Get friends error:', error)
      throw error
    }
  }

  // ============================================================================
  // Direct Supabase Methods for Complex Queries
  // ============================================================================

  static async getPublicTrips(limit: number = 20): Promise<TripResponse[]> {
    try {
      const { data, error } = await client
        .from('trips')
        .select(`
          *,
          profiles:profiles(id, full_name, avatar_url)
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get public trips error:', error)
      throw error
    }
  }

  static async searchTrips(query: string, limit: number = 10): Promise<TripResponse[]> {
    try {
      const { data, error } = await client
        .from('trips')
        .select(`
          *,
          profiles:profiles(id, full_name, avatar_url)
        `)
        .or(`destination.ilike.%${query}%,title.ilike.%${query}%`)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Search trips error:', error)
      throw error
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  static async checkAuthentication(): Promise<boolean> {
    try {
      const { data: { session } } = await client.auth.getSession()
      return !!session
    } catch (error) {
      console.error('Check authentication error:', error)
      return false
    }
  }

  static async handleApiError(response: Response): Promise<never> {
    let error: ApiError

    try {
      error = await response.json()
    } catch {
      error = { error: 'Unknown error occurred' }
    }

    switch (response.status) {
      case 401:
        throw new Error(error.error || 'Unauthorized')
      case 403:
        throw new Error(error.error || 'Access denied')
      case 404:
        throw new Error(error.error || 'Resource not found')
      case 422:
        const details = error.details ? (Array.isArray(error.details) ? error.details.join(', ') : error.details) : 'Validation failed'
        throw new Error(details)
      case 429:
        throw new Error('Too many requests')
      case 500:
        throw new Error('Internal server error')
      default:
        throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
    }
  }

  static async request<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })

      if (!response.ok) {
        await this.handleApiError(response)
      }

      return response.json()
    } catch (error) {
      console.error('API request error:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error(String(error))
    }
  }
}

export default ApiClient