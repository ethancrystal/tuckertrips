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

    // For 'accepted' status, also create a reciprocal friendship
    if (validatedData.status === 'accepted') {
      const { error: updateError } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)

      if (updateError) throw updateError

      // Create reciprocal friendship
      const { error: reciprocalError } = await supabase
        .from('friendships')
        .insert({
          user_id: friendship.friend_id,
          friend_id: friendship.user_id,
          status: 'accepted',
        })

      if (reciprocalError) {
        // If reciprocal fails, attempt rollback of the first update
        const { error: rollbackError } = await supabase
          .from('friendships')
          .update({ status: 'pending' })
          .eq('id', friendshipId)

        if (rollbackError) {
          console.error(
            'CRITICAL: Friendship accept partial failure — reciprocal insert failed AND rollback failed.',
            { friendshipId, reciprocalError, rollbackError }
          )
          return NextResponse.json(
            { error: 'Friendship accept failed and state may be inconsistent. Please contact support.' },
            { status: 500 }
          )
        }

        return NextResponse.json(
          { error: 'Failed to accept friendship — the operation was rolled back. Please try again.' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        friendship: { ...friendship, status: 'accepted' },
        message: 'Friend request accepted'
      })
    }

    // For rejected/blocked, just update the status
    const { data: updated, error: updateError } = await supabase
      .from('friendships')
      .update({ status: validatedData.status })
      .eq('id', friendshipId)
      .select('*, friend:profiles(*)')
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ friendship: updated })
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

    // Delete the friendship and its reciprocal if accepted
    await supabase.from('friendships').delete().eq('id', friendshipId)

    if (friendship.status === 'accepted') {
      // Also delete the reciprocal friendship
      await supabase
        .from('friendships')
        .delete()
        .eq('user_id', friendship.friend_id)
        .eq('friend_id', friendship.user_id)
    }

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
