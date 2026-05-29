// User Heartbeat API Route
// Updates online status and last seen timestamp

import { NextResponse } from 'next/server'
import { createSupabaseRouteClient } from '@/lib/supabase-server'
import { authenticate } from '@/lib/auth-middleware'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const supabase = createSupabaseRouteClient()
    const { user } = await authenticate(request, supabase)

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        is_online: true,
        last_seen: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Heartbeat error:', error)

    const response = { error: 'Failed to update heartbeat' }
    if (process.env.NODE_ENV === 'development') {
      response.details = error.message
    }
    return NextResponse.json(response, { status: 500 })
  }
}
