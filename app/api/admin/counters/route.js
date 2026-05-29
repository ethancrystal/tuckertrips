// Counters API Route
// Manages dashboard counters for admin dashboards
// GET: Retrieve all counters
// POST/PUT: Update counters (super-admin only)

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminSession } from '@/lib/admin-auth-middleware'

const VALID_COUNTER_KEYS = ['totalUsers', 'activeBookings', 'revenue', 'reviews']

const DEFAULT_COUNTERS = {
  totalUsers: 0,
  activeBookings: 0,
  revenue: 0,
  reviews: 0
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

async function loadCounters() {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('admin_counters')
    .select('key, value')

  if (error) {
    console.error('Failed to load counters from Supabase:', error)
    return { ...DEFAULT_COUNTERS }
  }

  const counters = { ...DEFAULT_COUNTERS }
  for (const row of data || []) {
    if (VALID_COUNTER_KEYS.includes(row.key)) {
      counters[row.key] = Number(row.value)
    }
  }
  return counters
}

async function saveCounters(updates) {
  const supabase = getServiceClient()
  const rows = Object.entries(updates).map(([key, value]) => ({ key, value }))

  const { error } = await supabase
    .from('admin_counters')
    .upsert(rows, { onConflict: 'key' })

  if (error) {
    console.error('Failed to save counters to Supabase:', error)
    throw error
  }
}

function normalizeCounterPayload(body) {
  const payload = body?.counters && typeof body.counters === 'object'
    ? body.counters
    : body

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { error: 'Invalid counter payload' }
  }

  const updatedKeys = Object.keys(payload)
  const isValid = updatedKeys.every(key => VALID_COUNTER_KEYS.includes(key))

  if (!isValid) {
    return { error: 'Invalid counter keys' }
  }

  const normalizedCounters = {}

  for (const key of updatedKeys) {
    const value = Number(payload[key])

    if (!Number.isFinite(value) || value < 0) {
      return { error: `Invalid value for ${key}` }
    }

    normalizedCounters[key] = value
  }

  return { counters: normalizedCounters }
}

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const admin = await verifyAdminSession(request)

  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }

  try {
    const counters = await loadCounters()
    return NextResponse.json({ counters })
  } catch (error) {
    console.error('Counter load error:', error)
    return NextResponse.json(
      { error: 'Failed to load counters' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  const admin = await verifyAdminSession(request)

  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()

    const normalized = normalizeCounterPayload(body)

    if (normalized.error) {
      return NextResponse.json(
        { error: normalized.error },
        { status: 400 }
      )
    }

    const current = await loadCounters()
    const updated = { ...current, ...normalized.counters }
    await saveCounters(normalized.counters)

    return NextResponse.json({
      success: true,
      message: 'Counters updated successfully',
      counters: updated
    })

  } catch (error) {
    console.error('Counter update error:', error)
    return NextResponse.json(
      { error: 'Failed to update counters' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  return PUT(request)
}
