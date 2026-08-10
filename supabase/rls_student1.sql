-- Campus Lost & Found — Student 1 (Report & Manage) policies and functions.
-- Run this SECOND, after schema.sql.

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Lets profile-setup upsert work even if the on_auth_user_created trigger
-- didn't create the row (e.g. it ran before the trigger existed, or the
-- trigger couldn't be created due to project permissions).
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "items_insert_own" on public.items
  for insert with check (auth.uid() = owner_id);

create policy "items_update_own" on public.items
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- DB-level enforcement of "cannot delete a listing that has any claims".
create policy "items_delete_own_no_claims" on public.items
  for delete using (
    auth.uid() = owner_id
    and not exists (select 1 from public.claims c where c.item_id = items.id)
  );

create policy "claims_select_owner" on public.claims
  for select using (
    exists (
      select 1 from public.items i
      where i.id = claims.item_id and i.owner_id = auth.uid()
    )
  );

create policy "claims_update_owner" on public.claims
  for update
  using (
    exists (
      select 1 from public.items i
      where i.id = claims.item_id and i.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.items i
      where i.id = claims.item_id and i.owner_id = auth.uid()
    )
  );

-- Storage: owners may only write into their own user_id folder.
create policy "item_images_insert_own_folder" on storage.objects
  for insert
  with check (
    bucket_id = 'item-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "item_images_update_own_folder" on storage.objects
  for update using (
    bucket_id = 'item-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "item_images_delete_own_folder" on storage.objects
  for delete using (
    bucket_id = 'item-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Atomic accept: selected claim -> accepted, item -> claimed,
-- every other pending claim on that same item -> rejected. Runs as
-- security definer (rather than the previous invoker) so it can also
-- notify the claimant, whose notifications row it wouldn't otherwise be
-- allowed to insert into under normal RLS.
create or replace function public.accept_claim(claim_id_input uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item_id uuid;
  v_claimant_id uuid;
  v_item_title text;
begin
  if not exists (
    select 1
    from public.claims c
    join public.items i on i.id = c.item_id
    where c.id = claim_id_input and i.owner_id = auth.uid()
  ) then
    raise exception 'Not authorized to accept this claim';
  end if;

  select item_id, claimant_id into v_item_id, v_claimant_id
    from public.claims where id = claim_id_input;
  select title into v_item_title from public.items where id = v_item_id;

  update public.claims set status = 'accepted' where id = claim_id_input;
  update public.items set status = 'claimed' where id = v_item_id;
  update public.claims
    set status = 'rejected'
    where item_id = v_item_id and id <> claim_id_input and status = 'pending';

  insert into public.notifications (user_id, type, payload, link)
  values (
    v_claimant_id,
    'claim_accepted',
    jsonb_build_object('itemId', v_item_id, 'itemTitle', v_item_title),
    '/my-listings'
  );
end;
$$;

grant execute on function public.accept_claim(uuid) to authenticated;

-- Returns the owner's incoming claims with the claimant's email masked
-- unless the claim has been accepted. Plain RLS can't conditionally hide
-- one column by another row's status, so this uses SECURITY DEFINER to
-- read profiles.email internally and decide whether to expose it.
create or replace function public.get_owner_claims(p_item_id uuid default null)
returns table (
  claim_id uuid,
  item_id uuid,
  claimant_id uuid,
  claimant_name text,
  claimant_email text,
  message text,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    c.id,
    c.item_id,
    c.claimant_id,
    p.name,
    case when c.status = 'accepted' then p.email else null end,
    c.message,
    c.status,
    c.created_at
  from public.claims c
  join public.items i on i.id = c.item_id
  join public.profiles p on p.id = c.claimant_id
  where i.owner_id = auth.uid()
    and (p_item_id is null or c.item_id = p_item_id);
end;
$$;

grant execute on function public.get_owner_claims(uuid) to authenticated;

-- Mini-game best scores: each user can only see/write their own row.
create policy "game_scores_select_own" on public.game_scores
  for select using (auth.uid() = user_id);

create policy "game_scores_insert_own" on public.game_scores
  for insert with check (auth.uid() = user_id);

create policy "game_scores_update_own" on public.game_scores
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Smart Match: visible/writable by whichever side (lost or found owner) is
-- the caller. Both owners can insert (whichever item was reported second
-- triggers the match) and update (e.g. to dismiss their side of it).
create policy "item_matches_select_owner" on public.item_matches
  for select using (
    exists (select 1 from public.items i where i.id = lost_item_id and i.owner_id = auth.uid())
    or exists (select 1 from public.items i where i.id = found_item_id and i.owner_id = auth.uid())
  );

create policy "item_matches_insert_owner" on public.item_matches
  for insert with check (
    exists (select 1 from public.items i where i.id = lost_item_id and i.owner_id = auth.uid())
    or exists (select 1 from public.items i where i.id = found_item_id and i.owner_id = auth.uid())
  );

create policy "item_matches_update_owner" on public.item_matches
  for update using (
    exists (select 1 from public.items i where i.id = lost_item_id and i.owner_id = auth.uid())
    or exists (select 1 from public.items i where i.id = found_item_id and i.owner_id = auth.uid())
  );

-- Notifications: everyone can read/mark-read their own. Direct insert is
-- only allowed for self-notifications (match_found, item_returned,
-- achievement_unlocked); the one cross-user case (claim_accepted) is
-- inserted by the security-definer accept_claim() function above instead.
create policy "notifications_select_own" on public.notifications
  for select using (auth.uid() = user_id);

create policy "notifications_insert_own" on public.notifications
  for insert with check (auth.uid() = user_id);

create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Achievement-unlock tracking: read/write own only.
create policy "achievement_unlocks_select_own" on public.achievement_unlocks
  for select using (auth.uid() = user_id);

create policy "achievement_unlocks_insert_own" on public.achievement_unlocks
  for insert with check (auth.uid() = user_id);

-- Leaderboard: points are help-oriented on purpose (mini-game scores are
-- intentionally excluded, they have their own star/achievement track).
-- Returning an item is the strongest "helped someone" signal and scores
-- highest; reporting a lost item is mostly self-serving and scores lowest.
-- Runs as security definer so it can rank every profile, not just the
-- caller's own row (profiles otherwise only exposes auth.uid() = id).
create or replace function public.get_leaderboard()
returns table (
  user_id uuid,
  name text,
  points integer
)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id,
    p.name,
    (
      coalesce((select count(*) from public.items i where i.owner_id = p.id and i.status = 'returned'), 0) * 25
      + coalesce((select count(*) from public.claims c join public.items i on i.id = c.item_id where i.owner_id = p.id and c.status = 'accepted'), 0) * 10
      + coalesce((select count(*) from public.items i where i.owner_id = p.id and i.type = 'found'), 0) * 5
      + coalesce((select count(*) from public.items i where i.owner_id = p.id and i.type = 'lost'), 0) * 1
    )::integer as points
  from public.profiles p
  order by points desc, p.created_at asc;
$$;

grant execute on function public.get_leaderboard() to authenticated;
