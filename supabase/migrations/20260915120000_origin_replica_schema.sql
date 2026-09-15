-- Align this Afterclass project with origin-replica:
-- waitlist + HMAC rate limits + page views, server-header or service-role access.
-- Revokes public execute on rls_auto_enable; replaces the incompatible rate-limit table.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

create table if not exists private.server_config (
  id integer primary key default 1 check (id = 1),
  server_secret text not null
);

create or replace function private.server_request()
returns boolean
language plpgsql
stable
security definer
set search_path = private
as $$
begin
  return coalesce(
    current_setting('request.headers', true),
    '{}'
  )::json ->> 'x-server-secret'
    = (select server_secret from private.server_config where id = 1);
end;
$$;

revoke all on function private.server_request() from public;
grant execute on function private.server_request() to anon, authenticated, service_role;

revoke all on function public.rls_auto_enable() from public, anon, authenticated;
drop function if exists public.consume_waitlist_rate_limit(text, integer, integer);
drop table if exists public.waitlist_rate_limits;

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  constraint waitlist_email_format check (
    email ~ '^[a-z0-9]+([._+-][a-z0-9]+)*@[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+(-[a-z0-9]+)*)*\.[a-z]{2,}$'
    and char_length(email) <= 254
  )
);

alter table public.waitlist enable row level security;
-- Anon/authenticated may only pass via private.server_request() RLS.
grant select, insert, update, delete on public.waitlist to anon, authenticated;

create table if not exists public.waitlist_rate_limits (
  ip_hash text primary key,
  attempt_count integer not null default 0,
  window_start timestamptz not null default now()
);

alter table public.waitlist_rate_limits enable row level security;
grant select, insert, update, delete on public.waitlist_rate_limits to anon, authenticated;

create table if not exists public.page_views_daily (
  view_date date not null,
  path text not null,
  view_count integer not null default 0,
  primary key (view_date, path),
  constraint page_views_daily_path_format check (
    path ~ '^/[a-z0-9/_-]{0,200}$'
    and char_length(path) <= 201
  ),
  constraint page_views_daily_count_nonneg check (view_count >= 0)
);

alter table public.page_views_daily enable row level security;
grant select, insert, update, delete on public.page_views_daily to anon, authenticated;

drop policy if exists waitlist_server_all on public.waitlist;
create policy waitlist_server_all on public.waitlist
  for all to anon, authenticated
  using (private.server_request())
  with check (private.server_request());

drop policy if exists waitlist_rate_limits_server_all on public.waitlist_rate_limits;
create policy waitlist_rate_limits_server_all on public.waitlist_rate_limits
  for all to anon, authenticated
  using (private.server_request())
  with check (private.server_request());

drop policy if exists page_views_daily_server_all on public.page_views_daily;
create policy page_views_daily_server_all on public.page_views_daily
  for all to anon, authenticated
  using (private.server_request())
  with check (private.server_request());

drop policy if exists waitlist_signups_deny_anon on public.waitlist_signups;
drop policy if exists waitlist_signups_deny_auth on public.waitlist_signups;
create policy waitlist_signups_deny_anon on public.waitlist_signups
  for all to anon
  using (false)
  with check (false);
create policy waitlist_signups_deny_auth on public.waitlist_signups
  for all to authenticated
  using (false)
  with check (false);

create or replace function public.consume_waitlist_rate_limit(
  p_ip_hash text,
  p_limit integer default 5,
  p_window_seconds integer default 900
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_row public.waitlist_rate_limits%rowtype;
  v_now timestamptz := now();
begin
  if p_ip_hash is null or length(p_ip_hash) < 8 then
    return false;
  end if;

  if p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  select * into v_row
  from public.waitlist_rate_limits
  where ip_hash = p_ip_hash
  for update;

  if not found then
    insert into public.waitlist_rate_limits (ip_hash, attempt_count, window_start)
    values (p_ip_hash, 1, v_now);
    return true;
  end if;

  if v_now - v_row.window_start > make_interval(secs => p_window_seconds) then
    update public.waitlist_rate_limits
    set attempt_count = 1,
        window_start = v_now
    where ip_hash = p_ip_hash;
    return true;
  end if;

  if v_row.attempt_count >= p_limit then
    return false;
  end if;

  update public.waitlist_rate_limits
  set attempt_count = attempt_count + 1
  where ip_hash = p_ip_hash;

  return true;
end;
$$;

revoke all on function public.consume_waitlist_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_waitlist_rate_limit(text, integer, integer) to anon, authenticated, service_role;

create or replace function public.increment_page_view(
  p_path text,
  p_view_date date default (timezone('utc', now()))::date
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if p_path is null or length(p_path) < 1 or length(p_path) > 201 then
    raise exception 'invalid path';
  end if;

  if p_path !~ '^/[a-z0-9/_-]{0,200}$' then
    raise exception 'invalid path';
  end if;

  insert into public.page_views_daily (view_date, path, view_count)
  values (p_view_date, p_path, 1)
  on conflict (view_date, path)
  do update set view_count = public.page_views_daily.view_count + 1;
end;
$$;

revoke all on function public.increment_page_view(text, date) from public;
grant execute on function public.increment_page_view(text, date) to anon, authenticated, service_role;
