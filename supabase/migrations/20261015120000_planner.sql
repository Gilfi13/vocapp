-- Kalender & Tagesplaner: Termine, To-dos und Pausen jedes Benutzers.
-- Ein Eintrag ist ein JSON-Objekt (Titel, Art, Dauer, Tag, Uhrzeit, Wiederholung …),
-- damit das Frontend Felder ergänzen kann, ohne dass die Tabelle sich ändert.
create table public.planner_items (
  user_id uuid not null references public.users(id) on delete cascade,
  id text not null check (id ~ '^[A-Za-z0-9_-]{1,64}$'),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Einstellungen (Tagesbeginn, Pausenrhythmus, Wünsche fürs Planen)
create table public.planner_settings (
  user_id uuid primary key references public.users(id) on delete cascade,
  prefs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Kurze Notiz zum Plan eines Tages (z. B. Claudes Begründung)
create table public.planner_notes (
  user_id uuid not null references public.users(id) on delete cascade,
  day date not null,
  text text not null default '',
  author text not null default 'regel',
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.planner_items enable row level security;
alter table public.planner_settings enable row level security;
alter table public.planner_notes enable row level security;
