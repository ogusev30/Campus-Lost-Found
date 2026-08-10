-- Campus Lost & Found — shared schema
-- Run this FIRST in the Supabase SQL editor, before rls_student1.sql / rls_student2.sql.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('lost', 'found')),
  title text not null,
  description text not null,
  category text not null check (category in (
    'Electronics', 'Wallet / Money', 'Keys', 'Bag', 'Clothing',
    'Books', 'ID / Cards', 'Accessories', 'Other'
  )),
  location text not null,
  item_date date not null,
  -- Nullable: a photo is only required when reporting a found item (you may
  -- not have one for something you lost).
  image_url text,
  status text not null default 'open' check (status in ('open', 'claimed', 'returned', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  claimant_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  unique (item_id, claimant_id)
);

-- Best scores for the two on-site mini-games, used to unlock the
-- "sortItChampion" / "memoryMaster" achievements alongside the item/claim
-- based ones.
create table if not exists public.game_scores (
  user_id uuid not null references public.profiles(id) on delete cascade,
  game text not null check (game in ('sort_it', 'memory_cards')),
  best_score integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, game)
);

-- Smart Match: best-match pairing between a lost item and a found item,
-- scored 0-100 by src/lib/matching/score.ts and recomputed whenever a
-- relevant page loads. One row per unordered (lost, found) pair.
create table if not exists public.item_matches (
  id uuid primary key default gen_random_uuid(),
  lost_item_id uuid not null references public.items(id) on delete cascade,
  found_item_id uuid not null references public.items(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  dismissed_by_lost_owner boolean not null default false,
  dismissed_by_found_owner boolean not null default false,
  created_at timestamptz not null default now(),
  unique (lost_item_id, found_item_id)
);

-- Notification center. `payload` is structured (not pre-rendered text) so
-- notifications render in whichever language the viewer currently has
-- active, same as the rest of the app.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in (
    'match_found', 'claim_accepted', 'item_returned', 'achievement_unlocked'
  )),
  payload jsonb not null default '{}'::jsonb,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Insert-only marker of which achievements a user has already unlocked, so
-- notifications can fire once on the transition into "unlocked" rather than
-- every time the (otherwise always-recomputed) achievement stats are read.
create table if not exists public.achievement_unlocks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create index if not exists items_owner_id_idx on public.items(owner_id);
create index if not exists items_status_idx on public.items(status);
create index if not exists claims_item_id_idx on public.claims(item_id);
create index if not exists claims_claimant_id_idx on public.claims(claimant_id);
create index if not exists item_matches_lost_item_id_idx on public.item_matches(lost_item_id);
create index if not exists item_matches_found_item_id_idx on public.item_matches(found_item_id);
create index if not exists notifications_user_id_idx on public.notifications(user_id, created_at desc);

-- Auto-create a profile row (email pre-filled, name null) whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, null)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.claims enable row level security;
alter table public.game_scores enable row level security;
alter table public.item_matches enable row level security;
alter table public.notifications enable row level security;
alter table public.achievement_unlocks enable row level security;

-- Genuinely shared read policy: any logged-in user can browse the board
-- (serves both Student 1's own-listing views and Student 2's browse/search).
drop policy if exists "items_select_all_authenticated" on public.items;
create policy "items_select_all_authenticated" on public.items
  for select using (auth.role() = 'authenticated');

-- Storage bucket for item photos.
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;

drop policy if exists "item_images_public_read" on storage.objects;
create policy "item_images_public_read" on storage.objects
  for select using (bucket_id = 'item-images');
