'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Client-side email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      // Show success state
      setSubmitted(true)
      toast.success('Check your email for reset instructions')
    } catch (error) {
      console.error('Forgot password error:', error)
      toast.error(error.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#343f65] via-[#2a3452] to-[#1f2937] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white text-center">
            {!submitted ? 'Forgot Password?' : 'Check Your Email'}
          </CardTitle>
          <CardDescription className="text-[#e5dbf1] text-center">
            {!submitted
              ? 'Enter your email to receive reset instructions'
              : 'Password reset link has been sent'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!submitted ? (
            // FORM STATE
            <>
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-[#7dbbe5] hover:text-[#ff34ac] mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-white">
                    Email Address
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      aria-label="Email address"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-10"
                    />
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    We'll send a password reset link to this email
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] text-white hover:opacity-90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>

              <div className="text-center mt-6">
                <Link href="/" className="text-sm text-[#7dbbe5] hover:text-[#ff34ac] transition-colors">
                  Remember your password? Sign in
                </Link>
              </div>
            </>
          ) : (
            // SUCCESS STATE
            <div className="space-y-4 text-center py-4">
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-400" />

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">
                  Email Sent!
                </h3>
                <p className="text-[#e5dbf1]">
                  If an account exists with <strong>{email}</strong>, you'll receive password reset instructions shortly.
                </p>
                <p className="text-sm text-white/60">
                  Don't see it? Check your spam folder.
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  onClick={() => router.push('/')}
                  className="w-full bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] text-white hover:opacity-90"
                >
                  Back to Home
                </Button>

                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full text-sm text-[#7dbbe5] hover:text-[#ff34ac] transition-colors"
                >
                  Didn't receive email? Try again
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
