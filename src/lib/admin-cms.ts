import { supabase } from "@/integrations/supabase/client";
import type { NavItem, PageRecord, Section, SectionConfig, SectionItem } from "@/lib/cms";

const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 5; // 5 tahun

export async function fetchIsAdmin(userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) return false;
  return Boolean(data);
}

export async function fetchPages(): Promise<PageRecord[]> {
  const { data, error } = await supabase
    .from("pages")
    .select("id, slug, title, meta_title, meta_description, nav_label, nav_order, show_in_nav, is_published")
    .order("nav_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PageRecord[];
}

export async function duplicatePage(sourcePageId: string, title: string, slug: string): Promise<PageRecord> {\n  const normalizedSlug = slug.trim().toLowerCase().replace(/^\\/+|\\/+$/g, "");\n  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {\n    throw new Error("Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-).");\n  }\n\n  const { data: existing, error: existingError } = await supabase\n    .from("pages")\n    .select("id")\n    .eq("slug", normalizedSlug)\n    .maybeSingle();\n  if (existingError) throw existingError;\n  if (existing) throw new Error(`Slug “${normalizedSlug}” sudah digunakan. Gunakan slug lain.`);\n\n  const { data: source, error: sourceError } = await supabase\n    .from("pages")\n    .select("title, meta_title, meta_description, nav_label, nav_order")\n    .eq("id", sourcePageId)\n    .single();\n  if (sourceError) throw sourceError;\n\n  const { data: sections, error: sectionsError } = await supabase\n    .from("sections")\n    .select("*")\n    .eq("page_id", sourcePageId)\n    .order("sort_order", { ascending: true });\n  if (sectionsError) throw sectionsError;\n\n  const { data: newPage, error: pageError } = await supabase\n    .from("pages")\n    .insert({\n      slug: normalizedSlug,\n      title: title.trim(),\n      meta_title: source.meta_title,\n      meta_description: source.meta_description,\n      nav_label: title.trim(),\n      nav_order: Number(source.nav_order) + 1,\n      show_in_nav: false,\n      is_published: false,\n    })\n    .select("id, slug, title, meta_title, meta_description, nav_label, nav_order, show_in_nav, is_published")\n    .single();\n  if (pageError || !newPage) throw pageError ?? new Error("Halaman baru gagal dibuat.");\n\n  try {\n    const sectionIdMap = new Map<string, string>();\n    for (const section of sections ?? []) {\n      const { data: newSection, error: sectionError } = await supabase\n        .from("sections")\n        .insert({\n          page_id: newPage.id,\n          kind: section.kind,\n          sort_order: section.sort_order,\n          eyebrow: section.eyebrow,\n          title: section.title,\n          subtitle: section.subtitle,\n          body: section.body,\n          media_url: section.media_url,\n          media_kind: section.media_kind,\n          video_url: section.video_url,\n          document_url: section.document_url,\n          link_url: section.link_url,\n          link_label: section.link_label,\n          config: section.config ?? {},\n          is_published: false,\n        })\n        .select("id")\n        .single();\n      if (sectionError || !newSection) throw sectionError ?? new Error("Section gagal diduplikasi.");\n      sectionIdMap.set(section.id, newSection.id);\n\n      const { data: items, error: itemsError } = await supabase\n        .from("section_items")\n        .select("*")\n        .eq("section_id", section.id)\n        .order("sort_order", { ascending: true });\n      if (itemsError) throw itemsError;\n\n      if (items?.length) {\n        const itemRows = items.map((item) => ({\n          section_id: newSection.id,\n          sort_order: item.sort_order,\n          title: item.title,\n          subtitle: item.subtitle,\n          body: item.body,\n          icon: item.icon,\n          badges: item.badges ?? [],\n          media_url: item.media_url,\n          video_url: item.video_url,\n          document_url: item.document_url,\n          link_url: item.link_url,\n          link_label: item.link_label,\n          config: item.config ?? {},\n          is_published: false,\n        }));\n        const { error: insertItemsError } = await supabase.from("section_items").insert(itemRows);\n        if (insertItemsError) throw insertItemsError;\n      }\n    }\n  } catch (error) {\n    await supabase.from("pages").delete().eq("id", newPage.id);\n    throw error;\n  }\n\n  return newPage as PageRecord;\n}\n\nexport async function fetchSections(pageId: string): Promise<Section[]> {
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("page_id", pageId)
    .order("sort_order", { ascending: true });
  if (error) throw error;

  const rows = data ?? [];
  const ids = rows.map((row) => row.id);
  let items: SectionItem[] = [];
  if (ids.length > 0) {
    const { data: itemRows, error: itemError } = await supabase
      .from("section_items")
      .select("*")
      .in("section_id", ids)
      .order("sort_order", { ascending: true });
    if (itemError) throw itemError;
    items = (itemRows ?? []) as unknown as SectionItem[];
  }

  return rows.map((row) => ({
    ...(row as unknown as Omit<Section, "items" | "config">),
    config: (row.config ?? {}) as SectionConfig,
    items: items.filter((item) => item.section_id === row.id),
  }));
}

export async function fetchNavItems(): Promise<NavItem[]> {
  const { data, error } = await supabase
    .from("nav_items")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as NavItem[];
}

export type MediaRow = {
  id: string;
  title: string | null;
  storage_path: string | null;
  url: string;
  media_kind: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

export async function fetchMedia(): Promise<MediaRow[]> {
  const { data, error } = await supabase
    .from("media_library")
    .select("id, title, storage_path, url, media_kind, mime_type, size_bytes, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MediaRow[];
}

export type RegistrationRow = {
  id: string;
  registration_reference: string | null;
  nama: string;
  sekolah: string | null;
  kota: string | null;
  email: string | null;
  nomor_hp: string | null;
  nomor_hp_2: string | null;
  telp_rumah: string | null;
  jalur: string | null;
  jenjang_pendidikan: string | null;
  fakultas: string | null;
  jurusan: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  agama: string | null;
  jenis_kelamin: string | null;
  kewarganegaraan: string | null;
  nama_ibu_kandung: string | null;
  alamat_lengkap: string | null;
  sosial_media: Record<string, string> | null;
  status: string;
  notes: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type RegistrationDocument = {
  name: string;
  path: string;
  size: number | null;
  updated_at: string | null;
};

export async function fetchRegistrationDocuments(registrationId: string): Promise<RegistrationDocument[]> {
  const { data, error } = await supabase.storage
    .from("dokumen-pendaftaran")
    .list(registrationId, { limit: 100, sortBy: { column: "name", order: "asc" } });
  if (error) throw error;

  return (data ?? [])
    .filter((file) => Boolean(file.name))
    .map((file) => ({
      name: file.name,
      path: `${registrationId}/${file.name}`,
      size: file.metadata?.size ?? null,
      updated_at: file.updated_at ?? null,
    }));
}

export async function createRegistrationDocumentUrl(path: string) {
  const { data, error } = await supabase.storage
    .from("dokumen-pendaftaran")
    .createSignedUrl(path, 10 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function fetchRegistrations(): Promise<RegistrationRow[]> {
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as RegistrationRow[];
}

function guessMediaKind(file: File): "image" | "video" | "document" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "document";
}

/** Mengunggah berkas ke ruang media lalu mencatatnya di perpustakaan media. */
export async function uploadMedia(file: File, title?: string) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage.from("cms-media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data: signed, error: signedError } = await supabase.storage
    .from("cms-media")
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (signedError || !signed?.signedUrl) throw signedError ?? new Error("Gagal membuat tautan berkas.");

  const { data: user } = await supabase.auth.getUser();

  const { error: insertError } = await supabase.from("media_library").insert({
    title: title?.trim() || file.name,
    storage_path: path,
    url: signed.signedUrl,
    media_kind: guessMediaKind(file),
    mime_type: file.type || null,
    size_bytes: file.size,
    uploaded_by: user.user?.id ?? null,
  });
  if (insertError) throw insertError;

  return signed.signedUrl;
}

export async function deleteMedia(row: MediaRow) {
  if (row.storage_path) {
    await supabase.storage.from("cms-media").remove([row.storage_path]);
  }
  const { error } = await supabase.from("media_library").delete().eq("id", row.id);
  if (error) throw error;
}

/** Menukar urutan dua baris pada tabel yang memiliki kolom sort_order. */
export async function swapOrder(
  table: "sections" | "section_items" | "nav_items" | "pages",
  a: { id: string; order: number },
  b: { id: string; order: number },
) {
  const column = table === "pages" ? "nav_order" : "sort_order";
  const patch = (order: number) => ({ [column]: order }) as never;
  const updates = [
    supabase.from(table).update(patch(b.order)).eq("id", a.id),
    supabase.from(table).update(patch(a.order)).eq("id", b.id),
  ];
  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
}
