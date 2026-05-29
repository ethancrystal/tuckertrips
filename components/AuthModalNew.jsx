'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase.js'
import { assertBrowserSupabaseConfig } from '@/lib/supabase-config'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { trackSignupClick, SIGNUP_BUTTON_LOCATIONS } from '@/lib/analytics'
import { buildAuthRedirectUrl } from '@/lib/auth-redirect'

const AuthModalNew = ({ open, isOpen, onClose, onSuccess }) => {
  const isModalOpen = Boolean(open ?? isOpen ?? false)
  const [isLogin, setIsLogin] = useState(true)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  })
  const [resetEmail, setResetEmail] = useState('')
  const [invitationData, setInvitationData] = useState(null)

  // Check for invitation data in URL parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const tripId = urlParams.get('trip')
      const inviteEmail = urlParams.get('email')

      if (tripId) {
        setInvitationData({
          tripId,
          email: inviteEmail
        })

        // Pre-fill email if it's provided
        if (inviteEmail) {
          setFormData(prev => ({ ...prev, email: inviteEmail }))
        }
      }
    }
  }, [])

  const processInvitationAfterAuth = async (user) => {
    if (!invitationData || !invitationData.tripId) return

    try {
      // First, get the trip to find the owner (shared_by)
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('user_id')
        .eq('id', invitationData.tripId)
        .single()

      if (tripError) {
        console.error('Error fetching trip for invitation:', tripError)
      }

      // Create trip_shares record
      const { error: shareError } = await supabase
        .from('trip_shares')
        .insert({
          trip_id: invitationData.tripId,
          shared_by: trip?.user_id || user.id,
          shared_with: user.id,
          share_type: 'email'
        })

      if (shareError && shareError.code !== '23505') { // Ignore duplicate errors
        console.error('Error processing invitation:', shareError)
      }

      // Update pending_shares if this was from an email invitation
      if (invitationData.email) {
        const { error: pendingError } = await supabase
          .from('pending_shares')
          .update({
            claimed: true,
            claimed_by: user.id
          })
          .eq('trip_id', invitationData.tripId)
          .eq('recipient_email', invitationData.email)

        if (pendingError) {
          console.error('Error updating pending share:', pendingError)
        }
      }

      toast.success('Invitation accepted! Check your dashboard for the shared trip.')
    } catch (error) {
      console.error('Error processing invitation:', error)
      toast.error('Could not process your invitation. Please try again from the invite link.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Track Sign-Up button click (only for signup, not login)
    if (!isLogin) {
      trackSignupClick(SIGNUP_BUTTON_LOCATIONS.AUTH_MODAL_SUBMIT)
    }

    try {
      try {
        assertBrowserSupabaseConfig()
      } catch (e) {
        toast.error("Authentication is currently unavailable. Please contact the administrator to configure the system.")
        setLoading(false)
        return
      }

      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) throw error

        toast.success('Welcome back!')

        // Process invitation after login if present
        if (invitationData) {
          await processInvitationAfterAuth(data.user)
        }

        onSuccess(data.user)
      } else {
        // Sign up
        const emailRedirectTo = buildAuthRedirectUrl('/auth/callback')
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            },
            emailRedirectTo,
          },
        })

        if (error) throw error

        const message = invitationData
          ? 'Account created! Welcome to Tucker Trips! Your invitation will be processed.'
          : 'Account created! Welcome to Tucker Trips!'
        toast.success(message)

        // Process invitation after signup if present
        if (invitationData) {
          await processInvitationAfterAuth(data.user)
        }

        onSuccess(data.user)
      }
    } catch (error) {
      console.error('Auth error:', error)
      toast.error(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!resetEmail) {
      toast.error('Please enter your email address')
      return
    }

    setLoading(true)
    try {
      assertBrowserSupabaseConfig()

      const redirectTo = buildAuthRedirectUrl('/reset-password')
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo,
      })

      if (error) throw error

      toast.success('Password reset link sent! Check your email.')
      setShowResetPassword(false)
      setResetEmail('')
    } catch (error) {
      console.error('Reset error:', error)
      toast.error(error.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setShowResetPassword(false)
    setResetEmail('')
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#343f65] text-white border-[#ff34ac]/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {showResetPassword ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Join Tucker Trips')}
          </DialogTitle>
          <DialogDescription className="text-center text-white/80">
            {showResetPassword
              ? 'Enter your email to receive a password reset link'
              : isLogin
                ? 'Sign in to your Tucker Trips account'
                : 'Create your account to start sharing your travel experiences'
            }
          </DialogDescription>
        </DialogHeader>

        {showResetPassword ? (
          // Password Reset Form
          <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="flex items-center gap-2 text-sm text-[#7dbbe5] hover:text-[#ff34ac] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </button>

            <p className="text-sm text-[#e5dbf1]">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <div>
              <Label className="text-white">Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] text-white"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        ) : (
          // Login/Signup Form
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {!isLogin && (
              <div>
                <Label className="text-white">Full Name</Label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
            )}

            <div>
              <Label className="text-white">Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-white">Password</Label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="text-sm text-[#7dbbe5] hover:text-[#ff34ac] transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] text-white"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  // Track when switching to Sign Up tab
                  if (isLogin) {
                    trackSignupClick(SIGNUP_BUTTON_LOCATIONS.AUTH_MODAL_TAB)
                  }
                  setIsLogin(!isLogin)
                }}
                className="text-sm text-[#7dbbe5] hover:underline"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AuthModalNew
