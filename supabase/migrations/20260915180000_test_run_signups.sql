-- Early testing signups. Founders-only. No anon/authenticated access.
-- Photos live in the private test-run-private bucket; this table stores paths, not public URLs.

create table if not exists public.test_run_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  campus text not null,
  city_corridor text not null,
  city_corridor_other text,
  full_name text not null,
  age integer not null check (age >= 18),
  email text not null,
  phone text not null,
  socials text,
  contact_preference text not null,
  is_me boolean not null default true,
  gender text not null,
  gender_other text,
  meet_genders text[] not null,
  school text not null,
  year_level text not null,
  departure_area text not null,
  max_travel text not null,
  nearby_school_ok boolean not null,
  dealbreakers text not null,
  about_you text not null,
  preferred_cafes text,
  refuse_areas text,
  cover_own_order boolean not null,
  accessibility text,
  schedule text not null,
  hard_nos text,
  understand_early boolean not null,
  public_cafe boolean not null,
  cancel_early boolean not null,
  can_report boolean not null,
  interview_ok boolean not null default false,
  emergency_name text,
  emergency_phone text,
  understand_data boolean not null,
  everything_true boolean not null,
  how_heard text,
  prefill_email text,
  personal_email_warned boolean not null default false,
  face_photo_path text not null,
  school_id_photo_path text not null
);

alter table public.test_run_signups enable row level security;

revoke all on public.test_run_signups from anon, authenticated;

create table if not exists public.test_run_rate_limits (
  ip_hash text primary key,
  attempt_count integer not null default 0,
  window_start timestamptz not null default now()
);

alter table public.test_run_rate_limits enable row level security;
revoke all on public.test_run_rate_limits from anon, authenticated;

create or replace function public.consume_test_run_rate_limit(
  p_ip_hash text,
  p_limit integer default 8,
  p_window_seconds integer default 3600
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.test_run_rate_limits%rowtype;
  v_now timestamptz := now();
begin
  if p_ip_hash is null or length(p_ip_hash) < 8 then
    return false;
  end if;

  select * into v_row
  from public.test_run_rate_limits
  where ip_hash = p_ip_hash
  for update;

  if not found then
    insert into public.test_run_rate_limits (ip_hash, attempt_count, window_start)
    values (p_ip_hash, 1, v_now);
    return true;
  end if;

  if v_now - v_row.window_start > make_interval(secs => p_window_seconds) then
    update public.test_run_rate_limits
    set attempt_count = 1,
        window_start = v_now
    where ip_hash = p_ip_hash;
    return true;
  end if;

  if v_row.attempt_count >= p_limit then
    return false;
  end if;

  update public.test_run_rate_limits
  set attempt_count = attempt_count + 1
  where ip_hash = p_ip_hash;

  return true;
end;
$$;

revoke all on function public.consume_test_run_rate_limit(text, integer, integer) from public;
revoke all on function public.consume_test_run_rate_limit(text, integer, integer) from anon, authenticated;
grant execute on function public.consume_test_run_rate_limit(text, integer, integer) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'test-run-private',
  'test-run-private',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;
