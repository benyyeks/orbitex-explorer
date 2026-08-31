CREATE TABLE public.ask_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New chat',
  mode text NOT NULL DEFAULT 'chat',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ask_conversations_title_len CHECK (char_length(title) BETWEEN 1 AND 120),
  CONSTRAINT ask_conversations_mode_valid CHECK (mode = ANY (ARRAY['chat','quiz','explain','resources']))
);

CREATE INDEX ask_conversations_user_updated_idx ON public.ask_conversations (user_id, updated_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ask_conversations TO authenticated;
GRANT ALL ON public.ask_conversations TO service_role;

ALTER TABLE public.ask_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own conversations"
ON public.ask_conversations FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER ask_conversations_set_updated_at
BEFORE UPDATE ON public.ask_conversations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.ask_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.ask_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ask_messages_role_valid CHECK (role = ANY (ARRAY['user','assistant'])),
  CONSTRAINT ask_messages_content_len CHECK (char_length(content) BETWEEN 1 AND 20000)
);

CREATE INDEX ask_messages_conversation_idx ON public.ask_messages (conversation_id, created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ask_messages TO authenticated;
GRANT ALL ON public.ask_messages TO service_role;

ALTER TABLE public.ask_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own conversation messages"
ON public.ask_messages FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);