-- Grammar practice: the exercises themselves live in the frontend
-- (web/grammar/*.js); here we only store each user's progress per exercise.
create table public.grammar_progress (
  user_id uuid not null references public.users(id) on delete cascade,
  item_id text not null check (item_id ~ '^[a-z0-9-]{1,40}$'),
  box integer not null default 0,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  last_reviewed timestamptz not null default now(),
  due_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

-- Every grammar answer (for streak and "answers today")
create table public.grammar_reviews (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  item_id text not null,
  correct boolean not null,
  created_at timestamptz not null default now()
);

create index grammar_reviews_user_id_created_at_idx on public.grammar_reviews (user_id, created_at);

alter table public.grammar_progress enable row level security;
alter table public.grammar_reviews enable row level security;

-- Spaced repetition (Leitner): right → one box up, wrong → box 0.
-- Next review after: box 0 → now, 1 → 1 day, 2 → 3 days, 3 → 7, 4 → 14, 5 → 30.
create function public.record_grammar_review(p_user uuid, p_item text, p_correct boolean)
returns json
language sql
volatile
set search_path = public
as $$
  with saved as (
    insert into public.grammar_progress as g
      (user_id, item_id, box, correct_count, wrong_count, last_reviewed, due_at)
    values (
      p_user, p_item,
      case when p_correct then 1 else 0 end,
      case when p_correct then 1 else 0 end,
      case when p_correct then 0 else 1 end,
      now(),
      now() + case when p_correct then interval '1 day' else interval '0' end
    )
    on conflict (user_id, item_id) do update set
      box = case when p_correct then least(g.box + 1, 5) else 0 end,
      correct_count = g.correct_count + case when p_correct then 1 else 0 end,
      wrong_count = g.wrong_count + case when p_correct then 0 else 1 end,
      last_reviewed = now(),
      due_at = now() + case
        when not p_correct then interval '0'
        else (array[interval '1 day', interval '3 days', interval '7 days', interval '14 days', interval '30 days'])[least(g.box + 1, 5)]
      end
    returning item_id, box, correct_count, wrong_count, last_reviewed, due_at
  ),
  logged as (
    insert into public.grammar_reviews (user_id, item_id, correct)
    select p_user, p_item, p_correct from saved
  )
  select row_to_json(saved) from saved;
$$;

revoke execute on function public.record_grammar_review(uuid, text, boolean) from public, anon, authenticated;

-- Streak and "answers today" now count vocabulary and grammar answers.
create or replace function public.review_stats(uid uuid, tz text default 'Europe/Berlin')
returns json
language sql
stable
set search_path = public
as $$
  with answers as (
    select created_at from public.reviews where user_id = uid
    union all
    select created_at from public.grammar_reviews where user_id = uid
  ),
  days as (
    select distinct (created_at at time zone tz)::date as day from answers
  ),
  grouped as (
    select day, day - (row_number() over (order by day))::int as grp from days
  ),
  islands as (
    select max(day) as last_day, count(*) as len from grouped group by grp
  )
  select json_build_object(
    'today', (
      select count(*) from answers
      where (created_at at time zone tz)::date = (now() at time zone tz)::date
    ),
    'streak', coalesce((
      select len from islands
      where last_day >= (now() at time zone tz)::date - 1
      order by last_day desc limit 1
    ), 0)
  );
$$;
