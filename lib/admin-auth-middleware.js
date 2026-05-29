// Admin Authentication Middleware
// Verifies signed admin sessions from cookies for protecting admin routes

import crypto from 'node:crypto'
import { cookies } from 'next/headers'

const ADMIN_SESSION_COOKIE = 'admin_session'
const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24

function getAdminConfig() {
  return {
    email: process.env.ADMIN_EMAIL || '',
    password: process.env.ADMIN_PASSWORD || '',
    sessionSecret: process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET || '',
  }
}

function isAdminConfigured() {
  const config = getAdminConfig()
  return Boolean(config.email && config.password && config.sessionSecret)
}

function base64UrlEncode(value) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function createSignature(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url')
}

function safeEqual(a, b) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)

  if (left.length !== right.length) return false
  return crypto.timingSafeEqual(left, right)
}

function parseCookieHeader(cookieHeader) {
  return cookieHeader.split(';').reduce((accumulator, cookieValue) => {
    const trimmedCookie = cookieValue.trim()
    if (!trimmedCookie) return accumulator

    const separatorIndex = trimmedCookie.indexOf('=')
    if (separatorIndex === -1) return accumulator

    const key = trimmedCookie.slice(0, separatorIndex)
    const value = trimmedCookie.slice(separatorIndex + 1)
    accumulator[key] = value
    return accumulator
  }, {})
}

export function createAdminSessionToken(email, issuedAt = Date.now()) {
  const { sessionSecret } = getAdminConfig()

  if (!sessionSecret) {
    throw new Error('Missing admin session secret')
  }

  const expiresAt = issuedAt + ADMIN_SESSION_MAX_AGE_SECONDS * 1000
  const payload = base64UrlEncode(JSON.stringify({ email, issuedAt, expiresAt }))
  const signature = createSignature(payload, sessionSecret)

  return `${payload}.${signature}`
}

export function readAdminSessionToken(cookieHeader) {
  if (!cookieHeader) return null
  const parsedCookies = parseCookieHeader(cookieHeader)
  return parsedCookies[ADMIN_SESSION_COOKIE] || null
}

export function verifyAdminSessionToken(token) {
  try {
    if (!token) return null

    const { email: configuredEmail, sessionSecret } = getAdminConfig()
    if (!configuredEmail || !sessionSecret) return null

    const [payload, signature] = token.split('.')
    if (!payload || !signature) return null

    const expectedSignature = createSignature(payload, sessionSecret)
    if (!safeEqual(signature, expectedSignature)) return null

    const session = JSON.parse(base64UrlDecode(payload))
    if (!session?.email || !session?.expiresAt) return null
    if (session.email !== configuredEmail) return null
    if (Date.now() >= Number(session.expiresAt)) return null

    return {
      email: session.email,
      authenticated: true,
      expiresAt: Number(session.expiresAt),
    }
  } catch (error) {
    console.error('Admin session token verification error:', error)
    return null
  }
}

/**
 * Verifies admin authentication from cookies
 * Use this in API routes to protect admin endpoints
 */
export async function verifyAdminSession(request) {
  try {
    const token = readAdminSessionToken(request.headers.get('cookie'))
    return verifyAdminSessionToken(token)
  } catch (error) {
    console.error('Admin session verification error:', error)
    return null
  }
}

/**
 * Server-side admin verification for server components
 */
export async function getAdminSession() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
    return verifyAdminSessionToken(token)
  } catch (error) {
    console.error('Get admin session error:', error)
    return null
  }
}

function createAdminSessionCookie(value, maxAge) {
  const secure = process.env.NODE_ENV === 'production'
  const secureDirective = secure ? '; Secure' : ''
  return `${ADMIN_SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict${secureDirective}; Max-Age=${maxAge}`
}

/**
 * Creates admin session cookie response headers
 */
export function createAdminSessionHeaders(email) {
  return {
    'Set-Cookie': createAdminSessionCookie(
      createAdminSessionToken(email),
      ADMIN_SESSION_MAX_AGE_SECONDS
    )
  }
}

/**
 * Clears admin session cookie response headers
 */
export function clearAdminSessionHeaders() {
  return {
    'Set-Cookie': createAdminSessionCookie('', 0)
  }
}

/**
 * Validates admin credentials
 */
export function validateAdminCredentials(email, password) {
  const config = getAdminConfig()
  if (!isAdminConfigured()) return false

  return email === config.email && password === config.password
}

export function assertAdminConfiguration() {
  if (!isAdminConfigured()) {
    throw new Error('Missing admin authentication configuration')
  }
}

/**
 * Middleware wrapper for admin-only API routes
 */
export function requireAdmin(handler) {
  return async (request, context) => {
    const admin = await verifyAdminSession(request)

    if (!admin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    request.admin = admin
    return handler(request, context)
  }
}

export { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE_SECONDS }
