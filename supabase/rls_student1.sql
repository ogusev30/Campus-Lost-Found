-- Campus Lost & Found — Student 1 (Report & Manage) policies and functions.
-- Run this SECOND, after schema.sql.

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

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
-- every other pending claim on that same item -> rejected.
create or replace function public.accept_claim(claim_id_input uuid)
returns void
language plpgsql
security invoker
as $$
declare
  v_item_id uuid;
begin
  if not exists (
    select 1
    from public.claims c
    join public.items i on i.id = c.item_id
    where c.id = claim_id_input and i.owner_id = auth.uid()
  ) then
    raise exception 'Not authorized to accept this claim';
  end if;

  select item_id into v_item_id from public.claims where id = claim_id_input;

  update public.claims set status = 'accepted' where id = claim_id_input;
  update public.items set status = 'claimed' where id = v_item_id;
  update public.claims
    set status = 'rejected'
    where item_id = v_item_id and id <> claim_id_input and status = 'pending';
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
