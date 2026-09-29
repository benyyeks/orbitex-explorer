-- lovable-cron-fallback-reviewed: user explicitly requires one combined 30-second refresh of time-sensitive telemetry feeds; upstreams offer no push or webhook, and each run only fetches feeds whose saved copy is due
create extension if not exists pg_cron;
create extension if not exists pg_net;

create schema if not exists private;
create table if not exists private.refresh_token (id int primary key default 1, token text not null);
insert into private.refresh_token (id, token) values (1, encode(extensions.gen_random_bytes(32), 'hex')) on conflict (id) do nothing;

create or replace function public.verify_refresh_token(_t text)
returns boolean language sql stable security definer set search_path = public, private as $$
  select exists (select 1 from private.refresh_token where token = _t)
$$;
revoke all on function public.verify_refresh_token(text) from public, anon, authenticated;
grant execute on function public.verify_refresh_token(text) to service_role;

create type public.app_role as enum ('admin', 'moderator', 'user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read their own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where id = '725b1f7f-5b88-4bf3-9529-2ed2e5334a38'
on conflict do nothing;

create table public.diagnostics_events (
  id bigint generated always as identity primary key,
  feed text not null,
  ok boolean not null,
  source text,
  duration_ms integer,
  error text,
  created_at timestamptz not null default now()
);
create index diagnostics_events_feed_created on public.diagnostics_events (feed, created_at desc);
grant select on public.diagnostics_events to authenticated;
grant all on public.diagnostics_events to service_role;
alter table public.diagnostics_events enable row level security;
create policy "Admins read diagnostics" on public.diagnostics_events for select to authenticated using (public.has_role(auth.uid(), 'admin'));

select cron.schedule('orbitex-refresh-30s', '30 seconds', $$
  select net.http_post(
    url := 'https://project--b75a23eb-d1be-4426-8b18-9b58133462ed.lovable.app/api/public/refresh',
    headers := jsonb_build_object('Content-Type','application/json','x-refresh-token',(select token from private.refresh_token where id = 1)),
    body := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
$$);
select cron.schedule('orbitex-diagnostics-prune', '17 * * * *', $$ delete from public.diagnostics_events where created_at < now() - interval '2 days' $$);