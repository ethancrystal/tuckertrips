-- Fix broken column reference: messages.read was renamed to messages.is_read
-- at some point, but get_unread_message_count, get_user_conversations, and
-- mark_conversation_read were never updated. This was causing runtime errors
-- for the unread-count badge (DashboardNew.jsx) and the conversations list
-- (app/api/messages/route.js).
--
-- Also sets `search_path` on all SECURITY DEFINER / trigger functions in
-- this file to close the "Function Search Path Mutable" security lint,
-- revokes EXECUTE from PUBLIC/anon on the SECURITY DEFINER messaging
-- functions (all of them require an authenticated caller's own user id, so
-- anonymous access was never intentional), and adds an auth.uid() ==
-- caller-identity check inside every SECURITY DEFINER messaging function.
-- Without that check, any authenticated user could pass an arbitrary
-- user_uuid/p_user_id and read or mark-as-read another user's messages,
-- since these functions run with elevated privilege and bypass RLS.

CREATE OR REPLACE FUNCTION public.get_conversations(p_user_id uuid)
 RETURNS TABLE(other_user_id uuid, other_user_name text, other_user_avatar text, last_message text, last_message_at timestamp with time zone, unread_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Not authorized to view this user''s conversations' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH conversation_partners AS (
    SELECT DISTINCT
      CASE WHEN sender_id = p_user_id THEN recipient_id ELSE sender_id END AS partner_id
    FROM public.messages
    WHERE sender_id = p_user_id OR recipient_id = p_user_id
  ),
  latest_messages AS (
    SELECT DISTINCT ON (cp.partner_id)
      cp.partner_id,
      m.content AS last_msg,
      m.created_at AS last_msg_at
    FROM conversation_partners cp
    JOIN public.messages m ON (
      (m.sender_id = p_user_id AND m.recipient_id = cp.partner_id) OR
      (m.sender_id = cp.partner_id AND m.recipient_id = p_user_id)
    )
    ORDER BY cp.partner_id, m.created_at DESC
  ),
  unread_counts AS (
    SELECT
      sender_id AS partner_id,
      COUNT(*) AS unread
    FROM public.messages
    WHERE recipient_id = p_user_id AND is_read = false
    GROUP BY sender_id
  )
  SELECT
    lm.partner_id AS other_user_id,
    p.full_name AS other_user_name,
    p.avatar_url AS other_user_avatar,
    lm.last_msg AS last_message,
    lm.last_msg_at AS last_message_at,
    COALESCE(uc.unread, 0) AS unread_count
  FROM latest_messages lm
  JOIN public.profiles p ON p.id = lm.partner_id
  LEFT JOIN unread_counts uc ON uc.partner_id = lm.partner_id
  ORDER BY lm.last_msg_at DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_unread_message_count(user_uuid uuid)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS DISTINCT FROM user_uuid THEN
    RAISE EXCEPTION 'Not authorized to view this user''s unread count' USING ERRCODE = '42501';
  END IF;

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
  IF auth.uid() IS DISTINCT FROM user_uuid THEN
    RAISE EXCEPTION 'Not authorized to view this user''s conversations' USING ERRCODE = '42501';
  END IF;

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
  IF auth.uid() IS DISTINCT FROM user_uuid THEN
    RAISE EXCEPTION 'Not authorized to mark this user''s messages as read' USING ERRCODE = '42501';
  END IF;

  UPDATE public.messages
  SET is_read = true
  WHERE recipient_id = user_uuid AND sender_id = other_user_uuid AND is_read = false;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.mark_messages_read(p_sender_id uuid, p_recipient_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_recipient_id THEN
    RAISE EXCEPTION 'Not authorized to mark this user''s messages as read' USING ERRCODE = '42501';
  END IF;

  UPDATE public.messages
  SET is_read = true, updated_at = NOW()
  WHERE sender_id = p_sender_id
    AND recipient_id = p_recipient_id
    AND is_read = false;
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
