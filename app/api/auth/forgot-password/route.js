// Forgot Password API - Send password reset email
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

// POST /api/auth/forgot-password - Send password reset email
export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Use service role key for admin operations
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body)

    // Determine the correct redirect URL
    // Always use the production Tucker Trips URL to ensure Supabase allows the redirect
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const detectedUrl = `${protocol}://${host}`
    // Use env var if set, otherwise use detected URL, fallback to tuckertrips.com
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || detectedUrl || 'https://www.tuckertrips.com'
    const redirectUrl = `${baseUrl}/reset-password`
    console.log('Password reset redirect URL:', redirectUrl)

    // Send password reset email using Supabase Auth
    // Supabase handles checking if the user exists internally
    const { error } = await supabase.auth.resetPasswordForEmail(
      validatedData.email,
      {
        redirectTo: redirectUrl,
      }
    )

    if (error) {
      console.error('Password reset error:', error)
      // Still return success to prevent email enumeration
    }

    return NextResponse.json({
      message: 'If an account exists with this email, a password reset link will be sent'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Forgot password error:', error)
    const response = { error: 'Failed to process request' }
    if (process.env.NODE_ENV === 'development') {
      response.details = error.message
    }
    return NextResponse.json(response, { status: 500 })
  }
}
