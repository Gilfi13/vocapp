create table public.decks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks(id) on delete cascade,
  position integer not null default 0,
  english text not null,
  german text not null,
  created_at timestamptz not null default now()
);

create index cards_deck_id_position_idx on public.cards (deck_id, position);

-- RLS on, no policies: only the edge function (service role) can access data.
alter table public.decks enable row level security;
alter table public.cards enable row level security;
