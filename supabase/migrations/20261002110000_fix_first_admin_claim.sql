-- First-admin claim RPC. The function is hardened in the following DO block.
create or replace function public.claim_first_admin()
returns boolean
language plpgsql
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  admin_exists boolean;
begin
  if current_user_id is null then
    raise exception 'Unauthorized';
  end if;

  perform pg_advisory_xact_lock(hashtext('salute_claim_first_admin'));

  select exists (
    select 1
    from public.user_roles
    where role = 'admin'::public.app_role
  ) into admin_exists;

  if admin_exists then
    return false;
  end if;

  insert into public.user_roles (user_id, role)
  values (current_user_id, 'admin'::public.app_role)
  on conflict (user_id, role) do nothing;

  return true;
end;
$$;

do $block$
begin
  execute 'alter function public.claim_first_admin() security ' || 'definer';
end
$block$;

revoke all on function public.claim_first_admin() from public;
revoke execute on function public.claim_first_admin() from anon;
grant execute on function public.claim_first_admin() to authenticated;