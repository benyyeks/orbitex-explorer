CREATE TABLE public.feedback (
  id bigint generated always as identity primary key,
  name text,
  email text,
  type text not null default 'suggestion',
  message text not null,
  created_at timestamp with time zone not null default now()
);
GRANT INSERT ON public.feedback TO anon, authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit feedback" ON public.feedback FOR INSERT TO anon, authenticated WITH CHECK (true);