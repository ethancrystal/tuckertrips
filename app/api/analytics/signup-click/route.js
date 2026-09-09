// Sign-Up Button Click Tracking API
// Public endpoint to track Sign-Up button clicks for conversion analytics
// No authentication required - this is public tracking.
//
// Writes go through the service role key, not the anon key. The signup_clicks
// RLS policies allow an anonymous INSERT but restrict SELECT to authenticated
// users, and Postgres applies SELECT policies to INSERT ... RETURNING - which
// is what the .select() below issues. Under the anon key that combination
// fails with 'new row violates row-level security policy'. This route is
// server-only and rate limited by session and IP, so the service role client
// is the appropriate caller here (same pattern as /api/storage/upload).

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RATE_LIMIT_WINDOW = 60000 // 1 minute
const MAX_CLICKS_PER_SESSION = 10 // Max 10 clicks per session per minute
const MAX_CLICKS_PER_IP = 30 // Max 30 clicks per IP per minute

const sessionTracker = new Map()
const ipTracker = new Map()

function isRateLimitedByKey(tracker, key, maxClicks) {
  const now = Date.now()
  const data = tracker.get(key)

  if (!data) {
    tracker.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return false
  }

  if (now > data.resetAt) {
    tracker.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return false
  }

  if (data.count >= maxClicks) {
    return true
  }

  data.count++
  return false
}

function isRateLimited(sessionId, ip) {
  const sessionLimited = isRateLimitedByKey(sessionTracker, sessionId, MAX_CLICKS_PER_SESSION)
  const ipLimited = ip && ip !== 'unknown'
    ? isRateLimitedByKey(ipTracker, ip, MAX_CLICKS_PER_IP)
    : false
  return sessionLimited || ipLimited
}

setInterval(() => {
  const now = Date.now()
  for (const [key, data] of sessionTracker.entries()) {
    if (now > data.resetAt) sessionTracker.delete(key)
  }
  for (const [key, data] of ipTracker.entries()) {
    if (now > data.resetAt) ipTracker.delete(key)
  }
}, RATE_LIMIT_WINDOW)

export async function POST(request) {
  try {
    const body = await request.json()
    const { sessionId, buttonLocation, referrer } = body
    
    // Validate required fields
    if (!sessionId || !buttonLocation) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, buttonLocation' },
        { status: 400 }
      )
    }
    
    // Validate button location
    const validLocations = ['header', 'hero_start_trip', 'hero_browse_trips', 'auth_modal_tab', 'auth_modal_submit']
    if (!validLocations.includes(buttonLocation)) {
      return NextResponse.json(
        { error: `Invalid buttonLocation. Must be one of: ${validLocations.join(', ')}` },
        { status: 400 }
      )
    }
    
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               'unknown'

    if (isRateLimited(sessionId, ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }
    
    // Create Supabase client (service role - server-only, bypasses RLS)
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

    if (!serviceKey) {
      console.warn('[Analytics] Missing SUPABASE_SERVICE_ROLE_KEY - signup click not tracked')
      return NextResponse.json(
        { success: false, message: 'Click not tracked (analytics unavailable)' },
        { status: 200 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    
    // Insert click record
    const { data, error } = await supabase
      .from('signup_clicks')
      .insert({
        session_id: sessionId,
        button_location: buttonLocation,
        user_agent: userAgent,
        ip_hash: ip,
        referrer: referrer || null,
      })
      .select()
      .single()
    
    if (error) {
      console.warn('[Analytics] Failed to track signup click:', error.message)
      return NextResponse.json(
        { success: false, message: 'Click not tracked (analytics unavailable)' },
        { status: 200 }
      )
    }
    
    return NextResponse.json({
      success: true,
      clickId: data.id,
      message: 'Click tracked successfully'
    })
    
  } catch (error) {
    console.warn('[Analytics] Signup click tracking error:', error.message)
    return NextResponse.json(
      { success: false, message: 'Click not tracked' },
      { status: 200 }
    )
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
