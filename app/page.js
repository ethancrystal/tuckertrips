'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import LandingPageNew from '@/components/LandingPageNew'
import { supabase } from '@/lib/supabase.js'
import { toast } from 'sonner'

const AuthModalNew = dynamic(() => import('@/components/AuthModalNew'), {
  ssr: false,
})

const DashboardNew = dynamic(() => import('@/components/DashboardNew'), {
  loading: () => <div className="min-h-screen bg-[#0a0a0c]" aria-hidden="true" />,
})

const OnboardingFlow = dynamic(() => import('@/components/OnboardingFlow'), {
  ssr: false,
  loading: () => null,
})


const EmailVerificationPending = ({ email, onBack }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#343f65] via-[#343f65] to-[#2a3352] p-4">
    <div className="max-w-md w-full bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#ff34ac] to-[#7dbbe5] flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">Verify Your Email</h1>
      <p className="text-[#e5dbf1] mb-6">
        We've sent a verification link to <span className="text-white font-medium">{email}</span>.
        Please check your email and click the link to verify your account.
      </p>
      <button
        onClick={onBack}
        className="w-full py-3 px-4 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-colors"
      >
        Back to Home
      </button>
      <p className="text-white/50 text-sm mt-6">
        Didn't receive the email? Check your spam folder.
      </p>
    </div>
  </div>
)

/**
 * Fetches the user's profile from the `profiles` table and merges it
 * with the Supabase auth user object. This ensures profile fields
 * (full_name, avatar_url, bio, cover_photo_url) persist across sessions.
 */
const hydrateUserWithProfile = async (authUser) => {
  if (!authUser) return null

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, bio, cover_photo_url, is_online, last_seen')
      .eq('id', authUser.id)
      .single()

    if (error) {
      console.error('Profile hydration error:', error)
      // Return auth user as-is if profile fetch fails
      return authUser
    }

    // Merge profile data into the auth user object
    return {
      ...authUser,
      full_name: profile?.full_name || authUser.user_metadata?.full_name || '',
      avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url || '',
      bio: profile?.bio || '',
      cover_photo_url: profile?.cover_photo_url || '',
      is_online: profile?.is_online || false,
      last_seen: profile?.last_seen || null,
      user_metadata: {
        ...authUser.user_metadata,
        full_name: profile?.full_name || authUser.user_metadata?.full_name || '',
        avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url || '',
      }
    }
  } catch (err) {
    console.error('Unexpected profile hydration error:', err)
    return authUser
  }
}

const App = () => {
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [emailNotVerified, setEmailNotVerified] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session check error:', error)
          setUser(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          // Hydrate user with profile data from the profiles table
          const hydratedUser = await hydrateUserWithProfile(session.user)
          setUser(hydratedUser)
          setEmailNotVerified(false)
        } else {
          setUser(null)
          setEmailNotVerified(false)
        }

        // Show onboarding for new users (first login)
        if (session?.user) {
          try {
            const hasSeenOnboarding = localStorage.getItem(`onboarding-${session.user.id}`)
            if (!hasSeenOnboarding) {
              setShowOnboarding(true)
            }
          } catch (storageError) {
            console.error('LocalStorage error:', storageError)
          }
        }

        setLoading(false)
      } catch (error) {
        console.error('Unexpected session check error:', error)
        setUser(null)
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          // Hydrate user with profile data on every auth state change
          const hydratedUser = await hydrateUserWithProfile(session.user)
          setUser(hydratedUser)
          if (!session?.user) setEmailNotVerified(false)
        } else {
          setUser(null)
          setEmailNotVerified(false)
        }

        // Show onboarding on new sign up
        if (session?.user && event === 'SIGNED_IN') {
          try {
            const hasSeenOnboarding = localStorage.getItem(`onboarding-${session.user.id}`)
            if (!hasSeenOnboarding) {
              setShowOnboarding(true)
            }
          } catch (storageError) {
            console.error('LocalStorage error:', storageError)
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuthSuccess = async (userData) => {
    // Hydrate with profile data on auth success too
    const hydratedUser = await hydrateUserWithProfile(userData)
    setUser(hydratedUser)
    setShowAuthModal(false)
    setTimeout(() => {
      if (userData) {
        const hasSeenOnboarding = localStorage.getItem(`onboarding-${userData.id}`)
        if (!hasSeenOnboarding) {
          setShowOnboarding(true)
        }
      }
    }, 500)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setEmailNotVerified(false)
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    if (user) {
      localStorage.setItem(`onboarding-${user.id}`, 'completed')
    }
  }

  const handleOnboardingSkip = () => {
    setShowOnboarding(false)
    if (user) {
      localStorage.setItem(`onboarding-${user.id}`, 'skipped')
    }
  }

  const handleBackToHome = () => {
    setEmailNotVerified(false)
    setUserEmail('')
  }

  if (emailNotVerified) {
    return <EmailVerificationPending email={userEmail} onBack={handleBackToHome} />
  }

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0c]" aria-hidden="true" />
  }

  if (user) {
    return (
      <>
        <DashboardNew user={user} onLogout={handleLogout} />
        <OnboardingFlow
          open={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      </>
    )
  }

  return (
    <>
      <LandingPageNew onShowAuth={() => setShowAuthModal(true)} />
      {showAuthModal && (
        <AuthModalNew
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </>
  )
}

export default App
