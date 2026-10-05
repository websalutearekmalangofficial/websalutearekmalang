-- User dashboard account foundation
alter table public.profiles
  add column if not exists username text,
  add column if not exists must_change_password boolean not null default true,
  add column if not exists first_login_at timestamptz;

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username))
  where username is not null;

alter table public.registrations
  add constraint registrations_user_id_unique unique (user_id);

drop policy if exists "Authenticated can view registrations" on public.registrations;
create policy "Users can view own registration"
on public.registrations
for select
to authenticated
using (
  private.has_role((select auth.uid()), 'admin'::app_role)
  or user_id = (select auth.uid())
  or (
    user_id is null
    and email is not null
    and lower(email) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
  )
);

drop policy if exists "Authenticated can view profiles" on public.profiles;
create policy "Authenticated can view own profile or admin"
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = id
  or private.has_role((select auth.uid()), 'admin'::app_role)
);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
