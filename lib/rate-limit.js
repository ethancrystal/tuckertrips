// ============================================================================
// Rate Limiting Middleware
// ============================================================================
//
// IMPORTANT: Production Upgrade Path
// ---------------------------------
// This is an in-memory rate limiter suitable for:
// - Development environments
// - Single-instance deployments
// - Applications with low traffic
//
// FOR PRODUCTION with multiple instances (Vercel, Docker Swarm, etc.),
// you MUST use a distributed rate limiting solution:
//
// Recommended: Upstash Redis (Serverless, edge-compatible)
// ---------------------------------------------------------
// 1. Install dependencies:
//    pnpm add @upstash/ratelimit @upstash/redis
//
// 2. Set environment variables:
//    UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
//    UPSTASH_REDIS_REST_TOKEN=your-redis-token
//
// 3. Replace this file with:
//
//    import { Ratelimit } from '@upstash/ratelimit'
//    import { Redis } from '@upstash/redis'
//
//    const redis = new Redis({
//      url: process.env.UPSTASH_REDIS_REST_URL,
//      token: process.env.UPSTASH_REDIS_REST_TOKEN,
//    })
//
//    // Sliding window rate limiter (more accurate)
//    export const ratelimit = new Ratelimit({
//      redis,
//      limiter: Ratelimit.slidingWindow(10, '10 s'),
//      analytics: true,
//      prefix: 'tucker-trips',
//    })
//
//    // Usage in API routes:
//    import { ratelimit } from '@/lib/rate-limit'
//    import { headers } from 'next/headers'
//
//    export async function POST(request) {
//      const ip = headers().get('x-forwarded-for')?.split(',')[0] ?? 'anonymous'
//      const { success, remaining, reset } = await ratelimit.limit(ip)
//
//      if (!success) {
//        return new Response('Too Many Requests', { status: 429 })
//      }
//
//      // ... rest of your handler
//    }
//
// Alternative: Cloudflare Workers (if using Cloudflare)
// ------------------------------------------------------
// Set up rate limiting via Cloudflare dashboard or Workers KV
// See: https://developers.cloudflare.com/workers/runtime-apis/
//
// Alternative: Vercel Edge Config (if using Vercel)
// -----------------------------------------------------
// See: https://vercel.com/docs/storage/edge-config
//
// Testing Rate Limiting
// ---------------------
// Test your rate limits with:
// curl -X POST http://localhost:3000/api/auth/login \
//   -H "Content-Type: application/json" \
//   -d '{"email":"test@example.com","password":"wrong"}'
//
// Run 6+ times quickly to trigger rate limit (default: 5 req/min)
//
// ============================================================================

if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
  console.warn(
    '[rate-limit] Using in-memory rate limiter. ' +
    'This does NOT work across multiple server instances. ' +
    'See the comments at the top of lib/rate-limit.js for the Upstash Redis upgrade path.'
  )
}

const rateLimits = new Map()

/**
 * Rate limiter middleware
 * @param {string} identifier - Unique identifier (IP address or user ID)
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} - { allowed: boolean, remaining: number, resetAt: Date }
 */
export function rateLimit(identifier, maxRequests = 5, windowMs = 60000) {
  const now = Date.now()
  const key = `${identifier}:${Math.floor(now / windowMs)}`

  const record = rateLimits.get(key)

  if (!record) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetAt: new Date(now + windowMs) }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: new Date(record.resetAt) }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count, resetAt: new Date(record.resetAt) }
}

/**
 * Express/Next.js middleware for rate limiting
 * @param {Object} options - { maxRequests, windowMs, identifier }
 */
export function createRateLimitMiddleware(options = {}) {
  const {
    maxRequests = 5,
    windowMs = 60000, // 1 minute
    identifierFn = (req) => {
      // Use IP address or user ID as identifier
      return req.headers.get('x-forwarded-for')?.split(',')[0] ||
             req.headers.get('x-real-ip') ||
             'anonymous'
    }
  } = options

  return async function middleware(request) {
    const identifier = identifierFn(request)
    const result = rateLimit(identifier, maxRequests, windowMs)

    if (!result.allowed) {
      return {
        allowed: false,
        error: {
          status: 429,
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000)
        }
      }
    }

    return { allowed: true }
  }
}

/**
 * Check rate limit from API route
 * @param {Request} request - Next.js Request object
 * @param {string} key - Rate limit key
 * @param {number} maxRequests - Max requests
 * @param {number} windowMs - Window in milliseconds
 */
export async function checkRateLimit(request, key, maxRequests = 5, windowMs = 60000) {
  const identifier = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     key // Fallback to key if no IP

  const result = rateLimit(`${key}:${identifier}`, maxRequests, windowMs)

  if (!result.allowed) {
    return {
      allowed: false,
      retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000)
    }
  }

  return { allowed: true }
}

/**
 * Clean up old rate limit records (call periodically)
 */
export function cleanupRateLimits() {
  const now = Date.now()
  const windowMs = 60000 // Default window
  const cutoff = Math.floor(now / windowMs)

  for (const [key] of rateLimits.entries()) {
    const keyTimestamp = parseInt(key.split(':')[1] || '0')
    if (keyTimestamp < cutoff) {
      rateLimits.delete(key)
    }
  }
}

// Clean up every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000)
}
