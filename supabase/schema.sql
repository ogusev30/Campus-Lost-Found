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
  image_url text not null,
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

create index if not exists items_owner_id_idx on public.items(owner_id);
create index if not exists items_status_idx on public.items(status);
create index if not exists claims_item_id_idx on public.claims(item_id);
create index if not exists claims_claimant_id_idx on public.claims(claimant_id);

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
