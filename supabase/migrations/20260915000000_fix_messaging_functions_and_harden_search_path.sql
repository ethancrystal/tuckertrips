-- Fix broken column reference: messages.read was renamed to messages.is_read
-- at some point, but get_unread_message_count, get_user_conversations, and
-- mark_conversation_read were never updated. This was causing runtime errors
-- for the unread-count badge (DashboardNew.jsx) and the conversations list
-- (app/api/messages/route.js).
--
-- Also sets `search_path` on all SECURITY DEFINER / trigger functions in
-- this file to close the "Function Search Path Mutable" security lint, and
-- revokes EXECUTE from PUBLIC/anon on the SECURITY DEFINER messaging
-- functions (all of them require an authenticated caller's own user_uuid,
-- so anonymous access was never intentional).

CREATE OR REPLACE FUNCTION public.get_unread_message_count(user_uuid uuid)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.messages
    WHERE recipient_id = user_uuid AND is_read = false
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_conversations(user_uuid uuid)
 RETURNS TABLE(conversation_id uuid, other_user_id uuid, other_user_name text, other_user_avatar text, last_message_content text, last_message_time timestamp with time zone, unread_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH latest_messages AS (
    SELECT DISTINCT ON (
      CASE WHEN sender_id = user_uuid THEN recipient_id ELSE sender_id END
    )
      id,
      CASE WHEN sender_id = user_uuid THEN recipient_id ELSE sender_id END as other_uid,
      content,
      created_at,
      is_read,
      sender_id
    FROM public.messages
    WHERE (sender_id = user_uuid OR recipient_id = user_uuid)
    ORDER BY
      CASE WHEN sender_id = user_uuid THEN recipient_id ELSE sender_id END,
      created_at DESC
  ),
  unread_counts AS (
    SELECT
      sender_id as other_uid,
      COUNT(*) as cnt
    FROM public.messages
    WHERE recipient_id = user_uuid AND is_read = false
    GROUP BY sender_id
  )
  SELECT
    lm.id as conversation_id,
    lm.other_uid as other_user_id,
    p.full_name as other_user_name,
    p.avatar_url as other_user_avatar,
    lm.content as last_message_content,
    lm.created_at as last_message_time,
    COALESCE(uc.cnt, 0)::BIGINT as unread_count
  FROM latest_messages lm
  JOIN public.profiles p ON lm.other_uid = p.id
  LEFT JOIN unread_counts uc ON lm.other_uid = uc.other_uid
  ORDER BY lm.created_at DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.mark_conversation_read(user_uuid uuid, other_user_uuid uuid)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  updated_count BIGINT;
BEGIN
  UPDATE public.messages
  SET is_read = true
  WHERE recipient_id = user_uuid AND sender_id = other_user_uuid AND is_read = false;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_admin_credentials_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Close SECURITY DEFINER exposure to unauthenticated/public callers.
REVOKE EXECUTE ON FUNCTION public.get_conversations(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_conversations(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_unread_message_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_unread_message_count(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_user_conversations(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_conversations(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.mark_conversation_read(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_conversation_read(uuid, uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.mark_messages_read(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_messages_read(uuid, uuid) TO authenticated;

-- handle_new_user is trigger-only (fires on auth.users insert); it should
-- never be invoked directly via PostgREST RPC.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
