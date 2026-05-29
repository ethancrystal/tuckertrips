// Enhanced Authentication System using Supabase Auth
// Type-safe authentication system replacing JWT-based MongoDB auth

import { supabase as _supabase } from './supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabase = _supabase as unknown as SupabaseClient
import { buildAuthRedirectUrl } from './auth-redirect'
export type { RegisterRequest } from '@/types/api'
import type {
  AuthUser,
  AuthResponse,
  ProfileUpdateRequest
} from '@/types/api'
import type { Profile } from '@/types/database'

export class AuthService {
  // ============================================================================
  // User Registration
  // ============================================================================

  static async register(email: string, password: string, fullName: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) {
        throw error
      }

      // Profile is automatically created via trigger
      const user: AuthUser = {
        id: data.user!.id,
        email: data.user!.email!,
        fullName: data.user!.user_metadata.full_name || fullName,
        avatarUrl: data.user!.user_metadata.avatar_url
      }

      return {
        user,
        session: data.session
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  // ============================================================================
  // User Login
  // ============================================================================

  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw error
      }

      // Update online status
      await this.updateHeartbeat()

      // Get full profile data
      const profile = await this.getProfile(data.user!.id)

      const user: AuthUser = {
        id: data.user!.id,
        email: data.user!.email!,
        fullName: profile?.full_name || data.user!.user_metadata.full_name,
        bio: profile?.bio || '',
        avatarUrl: profile?.avatar_url || '',
        coverPhotoUrl: profile?.cover_photo_url || '',
        isOnline: profile?.is_online || false,
        lastSeen: profile?.last_seen
      }

      return {
        user,
        session: data.session
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // ============================================================================
  // User Logout
  // ============================================================================

  static async logout(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return true
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  // ============================================================================
  // Get Current User
  // ============================================================================

  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) throw error
      if (!user) return null

      const profile = await this.getProfile(user.id)

      return {
        id: user.id,
        email: user.email!,
        fullName: profile?.full_name || user.user_metadata.full_name,
        bio: profile?.bio || '',
        avatarUrl: profile?.avatar_url || '',
        coverPhotoUrl: profile?.cover_photo_url || '',
        isOnline: profile?.is_online || false,
        lastSeen: profile?.last_seen
      }
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  // ============================================================================
  // Get User Profile
  // ============================================================================

  static async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get profile error:', error)
      return null
    }
  }

  // ============================================================================
  // Update Profile
  // ============================================================================

  static async updateProfile(updates: ProfileUpdateRequest): Promise<Profile> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const updateData: Partial<Profile> = {
        updated_at: new Date().toISOString()
      }

      if (updates.fullName !== undefined) updateData.full_name = updates.fullName
      if (updates.bio !== undefined) updateData.bio = updates.bio
      if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl
      if (updates.coverPhotoUrl !== undefined) updateData.cover_photo_url = updates.coverPhotoUrl

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      // Also update auth metadata if needed
      if (updates.fullName) {
        await supabase.auth.updateUser({
          data: { full_name: updates.fullName }
        })
      }

      return data
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  // ============================================================================
  // Update Heartbeat (online status)
  // ============================================================================

  static async updateHeartbeat(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('profiles')
        .update({
          is_online: true,
          last_seen: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Heartbeat error:', error)
      return false
    }
  }

  // ============================================================================
  // Get Online Users
  // ============================================================================

  static async getOnlineUsers(): Promise<Array<Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'is_online' | 'last_seen'>>> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, is_online, last_seen')
        .or(`is_online.eq.true,last_seen.gte.${fiveMinutesAgo}`)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get online users error:', error)
      return []
    }
  }

  // ============================================================================
  // Password Reset
  // ============================================================================

  static async resetPassword(email: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: buildAuthRedirectUrl('/reset-password')
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Password reset error:', error)
      throw error
    }
  }

  // ============================================================================
  // Update Password
  // ============================================================================

  static async updatePassword(newPassword: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Update password error:', error)
      throw error
    }
  }

  // ============================================================================
  // Session Management
  // ============================================================================

  static async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Get session error:', error)
      return null
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession()
    return !!session
  }

  // ============================================================================
  // Listen to Auth Changes
  // ============================================================================

  static onAuthChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  static async refreshSession(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.refreshSession()
      if (error) throw error
      return true
    } catch (error) {
      console.error('Refresh session error:', error)
      return false
    }
  }

  static async updateUserMetadata(metadata: Record<string, any>): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: metadata
      })
      if (error) throw error
      return true
    } catch (error) {
      console.error('Update user metadata error:', error)
      return false
    }
  }

  static async getUserMetadata(): Promise<Record<string, any> | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user?.user_metadata || null
    } catch (error) {
      console.error('Get user metadata error:', error)
      return null
    }
  }
}

// ============================================================================
// React Hook for Authentication
// ============================================================================

import { useState, useEffect } from 'react'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    AuthService.getCurrentUser().then(userData => {
      setUser(userData)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthChange(async (event, _session) => {
      if (event === 'SIGNED_IN') {
        const userData = await AuthService.getCurrentUser()
        setUser(userData)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const result = await AuthService.login(email, password)
    setUser(result.user)
    return result
  }

  const logout = async (): Promise<void> => {
    await AuthService.logout()
    setUser(null)
  }

  const register = async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
    const result = await AuthService.register(email, password, fullName)
    setUser(result.user)
    return result
  }

  const updateProfile = async (updates: ProfileUpdateRequest): Promise<Profile> => {
    const updatedProfile = await AuthService.updateProfile(updates)
    setUser(prev => prev ? {
      ...prev,
      fullName: updates.fullName ?? prev.fullName,
      bio: updates.bio ?? prev.bio,
      avatarUrl: updates.avatarUrl ?? prev.avatarUrl,
      coverPhotoUrl: updates.coverPhotoUrl ?? prev.coverPhotoUrl
    } : null)
    return updatedProfile
  }

  const updateHeartbeat = async (): Promise<boolean> => {
    return await AuthService.updateHeartbeat()
  }

  const getOnlineUsers = async () => {
    return await AuthService.getOnlineUsers()
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    return await AuthService.resetPassword(email)
  }

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    return await AuthService.updatePassword(newPassword)
  }

  return {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
    updateHeartbeat,
    getOnlineUsers,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user,
    // Expose the service directly for advanced usage
    service: AuthService
  }
}
