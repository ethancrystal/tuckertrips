// Messages API Routes
// Handles sending and retrieving messages

import { withAuth } from '@/lib/auth-middleware'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
} from '@/lib/api-response'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'

const messageSchema = z.object({
  recipientId: z.string().uuid('Invalid recipient ID'),
  content: z.string().min(1, 'Message content is required'),
})

// POST — Send a new message
export const POST = withAuth(async (request) => {
  try {
    const { user, supabase } = request
    const body = await request.json()

    const parsed = messageSchema.safeParse(body)
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.errors)
    }
    const { recipientId, content } = parsed.data

    // Verify recipient exists
    const { data: recipient, error: recipientError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', recipientId)
      .single()

    if (recipientError || !recipient) {
      return notFoundResponse('Recipient not found')
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        id: uuidv4(),
        sender_id: user.id,
        recipient_id: recipientId,
        content,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return successResponse(message, 201)
  } catch (error) {
    console.error('Send message error:', error)

    if (error instanceof z.ZodError) {
      return validationErrorResponse(error.errors)
    }

    return errorResponse('Failed to send message', 500, error)
  }
})

// GET — Get conversations or a specific conversation thread
export const GET = withAuth(async (request) => {
  try {
    const { user, supabase } = request
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversation')

    if (conversationId) {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(conversationId)) {
        return errorResponse('Invalid conversation ID format', 400)
      }

      const { data: messages, error } = await supabase
        .from('messages')
        .select(
          `*,
          sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
          recipient:profiles!messages_recipient_id_fkey(id, full_name, avatar_url)`
        )
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${conversationId}),` +
          `and(sender_id.eq.${conversationId},recipient_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true })

      if (error) throw error

      // Mark incoming messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', conversationId)
        .eq('recipient_id', user.id)
        .eq('is_read', false)

      return successResponse(messages || [])
    }

    // Return all conversations via RPC
    const { data: conversations, error } = await supabase.rpc(
      'get_user_conversations',
      { user_uuid: user.id }
    )

    if (error) throw error

    return successResponse(conversations || [])
  } catch (error) {
    console.error('Get messages error:', error)
    return errorResponse('Failed to get messages', 500, error)
  }
})
