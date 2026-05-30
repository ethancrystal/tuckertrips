// Get Online Users API Route
// Returns list of currently online users

import { NextResponse } from 'next/server'
import { createSupabaseRouteClient } from '@/lib/supabase-server'
import { authenticate } from '@/lib/auth-middleware'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const supabase = createSupabaseRouteClient()
    const { user } = await authenticate(request, supabase)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { data: onlineUsers, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, is_online, last_seen')
      .or(`is_online.eq.true,last_seen.gte.${fiveMinutesAgo}`)
      .neq('id', user.id)
      .order('last_seen', { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json(onlineUsers || [])

  } catch (error) {
    console.error('Get online users error:', error)

    const response = { error: 'Failed to get online users' }
    if (process.env.NODE_ENV === 'development') {
      response.details = error.message
    }
    return NextResponse.json(response, { status: 500 })
  }
}
