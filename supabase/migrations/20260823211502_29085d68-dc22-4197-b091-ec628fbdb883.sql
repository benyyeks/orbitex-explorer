-- Explicit read protection: only the backend service role may read feedback rows
CREATE POLICY "Service role reads feedback"
  ON public.feedback FOR SELECT
  TO service_role
  USING (true);

-- Validation constraints on the publicly writable columns
ALTER TABLE public.feedback
  ADD CONSTRAINT feedback_name_length CHECK (name IS NULL OR char_length(name) <= 80),
  ADD CONSTRAINT feedback_email_format CHECK (email IS NULL OR (char_length(email) <= 120 AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  ADD CONSTRAINT feedback_message_length CHECK (char_length(message) BETWEEN 3 AND 2000),
  ADD CONSTRAINT feedback_type_allowed CHECK (type IN ('suggestion', 'bug', 'data', 'other'));

-- Replace the unbounded public insert policy with one enforcing the same bounds
DROP POLICY "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit feedback"
  ON public.feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (name IS NULL OR char_length(name) <= 80)
    AND (email IS NULL OR (char_length(email) <= 120 AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'))
    AND char_length(message) BETWEEN 3 AND 2000
    AND type IN ('suggestion', 'bug', 'data', 'other')
  );