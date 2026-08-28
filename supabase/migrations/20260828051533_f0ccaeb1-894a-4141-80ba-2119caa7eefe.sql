ALTER TABLE public.reading_list ADD COLUMN IF NOT EXISTS note text;

CREATE TABLE public.shared_lists (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  share_id text NOT NULL UNIQUE,
  is_public boolean NOT NULL DEFAULT false,
  include_notes boolean NOT NULL DEFAULT false,
  title text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_lists TO authenticated;
GRANT ALL ON public.shared_lists TO service_role;

ALTER TABLE public.shared_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own share settings"
ON public.shared_lists FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER shared_lists_set_updated_at
BEFORE UPDATE ON public.shared_lists
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Public read path for shared lists. Exposes only book ids, optional notes and
-- the saved date for lists whose owner enabled sharing. No owner identity.
CREATE OR REPLACE FUNCTION public.get_shared_reading_list(_share_id text)
RETURNS TABLE (book_id text, note text, added_at timestamp with time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.book_id,
         CASE WHEN s.include_notes THEN r.note ELSE NULL END AS note,
         r.added_at
  FROM public.shared_lists s
  JOIN public.reading_list r ON r.user_id = s.user_id
  WHERE s.share_id = _share_id
    AND s.is_public = true
  ORDER BY r.added_at DESC
  LIMIT 100;
$$;

CREATE OR REPLACE FUNCTION public.get_shared_list_meta(_share_id text)
RETURNS TABLE (title text, include_notes boolean, book_count integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.title,
         s.include_notes,
         (SELECT count(*)::int FROM public.reading_list r WHERE r.user_id = s.user_id)
  FROM public.shared_lists s
  WHERE s.share_id = _share_id AND s.is_public = true
$$;

REVOKE ALL ON FUNCTION public.get_shared_reading_list(text) FROM public;
REVOKE ALL ON FUNCTION public.get_shared_list_meta(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_shared_reading_list(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_shared_list_meta(text) TO anon, authenticated, service_role;