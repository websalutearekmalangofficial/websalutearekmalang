-- Ensure the Kemahasiswaan editorial page has CMS-managed video and news sections.
-- Idempotent: preserves existing content and does not create duplicate sections.
DO $$
DECLARE
  v_page_id uuid;
BEGIN
  SELECT id INTO v_page_id
  FROM public.pages
  WHERE slug = 'kemahasiswaan'
  LIMIT 1;

  IF v_page_id IS NULL THEN
    RAISE EXCEPTION 'Halaman kemahasiswaan tidak ditemukan; migrasi dibatalkan tanpa membuat halaman duplikat.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.sections
    WHERE page_id = v_page_id AND kind = 'leaderboard'
  ) THEN
    INSERT INTO public.sections
      (page_id, kind, sort_order, eyebrow, title, subtitle, body, config, is_published)
    VALUES
      (v_page_id, 'leaderboard', 4, 'Tonton dan kenali',
       'Video Profil & Cerita Kami',
       'Tambahkan video profil resmi SALUT Arek Malang.',
       'Kelola judul, deskripsi, thumbnail, dan URL video melalui Admin > Halaman > Kemahasiswaan.',
       '{}'::jsonb, true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.sections
    WHERE page_id = v_page_id AND kind = 'news'
  ) THEN
    INSERT INTO public.sections
      (page_id, kind, sort_order, eyebrow, title, subtitle, body, config, is_published)
    VALUES
      (v_page_id, 'news', 7, 'Informasi terbaru',
       'Kabar Terkini',
       'Berita, pengumuman, dan cerita kegiatan komunitas.',
       'Tambahkan konten resmi melalui Admin > Halaman > Kemahasiswaan. Hindari mengisi berita contoh seolah-olah merupakan kegiatan nyata.',
       '{}'::jsonb, true);
  END IF;
END $$;
