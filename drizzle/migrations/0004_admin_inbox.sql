create table if not exists public.site_suggestions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null default 'suggestion',
  message text not null check (char_length(message) >= 8 and char_length(message) <= 4000),
  name text check (name is null or char_length(name) <= 120),
  email text check (email is null or char_length(email) <= 200),
  user_id uuid,
  status text not null default 'new' check (status in ('new', 'read', 'done'))
);
grant select, insert, update on public.site_suggestions to authenticated;
grant all on public.site_suggestions to service_role;
alter table public.site_suggestions enable row level security;
create index if not exists site_suggestions_created on public.site_suggestions (created_at desc);
create index if not exists site_suggestions_status on public.site_suggestions (status);
create table if not exists public.site_error_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null default 'client',
  message text not null check (char_length(message) <= 500),
  path text check (path is null or char_length(path) <= 300),
  detail text check (detail is null or char_length(detail) <= 1500),
  user_id uuid,
  resolved boolean not null default false
);
grant select, insert, update on public.site_error_events to authenticated;
grant all on public.site_error_events to service_role;
alter table public.site_error_events enable row level security;
create index if not exists site_error_events_created on public.site_error_events (created_at desc);
create index if not exists site_error_events_resolved on public.site_error_events (resolved);
create policy "Users insert suggestions" on public.site_suggestions for insert to authenticated with check (auth.uid() = user_id and status = 'new');
create policy "Users insert error events" on public.site_error_events for insert to authenticated with check (auth.uid() = user_id and resolved = false);
create policy "Admins read suggestions" on public.site_suggestions for select to authenticated using (public.has_role(auth.uid(), 'admin') and lower(auth.jwt()->>'email') = 'benyyeks@gmail.com');
create policy "Admins update suggestions" on public.site_suggestions for update to authenticated using (public.has_role(auth.uid(), 'admin') and lower(auth.jwt()->>'email') = 'benyyeks@gmail.com') with check (public.has_role(auth.uid(), 'admin') and lower(auth.jwt()->>'email') = 'benyyeks@gmail.com');
create policy "Admins read error events" on public.site_error_events for select to authenticated using (public.has_role(auth.uid(), 'admin') and lower(auth.jwt()->>'email') = 'benyyeks@gmail.com');
create policy "Admins update error events" on public.site_error_events for update to authenticated using (public.has_role(auth.uid(), 'admin') and lower(auth.jwt()->>'email') = 'benyyeks@gmail.com') with check (public.has_role(auth.uid(), 'admin') and lower(auth.jwt()->>'email') = 'benyyeks@gmail.com');