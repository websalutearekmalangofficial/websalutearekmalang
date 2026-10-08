-- Keep the duplicate-page behavior in version control. This migration matches the live function applied to Supabase.
create or replace function public.duplicate_page(p_source_page_id uuid, p_title text, p_slug text)
returns public.pages
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare v_source public.pages%rowtype; v_new public.pages%rowtype; v_section public.sections%rowtype; v_new_section public.sections%rowtype; v_slug text := lower(trim(p_slug)); v_title text := trim(p_title);
begin
 if not public.has_role(auth.uid(), 'admin'::public.app_role) then raise exception 'Hanya admin yang dapat menduplikasi halaman.'; end if;
 if v_title = '' then raise exception 'Nama halaman wajib diisi.'; end if;
 if v_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then raise exception 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-).'; end if;
 if exists (select 1 from public.pages where slug=v_slug) then raise exception 'Slug "%" sudah digunakan.',v_slug; end if;
 select * into v_source from public.pages where id=p_source_page_id; if not found then raise exception 'Halaman sumber tidak ditemukan.'; end if;
 insert into public.pages (slug,title,meta_title,meta_description,nav_label,nav_order,show_in_nav,is_published,content)
 values (v_slug,v_title,v_source.meta_title,v_source.meta_description,v_title,coalesce(v_source.nav_order,0)+1,false,false,case when v_source.slug='beranda' then jsonb_build_object('template','homepage') else v_source.content end) returning * into v_new;
 for v_section in select * from public.sections where page_id=p_source_page_id order by sort_order,id loop
  insert into public.sections (page_id,kind,sort_order,eyebrow,title,subtitle,body,media_url,media_kind,video_url,document_url,link_url,link_label,config,is_published)
  values (v_new.id,v_section.kind,v_section.sort_order,v_section.eyebrow,v_section.title,v_section.subtitle,v_section.body,v_section.media_url,v_section.media_kind,v_section.video_url,v_section.document_url,v_section.link_url,v_section.link_label,coalesce(v_section.config,'{}'::jsonb),v_section.is_published) returning * into v_new_section;
  insert into public.section_items (section_id,sort_order,title,subtitle,body,icon,badges,media_url,video_url,document_url,link_url,link_label,config,is_published)
  select v_new_section.id,sort_order,title,subtitle,body,icon,badges,media_url,video_url,document_url,link_url,link_label,coalesce(config,'{}'::jsonb),is_published from public.section_items where section_id=v_section.id order by sort_order,id;
 end loop;
 insert into public.hero_banners (page_id,section_id,title,alt_text,storage_path,sort_order,is_active)
 select v_new.id,ns.id,h.title,h.alt_text,h.storage_path,h.sort_order,h.is_active from public.hero_banners h join public.sections os on os.id=h.section_id and os.page_id=p_source_page_id join public.sections ns on ns.page_id=v_new.id and ns.sort_order=os.sort_order and ns.kind=os.kind where os.kind='hero';
 return v_new;
end; $$;
revoke all on function public.duplicate_page(uuid,text,text) from public;
grant execute on function public.duplicate_page(uuid,text,text) to authenticated;