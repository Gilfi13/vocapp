-- Learning progress per card (Leitner box: 0 = unsicher, >= 2 = sitzt)
alter table public.cards
  add column box integer not null default 0,
  add column correct_count integer not null default 0,
  add column wrong_count integer not null default 0,
  add column last_reviewed timestamptz;

-- Every answer given while learning (for streak and daily stats)
create table public.reviews (
  id bigint generated always as identity primary key,
  card_id uuid not null references public.cards(id) on delete cascade,
  correct boolean not null,
  created_at timestamptz not null default now()
);

create index reviews_created_at_idx on public.reviews (created_at);
create index reviews_card_id_idx on public.reviews (card_id);

alter table public.reviews enable row level security;

-- Answers today and current streak of consecutive learning days.
create or replace function public.review_stats(tz text default 'Europe/Berlin')
returns json
language sql
stable
set search_path = public
as $$
  with days as (
    select distinct (created_at at time zone tz)::date as day from public.reviews
  ),
  grouped as (
    select day, day - (row_number() over (order by day))::int as grp from days
  ),
  islands as (
    select max(day) as last_day, count(*) as len from grouped group by grp
  )
  select json_build_object(
    'today', (
      select count(*) from public.reviews
      where (created_at at time zone tz)::date = (now() at time zone tz)::date
    ),
    'streak', coalesce((
      select len from islands
      where last_day >= (now() at time zone tz)::date - 1
      order by last_day desc limit 1
    ), 0)
  );
$$;

revoke execute on function public.review_stats(text) from public, anon, authenticated;
