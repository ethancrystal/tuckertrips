// Update friendship status (accept/reject/block)
import { NextResponse } from 'next/server'
import { createSupabaseRouteClient } from '@/lib/supabase-server'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const updateStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'blocked']),
})

// PATCH /api/friendships/[id] - Update friendship status
export async function PATCH(
  request,
  { params }
) {
  try {
    const supabase = createSupabaseRouteClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const friendshipId = params.id
    const body = await request.json()
    const validatedData = updateStatusSchema.parse(body)

    // First, get the friendship to check permissions
    const { data: friendship, error: fetchError } = await supabase
      .from('friendships')
      .select('*')
      .eq('id', friendshipId)
      .single()

    if (fetchError || !friendship) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 })
    }

    // Only the recipient (friend_id) can update the status
    if (friendship.friend_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this friendship' },
        { status: 403 }
      )
    }

    // Single-row, bidirectional friendship model: the GET query matches on
    // either user_id or friend_id, so a single accepted row is sufficient.
    // No reciprocal row is created — that previously caused duplicate listings
    // and UNIQUE(user_id, friend_id) accept failures when a reverse-direction
    // request already existed.
    const { data: updated, error: updateError } = await supabase
      .from('friendships')
      .update({ status: validatedData.status })
      .eq('id', friendshipId)
      .select('*, friend:profiles!friendships_friend_id_fkey(*)')
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      friendship: updated,
      message:
        validatedData.status === 'accepted'
          ? 'Friend request accepted'
          : `Friend request ${validatedData.status}`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to update friendship:', error)
    const response = { error: 'Failed to update friendship' }
    if (process.env.NODE_ENV === 'development') {
      response.details = error.message
    }
    return NextResponse.json(response, { status: 500 })
  }
}

// DELETE /api/friendships/[id] - Delete/remove friendship
export async function DELETE(
  request,
  { params }
) {
  try {
    const supabase = createSupabaseRouteClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const friendshipId = params.id

    // Check permissions - must be one of the users in the friendship
    const { data: friendship, error: fetchError } = await supabase
      .from('friendships')
      .select('*')
      .eq('id', friendshipId)
      .single()

    if (fetchError || !friendship) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 })
    }

    if (friendship.user_id !== user.id && friendship.friend_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this friendship' },
        { status: 403 }
      )
    }

    // Delete BOTH directions of this friendship pair. The single-row model uses
    // one row going forward, but legacy data created by the old accept path may
    // still contain a reciprocal (friend_id, user_id) row; leaving it behind
    // would keep friends-visibility trip access alive after "removed". Deleting
    // the unordered pair normalizes that and is idempotent. RLS permits a
    // participant to delete rows where they are either user_id or friend_id.
    const { error: deleteError } = await supabase
      .from('friendships')
      .delete()
      .or(
        `and(user_id.eq.${friendship.user_id},friend_id.eq.${friendship.friend_id}),` +
          `and(user_id.eq.${friendship.friend_id},friend_id.eq.${friendship.user_id})`
      )

    if (deleteError) throw deleteError

    return NextResponse.json({ message: 'Friendship removed' })
  } catch (error) {
    console.error('Failed to delete friendship:', error)
    const response = { error: 'Failed to delete friendship' }
    if (process.env.NODE_ENV === 'development') {
      response.details = error.message
    }
    return NextResponse.json(response, { status: 500 })
  }
}
