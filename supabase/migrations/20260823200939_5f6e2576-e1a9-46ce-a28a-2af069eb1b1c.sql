create table if not exists public.space_news (
  id bigint primary key,
  content_type text not null check (content_type in ('article', 'blog', 'report')),
  title text not null,
  summary text,
  url text not null,
  image_url text,
  news_site text,
  published_at timestamptz,
  fetched_at timestamptz not null default now()
);
create index if not exists space_news_published_idx on public.space_news (published_at desc);
create index if not exists space_news_type_idx on public.space_news (content_type);
grant select on public.space_news to anon, authenticated;
grant all on public.space_news to service_role;
alter table public.space_news enable row level security;
drop policy if exists "Public read access" on public.space_news;
create policy "Public read access" on public.space_news
  for select to anon, authenticated using (true);

create table if not exists public.competitions (
  id bigserial primary key,
  name text not null,
  organizer text,
  description text,
  url text not null,
  category text,
  opens_at date,
  deadline date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.competitions to anon, authenticated;
grant all on public.competitions to service_role;
alter table public.competitions enable row level security;
drop policy if exists "Public read access" on public.competitions;
create policy "Public read access" on public.competitions
  for select to anon, authenticated using (is_active = true);
insert into public.competitions (name, organizer, description, url, category, opens_at, deadline) values
  ('NASA International Space Apps Challenge', 'NASA + international space agency partners', 'A 48-hour global hackathon where teams use NASA''s open data to build solutions to real Earth and space challenges. Free to join, all skill levels welcome, hosted at local sites worldwide and online.', 'https://www.spaceappschallenge.org/', 'Hackathon', null, '2026-11-15'),
  ('Conrad Challenge', 'Conrad Foundation', 'A year-long innovation competition for students, spanning several categories including Aerospace & Aviation. Teams pitch an original product or venture to a panel of judges.', 'https://www.conradchallenge.org/', 'Innovation competition', null, null),
  ('AIAA Design/Build/Fly', 'American Institute of Aeronautics and Astronautics', 'University teams design, build, and fly a radio-controlled aircraft to meet a new mission spec published each year, then compete head-to-head at a fly-off.', 'https://www.aiaa.org/dbf', 'Design competition', null, null),
  ('CanSat Competition', 'AAS / AIAA', 'Student teams design a simulated satellite the size of a soda can, then launch, recover, and analyze telemetry from it, mirroring a real mission''s full engineering lifecycle.', 'http://www.cansatcompetition.com/', 'Engineering competition', null, null),
  ('International Space Settlement Design Competition', 'ISSDC', 'A weekend-long simulation where student teams form instant companies and design a complete space settlement, then present their proposal to a review board.', 'https://issdc.space/', 'Design competition', null, null)
on conflict do nothing;

create table if not exists public.api_cache (
  cache_key text primary key,
  endpoint text not null,
  payload jsonb not null,
  fetched_at timestamptz not null default now(),
  ttl_seconds integer not null default 300
);
create index if not exists api_cache_endpoint_idx on public.api_cache (endpoint);
create index if not exists api_cache_fetched_idx on public.api_cache (fetched_at desc);
grant select on public.api_cache to anon, authenticated;
grant all on public.api_cache to service_role;
alter table public.api_cache enable row level security;
drop policy if exists "Public cache read" on public.api_cache;
create policy "Public cache read" on public.api_cache
  for select to anon, authenticated using (true);