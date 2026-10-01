CREATE TABLE public.api_quota (
  provider TEXT PRIMARY KEY,
  rate_limit INTEGER,
  remaining INTEGER,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.api_quota TO authenticated;
GRANT ALL ON public.api_quota TO service_role;

ALTER TABLE public.api_quota ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users can read api quota"
ON public.api_quota
FOR SELECT
TO authenticated
USING (true);