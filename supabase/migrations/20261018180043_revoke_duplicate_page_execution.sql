REVOKE ALL ON FUNCTION public.duplicate_page(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.duplicate_page(uuid, text, text) TO service_role;