/**
 * Unified API Route Authorization Helpers
 *
 * Provides two Higher-Order Functions (HOFs) that wrap Next.js App Router
 * route handlers and guarantee a valid auth context before the handler runs:
 *
 *   withAuth(handler)   — requires a logged-in Supabase user
 *   withAdmin(handler)  — requires a valid admin session cookie
 *
 * Both HOFs inject the resolved identity into `request` so handlers never
 * need to repeat auth boilerplate:
 *   request.user     — Supabase User object  (withAuth)
 *   request.supabase — authenticated client  (withAuth)
 *   request.admin    — { email, authenticated, expiresAt } (withAdmin)
 *
 * @deprecated authenticate()       — use withAuth() instead
 * @deprecated authenticateOrThrow() — use withAuth() instead
 */

import { createSupabaseRouteClient } from './supabase-server'
import {
  unauthorizedResponse,
  forbiddenResponse,
  errorResponse,
} from './api-response'
import { verifyAdminSession } from './admin-auth-middleware'

// ---------------------------------------------------------------------------
// withAuth — standard user authentication wrapper
// ---------------------------------------------------------------------------

/**
 * Wraps a Next.js route handler and ensures a valid Supabase user session
 * exists before the handler is invoked.
 *
 * Supports both cookie-based sessions (SSR) and Bearer token auth headers
 * (mobile / API clients).
 *
 * @param {Function} handler - The route handler (request, context) => Response
 * @returns {Function} Wrapped handler
 *
 * @example
 * // app/api/trips/route.js
 * import { withAuth } from '@/lib/auth-middleware'
 * import { successResponse } from '@/lib/api-response'
 *
 * export const GET = withAuth(async (request) => {
 *   const { user, supabase } = request
 *   const { data } = await supabase.from('trips').select('*').eq('user_id', user.id)
 *   return successResponse(data)
 * })
 */
export function withAuth(handler) {
  return async (request, context) => {
    try {
      const supabase = createSupabaseRouteClient()

      // Primary: cookie-based session (SSR)
      let { data: { user } } = await supabase.auth.getUser()

      // Fallback: Bearer token in Authorization header (API / mobile clients)
      if (!user) {
        const authHeader = request.headers.get('authorization') || ''
        const token = authHeader.startsWith('Bearer ')
          ? authHeader.slice(7).trim()
          : null

        if (token) {
          const { data: tokenData } = await supabase.auth.getUser(token)
          user = tokenData?.user ?? null
        }
      }

      if (!user) {
        return unauthorizedResponse('Authentication required')
      }

      // Inject resolved identity into the request object
      request.user = user
      request.supabase = supabase

      return await handler(request, context)
    } catch (err) {
      console.error('[withAuth] Unexpected error:', err)
      return errorResponse('Internal server error', 500, err)
    }
  }
}

// ---------------------------------------------------------------------------
// withAdmin — admin session authentication wrapper
// ---------------------------------------------------------------------------

/**
 * Wraps a Next.js route handler and ensures a valid admin session cookie
 * exists before the handler is invoked.
 *
 * @param {Function} handler - The route handler (request, context) => Response
 * @returns {Function} Wrapped handler
 *
 * @example
 * // app/api/admin/users/route.js
 * import { withAdmin } from '@/lib/auth-middleware'
 * import { successResponse } from '@/lib/api-response'
 *
 * export const GET = withAdmin(async (request) => {
 *   const { admin, supabase } = request
 *   // admin.email is the verified admin email
 *   const { data } = await supabase.from('profiles').select('*')
 *   return successResponse(data)
 * })
 */
export function withAdmin(handler) {
  return async (request, context) => {
    try {
      const admin = await verifyAdminSession(request)

      if (!admin) {
        return forbiddenResponse('Admin access required')
      }

      request.admin = admin

      return await handler(request, context)
    } catch (err) {
      console.error('[withAdmin] Unexpected error:', err)
      return errorResponse('Internal server error', 500, err)
    }
  }
}

// ---------------------------------------------------------------------------
// Legacy exports — kept for backward compatibility during migration
// Remove these once all routes have been migrated to withAuth / withAdmin.
// ---------------------------------------------------------------------------

/**
 * @deprecated Use withAuth() HOF instead.
 * Resolves the current user from cookie session or Bearer token.
 */
export async function authenticate(request, supabase) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (user) return { user, error: null }

  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null

  if (token) {
    const { data: tokenData, error: tokenError } = await supabase.auth.getUser(token)
    if (tokenError) return { user: null, error: 'Invalid or expired token' }
    if (tokenData?.user) return { user: tokenData.user, error: null }
  }

  return { user: null, error: 'Not authenticated' }
}

/**
 * @deprecated Use withAuth() HOF instead.
 * Throws 'Not authenticated' if no valid session is found.
 */
export async function authenticateOrThrow(request, supabase) {
  const { user, error } = await authenticate(request, supabase)
  if (error || !user) throw new Error(error || 'Not authenticated')
  return user
}
