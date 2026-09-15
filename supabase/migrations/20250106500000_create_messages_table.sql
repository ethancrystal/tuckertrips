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
-- with the correct `is_read` column so migration replay works end to end.

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can delete own sent messages" ON public.messages FOR DELETE USING (auth.uid() = sender_id);
