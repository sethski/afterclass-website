-- Status tracking, cafes, matches, dates, and feedback for Test Run ops.
-- Founders-only. No anon/authenticated access. Service role writes from the admin app.

alter table public.test_run_signups
  add column if not exists status text not null default 'pending',
  add column if not exists reviewer_notes text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid;

alter table public.test_run_signups
  drop constraint if exists test_run_signups_status_check;

alter table public.test_run_signups
  add constraint test_run_signups_status_check
  check (status in ('pending', 'reviewed', 'matched', 'scheduled', 'completed', 'withdrawn'));

create index if not exists test_run_signups_status_idx
  on public.test_run_signups (status);

create index if not exists test_run_signups_created_at_idx
  on public.test_run_signups (created_at desc);

create table if not exists public.cafes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  area text not null,
  city text not null,
  address text,
  lat numeric(9, 6),
  lng numeric(9, 6),
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.cafes enable row level security;
revoke all on public.cafes from anon, authenticated;

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  person_a uuid not null references public.test_run_signups (id),
  person_b uuid not null references public.test_run_signups (id),
  status text not null default 'proposed'
    check (status in ('proposed', 'confirmed', 'scheduled', 'completed', 'cancelled')),
  match_reason text,
  created_at timestamptz not null default now(),
  created_by uuid,
  constraint matches_different_people check (person_a <> person_b)
);

alter table public.matches enable row level security;
revoke all on public.matches from anon, authenticated;

create index if not exists matches_person_a_idx on public.matches (person_a);
create index if not exists matches_person_b_idx on public.matches (person_b);
create index if not exists matches_created_at_idx on public.matches (created_at desc);

create table if not exists public.dates (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id),
  cafe_id uuid references public.cafes (id),
  cafe_name_override text,
  scheduled_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'no_show_a', 'no_show_b', 'cancelled')),
  founder_notes text,
  created_at timestamptz not null default now()
);

alter table public.dates enable row level security;
revoke all on public.dates from anon, authenticated;

create index if not exists dates_match_id_idx on public.dates (match_id);
create index if not exists dates_scheduled_at_idx on public.dates (scheduled_at);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  date_id uuid not null references public.dates (id),
  signup_id uuid not null references public.test_run_signups (id),
  source text not null default 'user'
    check (source in ('user', 'founder')),
  showed_up boolean,
  felt_safe boolean,
  would_use_again boolean,
  rating integer check (rating is null or (rating between 1 and 5)),
  comments text,
  founder_notes text,
  submitted_at timestamptz not null default now(),
  unique (date_id, signup_id, source)
);

alter table public.feedback enable row level security;
revoke all on public.feedback from anon, authenticated;

create index if not exists feedback_date_id_idx on public.feedback (date_id);

create table if not exists public.feedback_invites (
  id uuid primary key default gen_random_uuid(),
  date_id uuid not null references public.dates (id),
  signup_id uuid not null references public.test_run_signups (id),
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  unique (date_id, signup_id)
);

alter table public.feedback_invites enable row level security;
revoke all on public.feedback_invites from anon, authenticated;
