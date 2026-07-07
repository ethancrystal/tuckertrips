/**
 * Unified Next.js Edge Middleware
 *
 * Handles two distinct protection concerns in a single, authoritative file:
 *   1. Admin route protection  — custom HMAC-signed cookie session
 *   2. User route protection   — Supabase Auth session via @supabase/ssr
 *
 * This replaces the previous split between middleware.js (admin HMAC) and
 * lib/admin-auth-middleware.js (duplicate HMAC logic), consolidating all
 * edge-level authorization into one place.
 */

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// ---------------------------------------------------------------------------
// Admin session helpers (Edge-compatible — no Node.js crypto)
// ---------------------------------------------------------------------------

const ADMIN_SESSION_COOKIE = 'admin_session'

/**
 * Verifies the admin HMAC-signed session token using the Web Crypto API,
 * which is available in the Next.js Edge Runtime.
 */
async function verifyAdminToken(token) {
  try {
    if (!token) return false

    const sessionSecret = process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET || ''
    const configuredEmail = process.env.ADMIN_EMAIL || ''
    if (!sessionSecret || !configuredEmail) return false

    const dotIndex = token.lastIndexOf('.')
    if (dotIndex === -1) return false

    const payload = token.slice(0, dotIndex)
    const signature = token.slice(dotIndex + 1)

    const encoder = new TextEncoder()
    const keyData = encoder.encode(sessionSecret)
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const expectedSig = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      encoder.encode(payload)
    )

    const expectedBase64 = btoa(String.fromCharCode(...new Uint8Array(expectedSig)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    if (signature !== expectedBase64) return false

    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    if (!decoded?.email || !decoded?.expiresAt) return false
    if (decoded.email !== configuredEmail) return false
    if (Date.now() >= Number(decoded.expiresAt)) return false

    return true
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Main middleware
// ---------------------------------------------------------------------------

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // ── 1. Admin Route Protection ─────────────────────────────────────────────
  // Protect all /admin/* paths except the login page itself.
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin-login')) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value || null
    const isValidAdmin = await verifyAdminToken(token)

    if (!isValidAdmin) {
      const loginUrl = new URL('/admin-login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Admin is authenticated — pass through
    return NextResponse.next()
  }

  // ── 2. User Route Protection ──────────────────────────────────────────────
  // Protect authenticated app routes. The Supabase SSR client refreshes the
  // session cookie automatically on every request, keeping tokens fresh.
  const protectedPaths = ['/dashboard', '/settings', '/profile']
  const isProtectedPath = protectedPaths.some((p) => pathname.startsWith(p))

  if (isProtectedPath) {
    let response = NextResponse.next({
      request: { headers: request.headers },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value
          },
          set(name, value, options) {
            // Propagate cookie updates to both the request and response
            request.cookies.set({ name, value, ...options })
            response = NextResponse.next({ request: { headers: request.headers } })
            response.cookies.set({ name, value, ...options })
          },
          remove(name, options) {
            request.cookies.set({ name, value: '', ...options })
            response = NextResponse.next({ request: { headers: request.headers } })
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      const loginUrl = new URL('/login', request.url)
      // Preserve the original destination so the login page can redirect back
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/settings/:path*',
    '/profile/:path*',
  ],
}
