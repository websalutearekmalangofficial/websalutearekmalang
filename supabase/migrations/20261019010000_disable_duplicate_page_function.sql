-- Disable page duplication without dropping the function or changing existing page data.
-- Keep the signature so older clients fail safely with a clear message.
CREATE OR REPLACE FUNCTION public.duplicate_page(p_source_page_id uuid, p_title text, p_slug text)
RETURNS public.pages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  RAISE EXCEPTION 'Fitur duplikasi halaman sedang dinonaktifkan.'
    USING ERRCODE = 'feature_not_supported';
END;
$function$;

REVOKE ALL ON FUNCTION public.duplicate_page(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.duplicate_page(uuid, text, text) TO service_role;
