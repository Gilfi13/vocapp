-- Multiple users: every deck, card and review belongs to one user.
-- Passwords are stored as PBKDF2-SHA256 hashes: "pbkdf2$<iterations>$<salt hex>$<hash hex>".
create table public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique check (username ~ '^[a-z0-9._-]{3,32}$'),
  password_hash text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- The first admin account is inserted separately so no password hash lives in
-- the repo, e.g. insert into users (username, password_hash, is_admin) values (..., true).
-- Existing data is then assigned to it before the columns become NOT NULL.
alter table public.decks add column user_id uuid references public.users(id) on delete cascade;
alter table public.cards add column user_id uuid references public.users(id) on delete cascade;
alter table public.reviews add column user_id uuid references public.users(id) on delete cascade;

update public.decks set user_id = (select id from public.users where is_admin order by created_at limit 1);
update public.cards c set user_id = d.user_id from public.decks d where d.id = c.deck_id;
update public.reviews r set user_id = c.user_id from public.cards c where c.id = r.card_id;

alter table public.decks alter column user_id set not null;
alter table public.cards alter column user_id set not null;
alter table public.reviews alter column user_id set not null;

create index decks_user_id_idx on public.decks (user_id);
create index cards_user_id_idx on public.cards (user_id);
create index reviews_user_id_created_at_idx on public.reviews (user_id, created_at);

-- Stats per user (the old review_stats(text) without user stays unused)
create function public.review_stats(uid uuid, tz text default 'Europe/Berlin')
returns json
language sql
stable
set search_path = public
as $$
  with days as (
    select distinct (created_at at time zone tz)::date as day
    from public.reviews where user_id = uid
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
      where user_id = uid
        and (created_at at time zone tz)::date = (now() at time zone tz)::date
    ),
    'streak', coalesce((
      select len from islands
      where last_day >= (now() at time zone tz)::date - 1
      order by last_day desc limit 1
    ), 0)
  );
$$;

revoke execute on function public.review_stats(uuid, text) from public, anon, authenticated;
