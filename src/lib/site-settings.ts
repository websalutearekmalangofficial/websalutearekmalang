import { supabase } from "@/integrations/supabase/client";

export const SITE_LOGO_SETTING_KEY = "site_logo_url";

export async function fetchSiteLogoUrl(): Promise<string | null> {
  const { data, error } = await supabase
    .from("admin_settings")
    .select("value")
    .eq("key", SITE_LOGO_SETTING_KEY)
    .maybeSingle();

  if (error) throw error;
  return data?.value?.trim() || null;
}
