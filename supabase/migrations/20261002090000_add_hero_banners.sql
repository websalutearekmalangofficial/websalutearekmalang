-- Hero Banner CMS: database-backed single/multiple image banners for Beranda.
create table if not exists public.hero_banners (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  section_id uuid not null references public.sections(id) on delete cascade,
  title text,
  alt_text text,
  storage_path text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hero_banners_page_section_order_idx
  on public.hero_banners(page_id, section_id, sort_order);

create or replace function public.set_hero_banners_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists hero_banners_updated_at on public.hero_banners;
create trigger hero_banners_updated_at
before update on public.hero_banners
for each row execute function public.set_hero_banners_updated_at();

alter table public.hero_banners enable row level security;

drop policy if exists "Public can view active hero banners" on public.hero_banners;
create policy "Public can view active hero banners"
on public.hero_banners for select to anon
using (is_active = true);

drop policy if exists "Authenticated can view hero banners" on public.hero_banners;
create policy "Authenticated can view hero banners"
on public.hero_banners for select to authenticated
using (is_active = true or private.has_role((select auth.uid()), 'admin'::app_role));

drop policy if exists "Admins can insert hero banners" on public.hero_banners;
create policy "Admins can insert hero banners"
on public.hero_banners for insert to authenticated
with check (private.has_role((select auth.uid()), 'admin'::app_role));

drop policy if exists "Admins can update hero banners" on public.hero_banners;
create policy "Admins can update hero banners"
on public.hero_banners for update to authenticated
using (private.has_role((select auth.uid()), 'admin'::app_role))
with check (private.has_role((select auth.uid()), 'admin'::app_role));

drop policy if exists "Admins can delete hero banners" on public.hero_banners;
create policy "Admins can delete hero banners"
on public.hero_banners for delete to authenticated
using (private.has_role((select auth.uid()), 'admin'::app_role));

grant select on public.hero_banners to anon, authenticated;
grant insert, update, delete on public.hero_banners to authenticated;
