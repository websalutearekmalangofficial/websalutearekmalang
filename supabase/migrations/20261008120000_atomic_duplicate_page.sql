-- Atomic CMS page duplication: pages + sections + section_items
create or replace function public.duplicate_page(p_source_page_id uuid, p_title text, p_slug text)
returns public.pages
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_source public.pages%rowtype;
  v_new public.pages%rowtype;
  v_section public.sections%rowtype;
  v_new_section public.sections%rowtype;
  v_slug text := lower(trim(p_slug));
  v_title text := trim(p_title);
begin
  if not public.has_role(auth.uid(), 'admin'::public.app_role) then
    raise exception 'Hanya admin yang dapat menduplikasi halaman.';
  end if;
  if v_title = '' then raise exception 'Nama halaman wajib diisi.'; end if;
  if v_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-).';
  end if;
  if exists (select 1 from public.pages where slug = v_slug) then
    raise exception 'Slug "%" sudah digunakan.', v_slug;
  end if;
  select * into v_source from public.pages where id = p_source_page_id;
  if not found then raise exception 'Halaman sumber tidak ditemukan.'; end if;

  insert into public.pages (slug,title,meta_title,meta_description,nav_label,nav_order,show_in_nav,is_published,content)
  values (v_slug,v_title,v_source.meta_title,v_source.meta_description,v_title,
          coalesce(v_source.nav_order,0)+1,false,false,v_source.content)
  returning * into v_new;

  for v_section in select * from public.sections where page_id=p_source_page_id order by sort_order,id loop
    insert into public.sections (page_id,kind,sort_order,eyebrow,title,subtitle,body,media_url,media_kind,video_url,document_url,link_url,link_label,config,is_published)
    values (v_new.id,v_section.kind,v_section.sort_order,v_section.eyebrow,v_section.title,v_section.subtitle,v_section.body,v_section.media_url,v_section.media_kind,v_section.video_url,v_section.document_url,v_section.link_url,v_section.link_label,coalesce(v_section.config,'{}'::jsonb),false)
    returning * into v_new_section;

    insert into public.section_items (section_id,sort_order,title,subtitle,body,icon,badges,media_url,video_url,document_url,link_url,link_label,config,is_published)
    select v_new_section.id,sort_order,title,subtitle,body,icon,badges,media_url,video_url,document_url,link_url,link_label,coalesce(config,'{}'::jsonb),false
    from public.section_items where section_id=v_section.id order by sort_order,id;
  end loop;

  return v_new;
end;
$$;

revoke all on function public.duplicate_page(uuid,text,text) from public;
grant execute on function public.duplicate_page(uuid,text,text) to authenticated;
