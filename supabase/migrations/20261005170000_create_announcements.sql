create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null default 'umum',
  priority integer not null default 0,
  is_published boolean not null default false,
  published_at timestamptz,
  expires_at timestamptz,
  target_user_id uuid references auth.users(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists announcements_published_idx on public.announcements (is_published, published_at desc, expires_at);
create index if not exists announcements_target_user_idx on public.announcements (target_user_id);
alter table public.announcements enable row level security;
grant select, insert, update, delete on public.announcements to authenticated;
drop policy if exists "Users can view published announcements" on public.announcements;
create policy "Users can view published announcements" on public.announcements for select to authenticated
using (is_published = true and (published_at is null or published_at <= now()) and (expires_at is null or expires_at > now()) and (target_user_id is null or target_user_id = (select auth.uid())));
drop policy if exists "Admins can manage announcements" on public.announcements;
create policy "Admins can manage announcements" on public.announcements for all to authenticated
using (private.has_role((select auth.uid()), 'admin'::app_role))
with check (private.has_role((select auth.uid()), 'admin'::app_role));