DROP POLICY IF EXISTS "Users manage their own conversation messages" ON public.ask_messages;
CREATE POLICY "Users read their own messages" ON public.ask_messages
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add their own questions" ON public.ask_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND role = 'user'
    AND EXISTS (SELECT 1 FROM public.ask_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
  );
CREATE POLICY "Users delete their own messages" ON public.ask_messages
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
GRANT ALL ON public.ask_messages TO service_role;
GRANT ALL ON public.ask_conversations TO service_role;