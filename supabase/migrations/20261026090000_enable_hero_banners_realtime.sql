-- Forward-only reconciliation: ensure CMS hero banner changes are published to Supabase Realtime.
-- Production snapshot on 2026-10-26 showed hero_banners missing from supabase_realtime,
-- while CMS tables pages/sections/section_items are already members.
-- Idempotent: does not re-add the table if it is already present.
DO $$
BEGIN
  IF to_regclass('public.hero_banners') IS NOT NULL
     AND EXISTS (
       SELECT 1
       FROM pg_publication
       WHERE pubname = 'supabase_realtime'
     )
     AND NOT EXISTS (
       SELECT 1
       FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'hero_banners'
     )
  THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.hero_banners;
  END IF;
END
$$;
