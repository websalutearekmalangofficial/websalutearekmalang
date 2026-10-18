-- Keep duplicate_page callable only by signed-in sessions and server-side service role.
-- The function itself validates that the caller has the admin role.
REVOKE ALL ON FUNCTION public.duplicate_page(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.duplicate_page(uuid, text, text) TO authenticated, service_role;
