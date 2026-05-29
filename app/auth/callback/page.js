'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase.js'
import { assertBrowserSupabaseConfig } from '@/lib/supabase-config'

function getSafeNextPath() {
  if (typeof window === 'undefined') return '/'

  const params = new URLSearchParams(window.location.search)
  const next = params.get('next')

  if (!next || !next.startsWith('/')) {
    return '/'
  }

  return next
}

export default function AuthCallbackPage() {
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    let cancelled = false

    const completeVerification = async () => {
      try {
        assertBrowserSupabaseConfig()

        const params = new URLSearchParams(window.location.search)
        const tokenHash = params.get('token_hash')
        const type = params.get('type')

        if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
          })

          if (error) throw error
        } else {
          const { error } = await supabase.auth.getSession()
          if (error) throw error
        }

        if (!cancelled) {
          setMessage('Email verified. Redirecting...')
        }

        window.location.replace(getSafeNextPath())
      } catch (error) {
        console.error('Auth callback error:', error)

        if (!cancelled) {
          setMessage(error?.message || 'Unable to verify your email. Please request a new verification link.')
        }
      }
    }

    completeVerification()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#343f65] via-[#343f65] to-[#2a3352] p-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#ff34ac] to-[#7dbbe5] flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Finishing Sign In</h1>
        <p className="text-[#e5dbf1] mb-6">{message}</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-3 text-white hover:bg-white/5 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}
