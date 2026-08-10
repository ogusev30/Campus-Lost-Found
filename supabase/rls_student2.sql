-- Campus Lost & Found — Student 2 (Discover & Claim) policies and functions.
-- Run this in the Supabase SQL editor after schema.sql (and rls_student1.sql,
-- if present — order between rls_student1.sql and this file doesn't matter,
-- both only depend on schema.sql). Safe to re-run.

-- ---------------------------------------------------------------------------
-- Cleanup: an earlier, ad-hoc draft of this file (before the shared
-- schema.sql/rls_student1.sql split existed) was run against this project
-- under different policy/bucket-policy names. Drop those so this file is the
-- single source of truth for Student 2's policies — schema.sql and
-- rls_student1.sql already provide equivalent (or better) coverage for the
-- profiles/items-write/storage-write pieces.
-- ---------------------------------------------------------------------------

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "items_insert_own" on public.items;
drop policy if exists "items_update_own" on public.items;
drop policy if exists "items_delete_own" on public.items;
drop policy if exists "claims_select_own_or_owner" on public.claims;
drop policy if exists "claims_insert_own" on public.claims;
drop policy if exists "claims_update_owner" on public.claims;
drop policy if exists "item_images_owner_write" on storage.objects;
drop policy if exists "item_images_owner_delete" on storage.objects;

-- ---------------------------------------------------------------------------
-- Student 2 policies
-- ---------------------------------------------------------------------------

-- schema.sql's "items_select_all_authenticated" policy requires a logged-in
-- session, but Browse (/browse) and Item Detail (/items/[id]) must both work
-- for logged-out visitors per spec. RLS SELECT policies are OR'd together,
-- so this adds unauthenticated read access without touching that policy.
drop policy if exists "items_select_public" on public.items;
create policy "items_select_public" on public.items
  for select using (true);

-- A claimant can see the claims they personally submitted.
drop policy if exists "claims_select_own_submitted" on public.claims;
create policy "claims_select_own_submitted" on public.claims
  for select using (auth.uid() = claimant_id);

-- A user may only claim a found+open item that isn't their own listing, and
-- only ever insert a claim under their own identity. Combined with the
-- unique(item_id, claimant_id) constraint in schema.sql, this also means a
-- rejected claim can never be resent for the same item.
drop policy if exists "claims_insert_claimant" on public.claims;
create policy "claims_insert_claimant" on public.claims
  for insert with check (
    auth.uid() = claimant_id
    and exists (
      select 1 from public.items i
      where i.id = item_id
        and i.type = 'found'
        and i.status = 'open'
        and i.owner_id <> auth.uid()
    )
  );

-- Exposes the item owner's contact info to the claimant, but only once
-- their own claim on that item has been accepted. SECURITY DEFINER so it
-- can read profiles.email/name (which plain RLS keeps private) while still
-- checking the caller's identity and claim status internally — mirrors
-- get_owner_claims() in rls_student1.sql for the owner-facing side.
create or replace function public.get_owner_contact(p_item_id uuid)
returns table (owner_name text, owner_email text)
language sql
security definer
set search_path = public
as $$
  select p.name, p.email
  from public.claims c
  join public.items i on i.id = c.item_id
  join public.profiles p on p.id = i.owner_id
  where c.item_id = p_item_id
    and c.claimant_id = auth.uid()
    and c.status = 'accepted';
$$;

grant execute on function public.get_owner_contact(uuid) to authenticated;
