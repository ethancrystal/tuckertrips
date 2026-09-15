-- The `public.messages` table was never captured in a tracked migration —
-- it (and its RLS policies) were only ever created via the loose,
-- untracked setup scripts (add-missing-tables.sql,
-- RUN_THIS_ON_SUPABASE_ADDITIONAL_FEATURES.sql). Those scripts also define
-- the column as `read`, while the live production schema and every
-- consumer (app/api/messages/route.js, get_conversations,
-- get_unread_message_count, get_user_conversations, mark_conversation_read,
-- mark_messages_read) use `is_read`.
--
-- 20250107000000_fix_schema_inconsistencies.sql already assumes
-- public.messages exists (it only ALTERs it), so a fresh `supabase db
-- reset` fails before reaching that migration. This creates the table
-- with the correct `is_read` column so migration replay works end to end,
-- and reconciles it if a legacy `read`-column table already exists (e.g.
-- an environment set up via the loose setup scripts).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'messages'
  ) THEN
    CREATE TABLE public.messages (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      content TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'read'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'is_read'
  ) THEN
    -- Legacy table created by the loose setup scripts: bring it in line.
    ALTER TABLE public.messages RENAME COLUMN read TO is_read;
  END IF;
END $$;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Idempotent so this migration can be re-run against an environment where
-- the loose setup scripts already created same-named policies.
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- CWE-863 fix: the original "Users can update own messages" policy allowed
-- either participant to update ANY column via a raw table UPDATE — a
-- sender could rewrite `content` after the fact, or repoint
-- sender_id/recipient_id. Only the recipient marking a message read is a
-- legitimate direct-table update; content edits and read-state changes on
-- another user's behalf must go through the audited SECURITY DEFINER RPCs
-- (mark_messages_read / mark_conversation_read), which already check
-- auth.uid().
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
CREATE POLICY "Recipients can mark messages as read" ON public.messages
  FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

REVOKE UPDATE ON public.messages FROM authenticated;
GRANT UPDATE (is_read) ON public.messages TO authenticated;

DROP POLICY IF EXISTS "Users can delete own sent messages" ON public.messages;
CREATE POLICY "Users can delete own sent messages" ON public.messages FOR DELETE USING (auth.uid() = sender_id);
