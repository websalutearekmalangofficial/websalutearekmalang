import { supabase } from "@/integrations/supabase/client";

export const HERO_BUCKET = "cms-media";
export const HERO_SIGNED_URL_TTL = 60 * 60 * 24;

export type HeroBanner = {
  id: string;
  page_id: string;
  section_id: string;
  title: string | null;
  alt_text: string | null;
  storage_path: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  url: string;
};

type HeroBannerRow = Omit<HeroBanner, "url">;

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

export async function fetchHeroBanners(pageId: string, sectionId: string): Promise<HeroBanner[]> {
  const { data, error } = await supabase
    .from("hero_banners")
    .select("id, page_id, section_id, title, alt_text, storage_path, sort_order, is_active, created_at, updated_at")
    .eq("page_id", pageId)
    .eq("section_id", sectionId)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as HeroBannerRow[];
  if (rows.length === 0) return [];

  const { data: signed, error: signedError } = await supabase.storage
    .from(HERO_BUCKET)
    .createSignedUrls(rows.map((row) => row.storage_path), HERO_SIGNED_URL_TTL);

  if (signedError) throw signedError;

  return rows.map((row, index) => ({
    ...row,
    url: signed?.[index]?.signedUrl ?? "",
  }));
}


export async function fetchPublicHeroBanners(): Promise<HeroBanner[]> {
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", "beranda")
    .eq("is_published", true)
    .maybeSingle();

  if (pageError) throw pageError;
  if (!page?.id) return [];

  const { data: section, error: sectionError } = await supabase
    .from("sections")
    .select("id")
    .eq("page_id", page.id)
    .eq("kind", "hero")
    .eq("is_published", true)
    .maybeSingle();

  if (sectionError) throw sectionError;
  if (!section?.id) return [];

  const { data, error } = await supabase
    .from("hero_banners")
    .select("id, page_id, section_id, title, alt_text, storage_path, sort_order, is_active, created_at, updated_at")
    .eq("page_id", page.id)
    .eq("section_id", section.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as HeroBannerRow[];
  if (rows.length === 0) return [];

  const { data: signed, error: signedError } = await supabase.storage
    .from(HERO_BUCKET)
    .createSignedUrls(rows.map((row) => row.storage_path), HERO_SIGNED_URL_TTL);

  if (signedError) throw signedError;

  return rows
    .map((row, index) => ({
      ...row,
      url: signed?.[index]?.signedUrl ?? "",
    }))
    .filter((banner) => Boolean(banner.url));
}

export async function uploadHeroBanner(
  file: File,
  args: { pageId: string; sectionId: string; title?: string; altText?: string },
) {
  if (!file.type.startsWith("image/")) {
    throw new Error("File hero banner harus berupa gambar.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Ukuran hero banner maksimal 10 MB.");
  }

  const path = `hero-banners/${args.sectionId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage.from(HERO_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data: existing, error: existingError } = await supabase
    .from("hero_banners")
    .select("sort_order")
    .eq("page_id", args.pageId)
    .eq("section_id", args.sectionId)
    .order("sort_order", { ascending: false })
    .limit(1);

  if (existingError) {
    await supabase.storage.from(HERO_BUCKET).remove([path]);
    throw existingError;
  }

  const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("hero_banners")
    .insert({
      page_id: args.pageId,
      section_id: args.sectionId,
      title: args.title?.trim() || file.name,
      alt_text: args.altText?.trim() || file.name,
      storage_path: path,
      sort_order: nextOrder,
      is_active: true,
    })
    .select("id, page_id, section_id, title, alt_text, storage_path, sort_order, is_active, created_at, updated_at")
    .single();

  if (error) {
    await supabase.storage.from(HERO_BUCKET).remove([path]);
    throw error;
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from(HERO_BUCKET)
    .createSignedUrl(path, HERO_SIGNED_URL_TTL);

  if (signedError) throw signedError;

  return { ...(data as HeroBannerRow), url: signed.signedUrl } satisfies HeroBanner;
}

export async function replaceHeroBanner(id: string, file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("File hero banner harus berupa gambar.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Ukuran hero banner maksimal 10 MB.");
  }

  const { data: current, error: currentError } = await supabase
    .from("hero_banners")
    .select("storage_path")
    .eq("id", id)
    .single();
  if (currentError) throw currentError;

  const newPath = `hero-banners/replacements/${crypto.randomUUID()}-${safeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage.from(HERO_BUCKET).upload(newPath, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { error: updateError } = await supabase
    .from("hero_banners")
    .update({
      storage_path: newPath,
      title: file.name,
      alt_text: file.name,
    })
    .eq("id", id);

  if (updateError) {
    await supabase.storage.from(HERO_BUCKET).remove([newPath]);
    throw updateError;
  }

  await supabase.storage.from(HERO_BUCKET).remove([current.storage_path]);

  const { data: signed, error: signedError } = await supabase.storage
    .from(HERO_BUCKET)
    .createSignedUrl(newPath, HERO_SIGNED_URL_TTL);
  if (signedError) throw signedError;

  return signed.signedUrl;
}

export async function deleteHeroBanner(id: string) {
  const { data: current, error: currentError } = await supabase
    .from("hero_banners")
    .select("storage_path")
    .eq("id", id)
    .single();
  if (currentError) throw currentError;

  const { error: deleteError } = await supabase.from("hero_banners").delete().eq("id", id);
  if (deleteError) throw deleteError;

  const { error: storageError } = await supabase.storage.from(HERO_BUCKET).remove([current.storage_path]);
  if (storageError) throw storageError;
}

export async function setHeroBannerActive(id: string, isActive: boolean) {
  const { error } = await supabase.from("hero_banners").update({ is_active: isActive }).eq("id", id);
  if (error) throw error;
}

export async function moveHeroBanner(
  current: Pick<HeroBanner, "id" | "sort_order">,
  target: Pick<HeroBanner, "id" | "sort_order">,
) {
  const first = await supabase.from("hero_banners").update({ sort_order: target.sort_order }).eq("id", current.id);
  if (first.error) throw first.error;

  const second = await supabase.from("hero_banners").update({ sort_order: current.sort_order }).eq("id", target.id);
  if (second.error) throw second.error;
}
