// React Hook for authentication
// Client-side only - imports from server-side auth utilities

'use client'

import { useState, useEffect } from 'react'
import { AuthService } from '../lib/auth'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    AuthService.getCurrentUser().then(userData => {
      setUser(userData)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthChange(async (event, session) => {
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

  const login = async (email, password) => {
    const result = await AuthService.login(email, password)
    setUser(result.user)
    return result
  }

  const logout = async () => {
    await AuthService.logout()
    setUser(null)
  }

  const register = async (email, password, fullName) => {
    const result = await AuthService.register(email, password, fullName)
    setUser(result.user)
    return result
  }

  const updateProfile = async (updates) => {
    const updatedProfile = await AuthService.updateProfile(updates)
    setUser(prev => ({ ...prev, ...updatedProfile }))
    return updatedProfile
  }

  return {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
    isAuthenticated: !!user,
    updateHeartbeat: AuthService.updateHeartbeat,
    getOnlineUsers: AuthService.getOnlineUsers
  }
}