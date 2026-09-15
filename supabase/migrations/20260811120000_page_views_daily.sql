-- Daily page-view aggregates for the admin dashboard.
-- Writes go through the Next.js API with the service role only.

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

revoke all on public.page_views_daily from anon, authenticated;

create or replace function public.increment_page_view(
  p_path text,
  p_view_date date default (timezone('utc', now()))::date
)
returns void
language plpgsql
security definer
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
revoke all on function public.increment_page_view(text, date) from anon, authenticated;
grant execute on function public.increment_page_view(text, date) to service_role;
