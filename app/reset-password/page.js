'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase.js'
import { assertBrowserSupabaseConfig } from '@/lib/supabase-config'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    let isMounted = true
    let subscription = null

    const handleRecovery = async () => {
      try {
        assertBrowserSupabaseConfig()

        // Case 1: PKCE flow - `code` query parameter (Supabase v2 default)
        const code = searchParams.get('code')

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Code exchange error:', error)
            if (isMounted) {
              setErrorMessage('Invalid or expired reset link. Please request a new one.')
              setVerifying(false)
            }
            return
          }
          if (data.session && isMounted) {
            setVerifying(false)
            return
          }
        }

        // Case 2: Implicit/hash flow - listen for PASSWORD_RECOVERY event
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!isMounted) return
            console.log('Auth event on reset page:', event)

            if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
              setVerifying(false)
              setErrorMessage('')
            }
          }
        )
        subscription = authListener.subscription

        // Check for an existing session (e.g., page refresh after code exchange)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          if (isMounted) {
            setErrorMessage('Invalid or expired reset link. Please request a new one.')
            setVerifying(false)
          }
          return
        }

        if (session && isMounted) {
          setVerifying(false)
          return
        }

        // Wait for the auth state change event (hash fragment flow)
        await new Promise(resolve => setTimeout(resolve, 3000))

        // Final check
        const { data: { session: finalSession } } = await supabase.auth.getSession()
        if (isMounted) {
          if (finalSession) {
            setVerifying(false)
          } else {
            setErrorMessage('No active session found. The reset link may have expired. Please request a new one.')
            setVerifying(false)
          }
        }
      } catch (error) {
        console.error('Recovery setup error:', error)
        if (isMounted) {
          setErrorMessage('Something went wrong. Please try again.')
          setVerifying(false)
        }
      }
    }

    handleRecovery()

    return () => {
      isMounted = false
      if (subscription) subscription.unsubscribe()
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      assertBrowserSupabaseConfig()

      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) throw error

      toast.success('Password updated successfully! Redirecting to login...')

      await supabase.auth.signOut()
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (error) {
      console.error('Password update error:', error)
      toast.error(error.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#343f65] via-[#2a3452] to-[#1f2937] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-400 text-2xl">!</span>
              </div>
              <p className="text-white text-center">{errorMessage}</p>
              <Button
                onClick={() => router.push('/forgot-password')}
                className="mt-4 bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] text-white hover:opacity-90"
              >
                Request New Reset Link
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="text-white/70 hover:text-white"
              >
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#343f65] via-[#2a3452] to-[#1f2937] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#7dbbe5]" />
              <p className="text-white text-center">Verifying reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#343f65] via-[#2a3452] to-[#1f2937] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white text-center">
            Create New Password
          </CardTitle>
          <CardDescription className="text-[#e5dbf1] text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-white">New Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-white/60 mt-1">At least 6 characters</p>
            </div>
            <div>
              <Label className="text-white">Confirm New Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] text-white hover:opacity-90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#343f65] via-[#2a3452] to-[#1f2937] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#7dbbe5] mx-auto" />
          <p className="mt-4 text-[#e5dbf1]">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
