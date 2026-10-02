import { supabase } from "@/integrations/supabase/client";

export type PublicTestimonial = {
  id: string;
  name: string;
  role: string;
  degree: string;
  quote: string;
  imageUrl: string | null;
};

export async function fetchPublicTestimonials(): Promise<PublicTestimonial[]> {
  const { data, error } = await supabase
    .from("sections")
    .select("id, title, is_published, section_items(*)")
    .eq("kind", "testimonials")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data?.is_published) return [];

  const items = [...((data.section_items ?? []) as Array<Record<string, unknown>>)]
    .filter((item) => item.is_published !== false)
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));

  return items.map((item) => {
    const config = (item.config && typeof item.config === "object" ? item.config : {}) as Record<string, unknown>;
    return {
      id: String(item.id),
      name: String(item.title ?? ""),
      role: String(config.role ?? item.subtitle ?? ""),
      degree: String(config.degree ?? ""),
      quote: String(item.body ?? ""),
      imageUrl: typeof item.media_url === "string" && item.media_url ? item.media_url : null,
    };
  }).filter((item) => item.name || item.quote);
}
