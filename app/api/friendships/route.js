// Friendships API - Manage friend requests and connections
import { NextResponse } from 'next/server'
import { createSupabaseRouteClient } from '@/lib/supabase-server'
import { authenticate } from '@/lib/auth-middleware'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Validation schemas
const sendRequestSchema = z.object({
  friendId: z.string().uuid(),
})

// GET /api/friendships - List all friendships for current user
export async function GET(request) {
  try {
    const supabase = createSupabaseRouteClient()
    const { user, error: authError } = await authenticate(request, supabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: friendships, error } = await supabase
      .from('friendships')
      .select('*, friend:profiles!friendships_friend_id_fkey(*)')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ friendships })
  } catch (error) {
    console.error('Failed to fetch friendships:', error)
    const response = { error: 'Failed to fetch friendships' }
    if (process.env.NODE_ENV === 'development') {
      response.details = error.message
    }
    return NextResponse.json(response, { status: 500 })
  }
}

// POST /api/friendships - Send a friend request
export async function POST(request) {
  try {
    const supabase = createSupabaseRouteClient()
    const { user, error: authError } = await authenticate(request, supabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = sendRequestSchema.parse(body)

    // Check if trying to friend yourself
    if (validatedData.friendId === user.id) {
      return NextResponse.json(
        { error: 'Cannot friend yourself' },
        { status: 400 }
      )
    }

    // Check if already friends or request exists
    const { data: existing } = await supabase
      .from('friendships')
      .select('id')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${validatedData.friendId}),and(user_id.eq.${validatedData.friendId},friend_id.eq.${user.id})`)
      .limit(1)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Friendship already exists or pending' },
        { status: 400 }
      )
    }

    const { data: friendship, error } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: validatedData.friendId,
        status: 'pending',
      })
      .select('*, friend:profiles!friendships_friend_id_fkey(*)')
      .single()

    if (error) throw error

    return NextResponse.json({ friendship })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to send friend request:', error)
    const response = { error: 'Failed to send friend request' }
    if (process.env.NODE_ENV === 'development') {
      response.details = error.message
    }
    return NextResponse.json(response, { status: 500 })
  }
}
