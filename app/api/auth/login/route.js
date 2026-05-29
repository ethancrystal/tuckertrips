// User Login API Route
// Replaces MongoDB login with Supabase Auth

import { NextResponse } from 'next/server'
import { createSupabaseRouteClient } from '@/lib/supabase-server'
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse } from '@/lib/api-response'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export async function POST(request) {
  try {
    // Rate limiting: 10 requests per 15 minutes per IP
    const rateLimit = await checkRateLimit(request, 'login', 10, 15 * 60 * 1000)
    if (!rateLimit.allowed) {
      return errorResponse('Too many login attempts. Please try again later.', 429, null, { 'Retry-After': String(rateLimit.retryAfter) })
    }

    const body = await request.json()

    // Validate input
    const { email, password } = loginSchema.parse(body)

    // Login user
    const supabase = createSupabaseRouteClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) throw error

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    const user = {
      id: data.user.id,
      email: data.user.email,
      fullName: profile?.full_name || data.user.user_metadata?.full_name,
      bio: profile?.bio || '',
      avatarUrl: profile?.avatar_url || '',
      coverPhotoUrl: profile?.cover_photo_url || '',
      isOnline: profile?.is_online || false,
      lastSeen: profile?.last_seen
    }

    return successResponse({ user, session: data.session })

  } catch (error) {
    console.error('Login error:', error)

    if (error instanceof z.ZodError) {
      return validationErrorResponse(error.errors)
    }

    if (error.message?.includes('Invalid login credentials')) {
      return unauthorizedResponse('Invalid credentials')
    }

    return errorResponse('Login failed', 500, error.message)
  }
}
