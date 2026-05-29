// User Registration API Route
// Replaces MongoDB registration with Supabase Auth

import { NextResponse } from 'next/server'
import { createSupabaseRouteClient } from '@/lib/supabase-server'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'
import { sendWelcomeEmail } from '@/lib/email.js'

export const dynamic = 'force-dynamic'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required')
})

export async function POST(request) {
  try {
    // Rate limiting: 5 requests per 15 minutes per IP
    const rateLimit = await checkRateLimit(request, 'register', 5, 15 * 60 * 1000)
    if (!rateLimit.allowed) {
      return errorResponse('Too many registration attempts. Please try again later.', 429, null, { 'Retry-After': String(rateLimit.retryAfter) })
    }

    const body = await request.json()
    const { email, password, fullName } = registerSchema.parse(body)

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'

    const supabase = createSupabaseRouteClient()

    // Check if this IP already has an account (except for admin)
    const adminEmail = process.env.ADMIN_EMAIL
    if (email !== adminEmail && ip !== 'unknown') {
      const { data: existingProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('registration_ip', ip)
        .limit(1)

      if (profileError) {
        console.error('Error checking existing profiles by IP:', profileError)
      } else if (existingProfiles && existingProfiles.length > 0) {
        return errorResponse('An account has already been created from this IP address.', 403)
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          registration_ip: ip
        }
      }
    })

    if (error) throw error

    const user = {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.user_metadata?.full_name || fullName,
      avatarUrl: data.user.user_metadata?.avatar_url
    }

    // Send welcome email (don't await - fire and forget)
    sendWelcomeEmail(email, fullName).catch(err =>
      console.error('Failed to send welcome email:', err)
    )

    return successResponse({ user, session: data.session }, 201)

  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof z.ZodError) {
      return validationErrorResponse(error.errors)
    }

    if (error.message?.includes('User already registered')) {
      return errorResponse('User already exists', 409)
    }

    return errorResponse('Registration failed', 500, error.message)
  }
}
