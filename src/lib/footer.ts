import { supabase } from "@/integrations/supabase/client";

export type FooterItem = {
  id: string;
  label: string;
  href: string;
  icon?: string;
  enabled: boolean;
};

export type FooterColumn = {
  id: string;
  title: string;
  items: FooterItem[];
  enabled: boolean;
};

export type FooterContent = {
  contact: { label: string; phone: string; phone_href: string; enabled: boolean };
  slogan: { line1: string; line2: string; enabled: boolean };
  address: { text: string; enabled: boolean };
  layout: {
    background_color: string;
    sync_columns: boolean;
    columns: {
      contact: { height: number; alignment: "start" | "center" | "end" };
      address: { height: number; alignment: "start" | "center" | "end" };
      image: { height: number; alignment: "start" | "center" | "end" };
    };
  };
  columns: FooterColumn[];
};

export const defaultFooterContent: FooterContent = {
  contact: { label: "Layanan Informasi Pendaftaran", phone: "0812-3002-4264", phone_href: "tel:081230024264", enabled: true },
  slogan: { line1: "Kuliah Fleksibel,", line2: "Raih Masa Depan", enabled: true },
  address: { 
    text: "Mall Pelayanan Publik Merdeka Malang Lt. 3 (Ramayana Alun-Alun Kota Malang) Jl. Merdeka Timur No. 4 Malang.", 
    enabled: true 
  },
  layout: {
    background_color: "#a7c8e1",
    sync_columns: true,
    columns: {
      contact: { height: 300, alignment: "start" },
      address: { height: 300, alignment: "start" },
      image: { height: 300, alignment: "start" },
    },
  },
  columns: [],
};

function parseFooter(value: string | null | undefined): FooterContent {
  if (!value) return defaultFooterContent;
  try {
    const parsed = JSON.parse(value) as Partial<FooterContent>;
    return {
      ...defaultFooterContent,
      ...parsed,
      contact: { ...defaultFooterContent.contact, ...(parsed.contact ?? {}) },
      slogan: { ...defaultFooterContent.slogan, ...(parsed.slogan ?? {}) },
      address: { ...defaultFooterContent.address, ...(parsed.address ?? {}) },
      layout: {
        ...defaultFooterContent.layout,
        ...(parsed.layout ?? {}),
        columns: {
          ...defaultFooterContent.layout.columns,
          ...(parsed.layout?.columns ?? {}),
          contact: { ...defaultFooterContent.layout.columns.contact, ...(parsed.layout?.columns?.contact ?? {}) },
          address: { ...defaultFooterContent.layout.columns.address, ...(parsed.layout?.columns?.address ?? {}) },
          image: { ...defaultFooterContent.layout.columns.image, ...(parsed.layout?.columns?.image ?? {}) },
        },
      },
      columns: Array.isArray(parsed.columns) ? parsed.columns : [],
    };
  } catch {
    return defaultFooterContent;
  }
}

export async function fetchPublicFooter(): Promise<FooterContent> {
  const { data, error } = await supabase.from("admin_settings").select("value").eq("key", "footer_content").maybeSingle();
  if (error) throw error;
  return parseFooter(data?.value);
}

export async function fetchFooterAdmin(): Promise<FooterContent> {
  return fetchPublicFooter();
}

export async function saveFooterAdmin(content: FooterContent) {
  const { data: user } = await supabase.auth.getUser();
  const { error } = await supabase.from("admin_settings").upsert({
    key: "footer_content",
    value: JSON.stringify(content),
    description: "Konten Footer Website: kontak, slogan, alamat, dan item/kolom footer yang dikelola dari Dashboard Admin",
    updated_by: user.user?.id ?? null,
  }, { onConflict: "key" });
  if (error) throw error;
}
