// Admin Login API Route
// Signed admin authentication

import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  assertAdminConfiguration,
  validateAdminCredentials,
  createAdminSessionHeaders,
  clearAdminSessionHeaders
} from '@/lib/admin-auth-middleware'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export async function POST(request) {
  try {
    assertAdminConfiguration()

    const rateLimit = await checkRateLimit(request, 'admin-login', 5, 15 * 60 * 1000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many admin login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
      )
    }

    const body = await request.json()

    // Validate input
    const { email, password } = adminLoginSchema.parse(body)

    // Validate admin credentials
    if (!validateAdminCredentials(email, password)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create admin session
    const response = NextResponse.json({
      success: true,
      message: 'Admin login successful',
      admin: { email }
    })

    response.headers.set('Set-Cookie', createAdminSessionHeaders(email)['Set-Cookie'])

    return response

  } catch (error) {
    console.error('Admin login error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    const response = { error: 'Login failed' }
    if (process.env.NODE_ENV === 'development') {
      response.details = error.message
    }
    return NextResponse.json(response, { status: 500 })
  }
}

// Logout endpoint
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Admin logout successful'
  })

  response.headers.set('Set-Cookie', clearAdminSessionHeaders()['Set-Cookie'])

  return response
}
