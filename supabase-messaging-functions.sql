-- Additional functions for messaging system
-- Run this after the enhanced schema

-- Function to get user conversations
CREATE OR REPLACE FUNCTION public.get_user_conversations(user_uuid UUID)
RETURNS TABLE (
  conversation_id UUID,
  other_user_id UUID,
  other_user_name TEXT,
  other_user_avatar TEXT,
  last_message_content TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH latest_messages AS (
    SELECT DISTINCT ON (
      CASE WHEN sender_id = user_uuid THEN recipient_id ELSE sender_id END
    )
      id,
      CASE WHEN sender_id = user_uuid THEN recipient_id ELSE sender_id END as other_user_id,
      content,
      created_at,
      read,
      sender_id
    FROM public.messages
    WHERE (sender_id = user_uuid OR recipient_id = user_uuid)
    ORDER BY
      CASE WHEN sender_id = user_uuid THEN recipient_id ELSE sender_id END,
      created_at DESC
  ),
  unread_counts AS (
    SELECT
      CASE WHEN sender_id = user_uuid THEN recipient_id ELSE sender_id END as other_user_id,
      COUNT(*) as unread_count
    FROM public.messages
    WHERE recipient_id = user_uuid AND read = false
    GROUP BY other_user_id
  )
  SELECT
    lm.id as conversation_id,
    lm.other_user_id,
    p.full_name as other_user_name,
    p.avatar_url as other_user_avatar,
    lm.content as last_message_content,
    lm.created_at as last_message_time,
    COALESCE(uc.unread_count, 0) as unread_count
  FROM latest_messages lm
  JOIN public.profiles p ON lm.other_user_id = p.id
  LEFT JOIN unread_counts uc ON lm.other_user_id = uc.other_user_id
  ORDER BY lm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count
CREATE OR REPLACE FUNCTION public.get_unread_message_count(user_uuid UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.messages
    WHERE recipient_id = user_uuid AND read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all messages as read for a conversation
CREATE OR REPLACE FUNCTION public.mark_conversation_read(
  user_uuid UUID,
  other_user_uuid UUID
)
RETURNS BIGINT AS $$
BEGIN
  UPDATE public.messages
  SET read = true
  WHERE recipient_id = user_uuid AND sender_id = other_user_uuid AND read = false;

  RETURN (
    SELECT COUNT(*)
    FROM public.messages
    WHERE recipient_id = user_uuid AND sender_id = other_user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;