import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, ImagePlus, Plus, Power, RefreshCw, Replace, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminCard, Field, inputClass, textareaClass } from "@/components/admin/field";
import { MediaPicker } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fetchPages, fetchSections, swapOrder } from "@/lib/admin-cms";
import { deleteHeroBanner, fetchHeroBanners, moveHeroBanner, replaceHeroBanner, setHeroBannerActive, uploadHeroBanner, type HeroBanner } from "@/lib/hero-banners";
import { iconNames, sectionKinds, type PageRecord, type Section, type SectionItem } from "@/lib/cms";

export const Route = createFileRoute("/_authenticated/admin/halaman")({
  component: PagesAdmin,
});

function PagesAdmin() {
  const queryClient = useQueryClient();
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  const pagesQuery = useQuery({ queryKey: ["pages"], queryFn: fetchPages });
  const pages = pagesQuery.data ?? [];

  useEffect(() => {
    if (!selectedPageId && pages.length > 0) setSelectedPageId(pages[0]!.id);
  }, [pages, selectedPageId]);

  const sectionsQuery = useQuery({
    queryKey: ["sections", selectedPageId],
    queryFn: () => fetchSections(selectedPageId!),
    enabled: Boolean(selectedPageId),
  });

  const refreshPages = () => queryClient.invalidateQueries({ queryKey: ["pages"] });
  const refreshSections = () => queryClient.invalidateQueries({ queryKey: ["sections", selectedPageId] });

  const addPage = useMutation({
    mutationFn: async () => {
      const nextOrder = pages.length + 1;
      const { error } = await supabase.from("pages").insert({
        slug: `halaman-baru-${Date.now()}`,
        title: "Halaman Baru",
        nav_label: "Halaman Baru",
        nav_order: nextOrder,
        is_published: false,
        show_in_nav: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Halaman baru dibuat.");
      refreshPages();
    },
    onError: () => toast.error("Gagal membuat halaman."),
  });

  const addSection = useMutation({
    mutationFn: async () => {
      const nextOrder = (sectionsQuery.data?.length ?? 0) + 1;
      const { error } = await supabase.from("sections").insert({
        page_id: selectedPageId!,
        kind: "richtext",
        sort_order: nextOrder,
        title: "Section Baru",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Section baru ditambahkan.");
      refreshSections();
    },
    onError: () => toast.error("Gagal menambah section."),
  });

  const selectedPage = pages.find((page) => page.id === selectedPageId) ?? null;
  const sections = sectionsQuery.data ?? [];

  return (
    <>
      <AdminCard title="Daftar Halaman" description="Pilih halaman untuk mengelola section di dalamnya.">
        <div className="mb-4 flex flex-wrap gap-2">
          {pages.map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={() => setSelectedPageId(page.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition ${
                page.id === selectedPageId
                  ? "bg-ut-yellow text-ut-navy shadow-yellow"
                  : "border border-border bg-background text-ut-navy hover:bg-section-blue"
              }`}
            >
              {page.title}
              {page.is_published ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            </button>
          ))}
          <Button type="button" variant="formOutline" className="h-10 rounded-full px-4" onClick={() => addPage.mutate()}>
            <Plus className="size-4" aria-hidden="true" />
            Halaman baru
          </Button>
        </div>

        {selectedPage ? <PageForm page={selectedPage} onSaved={refreshPages} /> : null}

        {selectedPage?.slug === "beranda" ? (
          <HeroBannerManager
            pageId={selectedPage.id}
            sectionId={sections.find((section) => section.kind === "hero")?.id ?? null}
          />
        ) : null}
      </AdminCard>

      <AdminCard
        title="Section di Halaman Ini"
        description="Urutan di bawah ini sama dengan urutan tampil di website."
      >
        <div className="space-y-3">
          {sections.map((section, index) => (
            <SectionEditor
              key={section.id}
              section={section}
              index={index}
              total={sections.length}
              siblings={sections}
              onChanged={refreshSections}
            />
          ))}
          {sections.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada section di halaman ini.</p>
          ) : null}
          <Button type="button" variant="utYellow" size="form" onClick={() => addSection.mutate()} disabled={!selectedPageId}>
            <Plus className="size-4" aria-hidden="true" />
            Tambah section
          </Button>
        </div>
      </AdminCard>
    </>
  );
}

function PageForm({ page, onSaved }: { page: PageRecord; onSaved: () => void }) {
  const [form, setForm] = useState(page);
  useEffect(() => setForm(page), [page]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("pages")
        .update({
          slug: form.slug.trim(),
          title: form.title.trim(),
          meta_title: form.meta_title,
          meta_description: form.meta_description,
          nav_label: form.nav_label,
          nav_order: Number(form.nav_order) || 0,
          show_in_nav: form.show_in_nav,
          is_published: form.is_published,
        })
        .eq("id", page.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Halaman disimpan.");
      onSaved();
    },
    onError: () => toast.error("Gagal menyimpan halaman."),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("pages").delete().eq("id", page.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Halaman dihapus.");
      onSaved();
    },
    onError: () => toast.error("Gagal menghapus halaman."),
  });

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Judul halaman">
          <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Alamat halaman (slug)">
          <input className={inputClass} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </Field>
        <Field label="Judul untuk mesin pencari">
          <input className={inputClass} value={form.meta_title ?? ""} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} />
        </Field>
        <Field label="Label di menu">
          <input className={inputClass} value={form.nav_label ?? ""} onChange={(e) => setForm({ ...form, nav_label: e.target.value })} />
        </Field>
        <Field label="Urutan di menu">
          <input type="number" className={inputClass} value={form.nav_order} onChange={(e) => setForm({ ...form, nav_order: Number(e.target.value) })} />
        </Field>
        <Field label="Deskripsi singkat">
          <input className={inputClass} value={form.meta_description ?? ""} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} />
        </Field>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Toggle label="Tayang" checked={form.is_published} onChange={(v) => setForm({ ...form, is_published: v })} />
        <Toggle label="Tampilkan di menu" checked={form.show_in_nav} onChange={(v) => setForm({ ...form, show_in_nav: v })} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="utYellow" size="form" onClick={() => save.mutate()} disabled={save.isPending}>
          <Save className="size-4" aria-hidden="true" />
          Simpan halaman
        </Button>
        <Button
          type="button"
          variant="formOutline"
          size="form"
          onClick={() => {
            if (confirm(`Hapus halaman "${page.title}" beserta seluruh isinya?`)) remove.mutate();
          }}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Hapus halaman
        </Button>
      </div>
    </div>
  );
}


function HeroBannerManager({ pageId, sectionId }: { pageId: string; sectionId: string | null }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const bannersQuery = useQuery({
    queryKey: ["hero-banners", pageId, sectionId],
    queryFn: () => fetchHeroBanners(pageId, sectionId!),
    enabled: Boolean(sectionId),
  });

  const banners = bannersQuery.data ?? [];

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["hero-banners", pageId, sectionId] });

  const uploadFiles = async (files: FileList | null) => {
    if (!sectionId || !files?.length) return;
    setUploading(true);
    try {
      const selected = Array.from(files);
      for (const file of selected) {
        await uploadHeroBanner(file, {
          pageId,
          sectionId,
          title: file.name,
          altText: `Hero Banner Salute Arek Malang - ${file.name}`,
        });
      }
      toast.success(`${selected.length} banner berhasil diunggah.`);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengunggah banner.");
    } finally {
      setUploading(false);
    }
  };

  const replace = async (banner: HeroBanner, file: File | undefined) => {
    if (!file) return;
    try {
      await replaceHeroBanner(banner.id, file);
      toast.success("Hero banner berhasil diganti.");
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengganti banner.");
    }
  };

  const remove = async (banner: HeroBanner) => {
    if (!confirm(`Hapus banner "${banner.title ?? "ini"}"?`)) return;
    try {
      await deleteHeroBanner(banner.id);
      toast.success("Hero banner dihapus.");
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus banner.");
    }
  };

  const toggle = async (banner: HeroBanner) => {
    try {
      await setHeroBannerActive(banner.id, !banner.is_active);
      toast.success(banner.is_active ? "Banner dinonaktifkan." : "Banner diaktifkan.");
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengubah status banner.");
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = banners[index + direction];
    const current = banners[index];
    if (!current || !target) return;
    try {
      await moveHeroBanner(current, target);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengubah urutan slide.");
    }
  };

  if (!sectionId) {
    return (
      <AdminCard title="Hero Banner Beranda" description="Section Hero untuk Beranda belum tersedia.">
        <p className="text-sm text-muted-foreground">Buat atau pulihkan section dengan jenis “Hero (banner utama)” terlebih dahulu.</p>
      </AdminCard>
    );
  }

  return (
    <AdminCard
      title="Hero Banner Beranda"
      description="Kelola gambar hero dari database dan Supabase Storage. Satu gambar tampil sebagai banner tunggal; lebih dari satu gambar otomatis menjadi slide."
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ut-sky/30 bg-section-blue p-4">
        <div>
          <p className="text-sm font-black text-ut-navy">Banner aktif: {banners.filter((banner) => banner.is_active).length}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Urutan slide mengikuti nomor di bawah. Gunakan tombol naik/turun untuk mengatur urutan.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-ut-yellow px-4 py-2.5 text-sm font-black text-ut-navy shadow-yellow transition hover:-translate-y-0.5">
          <ImagePlus className="size-4" aria-hidden="true" />
          {uploading ? "Mengunggah..." : "Upload Multiple Banner"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            multiple
            className="sr-only"
            disabled={uploading}
            onChange={(event) => {
              void uploadFiles(event.target.files);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      {bannersQuery.isLoading ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Memuat hero banner...</div>
      ) : banners.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <ImagePlus className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm font-black text-ut-navy">Belum ada hero banner.</p>
          <p className="mt-1 text-xs text-muted-foreground">Upload satu atau beberapa gambar untuk mulai membuat banner/slide.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {banners.map((banner, index) => (
            <article key={banner.id} className={`overflow-hidden rounded-2xl border bg-card ${banner.is_active ? "border-ut-sky/50" : "border-border opacity-70"}`}>
              <div className="grid gap-4 p-4 md:grid-cols-[220px_minmax(0,1fr)]">
                <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-100">
                  {banner.url ? (
                    <img src={banner.url} alt={banner.alt_text ?? "Hero banner"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-muted-foreground">Preview tidak tersedia</div>
                  )}
                  <span className="absolute left-2 top-2 rounded-full bg-ut-navy px-2.5 py-1 text-xs font-black text-white">
                    Slide {index + 1}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-black text-ut-navy">{banner.title ?? "Hero Banner"}</h3>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{banner.storage_path}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-black ${banner.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {banner.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-black text-ut-navy hover:bg-section-blue">
                      <Replace className="size-3.5" aria-hidden="true" />
                      Replace
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/avif"
                        className="sr-only"
                        onChange={(event) => {
                          void replace(banner, event.target.files?.[0]);
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                    <Button type="button" variant="formOutline" size="form" onClick={() => void toggle(banner)}>
                      <Power className="size-3.5" aria-hidden="true" />
                      {banner.is_active ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                    <Button type="button" variant="formOutline" size="form" disabled={index === 0} onClick={() => void move(index, -1)}>
                      <ArrowUp className="size-3.5" aria-hidden="true" />
                      Naik
                    </Button>
                    <Button type="button" variant="formOutline" size="form" disabled={index === banners.length - 1} onClick={() => void move(index, 1)}>
                      <ArrowDown className="size-3.5" aria-hidden="true" />
                      Turun
                    </Button>
                    <Button type="button" variant="formOutline" size="form" onClick={() => void remove(banner)}>
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {banners.length > 1 ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-ut-navy px-4 py-3 text-xs font-bold text-white">
          <RefreshCw className="size-4 shrink-0" aria-hidden="true" />
          Mode slide aktif: banner aktif akan berganti otomatis di halaman Beranda.
        </div>
      ) : null}
    </AdminCard>
  );
}

function SectionEditor({
  section,
  index,
  total,
  siblings,
  onChanged,
}: {
  section: Section;
  index: number;
  total: number;
  siblings: Section[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(section);
  useEffect(() => setForm(section), [section]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("sections")
        .update({
          kind: form.kind,
          eyebrow: form.eyebrow,
          title: form.title,
          subtitle: form.subtitle,
          body: form.body,
          media_url: form.media_url,
          media_kind: form.media_kind,
          video_url: form.video_url,
          document_url: form.document_url,
          link_url: form.link_url,
          link_label: form.link_label,
          config: form.config as Record<string, string | number | boolean | null>,
          is_published: form.is_published,
        })
        .eq("id", section.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Section disimpan.");
      onChanged();
    },
    onError: () => toast.error("Gagal menyimpan section."),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("sections").delete().eq("id", section.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Section dihapus.");
      onChanged();
    },
    onError: () => toast.error("Gagal menghapus section."),
  });

  const move = useMutation({
    mutationFn: async (direction: -1 | 1) => {
      const target = siblings[index + direction];
      if (!target) return;
      await swapOrder(
        "sections",
        { id: section.id, order: section.sort_order },
        { id: target.id, order: target.sort_order },
      );
    },
    onSuccess: onChanged,
    onError: () => toast.error("Gagal mengubah urutan."),
  });

  const addItem = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("section_items").insert({
        section_id: section.id,
        sort_order: section.items.length + 1,
        title: "Isi Baru",
      });
      if (error) throw error;
    },
    onSuccess: onChanged,
    onError: () => toast.error("Gagal menambah isi."),
  });

  const setConfig = (key: string, value: string) => setForm({ ...form, config: { ...form.config, [key]: value } });

  return (
    <div className="rounded-xl border border-border bg-background">
      <div className="flex flex-wrap items-center gap-2 p-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ut-yellow text-sm font-black text-ut-navy">
          {index + 1}
        </span>
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-black text-ut-navy">{form.title || "(tanpa judul)"}</span>
            <span className="block text-xs font-bold text-muted-foreground">
              {sectionKinds.find((kind) => kind.value === form.kind)?.label ?? form.kind}
            </span>
          </span>
          <ChevronDown className={`size-4 shrink-0 text-ut-navy transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
        <div className="flex shrink-0 gap-1">
          <Button type="button" variant="formOutline" size="icon" aria-label="Naikkan urutan" disabled={index === 0} onClick={() => move.mutate(-1)}>
            <ArrowUp className="size-4" />
          </Button>
          <Button type="button" variant="formOutline" size="icon" aria-label="Turunkan urutan" disabled={index === total - 1} onClick={() => move.mutate(1)}>
            <ArrowDown className="size-4" />
          </Button>
        </div>
      </div>

      {open ? (
        <div className="space-y-4 border-t border-border p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Jenis section">
              <select className={inputClass} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                {sectionKinds.map((kind) => (
                  <option key={kind.value} value={kind.value}>
                    {kind.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Teks kecil di atas judul">
              <input className={inputClass} value={form.eyebrow ?? ""} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} />
            </Field>
            <Field label="Judul">
              <input className={inputClass} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Subjudul">
              <input className={inputClass} value={form.subtitle ?? ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </Field>
          </div>

          <Field label="Isi teks">
            <textarea className={textareaClass} value={form.body ?? ""} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <MediaPicker label="Gambar" value={form.media_url} onChange={(url) => setForm({ ...form, media_url: url })} />
            <MediaPicker label="Video (unggahan atau tautan YouTube)" kind="video" value={form.video_url} onChange={(url) => setForm({ ...form, video_url: url })} />
            <MediaPicker label="Dokumen" kind="document" value={form.document_url} onChange={(url) => setForm({ ...form, document_url: url })} />
            <Field label="Tautan tombol">
              <input className={inputClass} value={form.link_url ?? ""} onChange={(e) => setForm({ ...form, link_url: e.target.value })} />
            </Field>
            <Field label="Teks tombol">
              <input className={inputClass} value={form.link_label ?? ""} onChange={(e) => setForm({ ...form, link_label: e.target.value })} />
            </Field>
          </div>

          {form.kind === "form" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Teks tombol kirim">
                <input
                  className={inputClass}
                  value={String(form.config["submit_label"] ?? "")}
                  onChange={(e) => setConfig("submit_label", e.target.value)}
                />
              </Field>
              <Field label="Teks tombol bersihkan">
                <input
                  className={inputClass}
                  value={String(form.config["clear_label"] ?? "")}
                  onChange={(e) => setConfig("clear_label", e.target.value)}
                />
              </Field>
            </div>
          ) : null}

          <Toggle label="Tayang" checked={form.is_published} onChange={(v) => setForm({ ...form, is_published: v })} />

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="utYellow" size="form" onClick={() => save.mutate()} disabled={save.isPending}>
              <Save className="size-4" aria-hidden="true" />
              Simpan section
            </Button>
            <Button
              type="button"
              variant="formOutline"
              size="form"
              onClick={() => {
                if (confirm("Hapus section ini beserta isinya?")) remove.mutate();
              }}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Hapus section
            </Button>
          </div>

          <div className="rounded-xl bg-section-blue p-3">
            <h3 className="mb-3 text-sm font-black text-ut-navy">Isi di dalam section ({section.items.length})</h3>
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <ItemEditor
                  key={item.id}
                  item={item}
                  index={itemIndex}
                  total={section.items.length}
                  siblings={section.items}
                  onChanged={onChanged}
                />
              ))}
              <Button type="button" variant="formOutline" size="form" onClick={() => addItem.mutate()}>
                <Plus className="size-4" aria-hidden="true" />
                Tambah isi
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ItemEditor({
  item,
  index,
  total,
  siblings,
  onChanged,
}: {
  item: SectionItem;
  index: number;
  total: number;
  siblings: SectionItem[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(item);
  const [badgeText, setBadgeText] = useState((item.badges ?? []).join(", "));
  useEffect(() => {
    setForm(item);
    setBadgeText((item.badges ?? []).join(", "));
  }, [item]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("section_items")
        .update({
          title: form.title,
          subtitle: form.subtitle,
          body: form.body,
          icon: form.icon,
          badges: badgeText
            .split(",")
            .map((badge) => badge.trim())
            .filter(Boolean),
          media_url: form.media_url,
          video_url: form.video_url,
          document_url: form.document_url,
          link_url: form.link_url,
          link_label: form.link_label,
          is_published: form.is_published,
        })
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Isi disimpan.");
      onChanged();
    },
    onError: () => toast.error("Gagal menyimpan isi."),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("section_items").delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Isi dihapus.");
      onChanged();
    },
    onError: () => toast.error("Gagal menghapus isi."),
  });

  const move = useMutation({
    mutationFn: async (direction: -1 | 1) => {
      const target = siblings[index + direction];
      if (!target) return;
      await swapOrder(
        "section_items",
        { id: item.id, order: item.sort_order },
        { id: target.id, order: target.sort_order },
      );
    },
    onSuccess: onChanged,
    onError: () => toast.error("Gagal mengubah urutan."),
  });

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 p-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ut-blue text-xs font-black text-hero-foreground">
          {index + 1}
        </span>
        <button type="button" onClick={() => setOpen((v) => !v)} className="min-w-0 flex-1 truncate text-left text-sm font-bold text-ut-navy">
          {form.title || "(tanpa judul)"}
        </button>
        <div className="flex shrink-0 gap-1">
          <Button type="button" variant="formOutline" size="icon" aria-label="Naikkan urutan" disabled={index === 0} onClick={() => move.mutate(-1)}>
            <ArrowUp className="size-4" />
          </Button>
          <Button type="button" variant="formOutline" size="icon" aria-label="Turunkan urutan" disabled={index === total - 1} onClick={() => move.mutate(1)}>
            <ArrowDown className="size-4" />
          </Button>
        </div>
      </div>

      {open ? (
        <div className="space-y-4 border-t border-border p-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Judul">
              <input className={inputClass} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Subjudul / status">
              <input className={inputClass} value={form.subtitle ?? ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </Field>
            <Field label="Ikon">
              <select className={inputClass} value={form.icon ?? ""} onChange={(e) => setForm({ ...form, icon: e.target.value || null })}>
                <option value="">Tanpa ikon</option>
                {iconNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Badge (pisahkan dengan koma)">
              <input className={inputClass} value={badgeText} onChange={(e) => setBadgeText(e.target.value)} />
            </Field>
          </div>

          <Field label="Isi teks">
            <textarea className={textareaClass} value={form.body ?? ""} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <MediaPicker label="Gambar" value={form.media_url} onChange={(url) => setForm({ ...form, media_url: url })} />
            <MediaPicker label="Video" kind="video" value={form.video_url} onChange={(url) => setForm({ ...form, video_url: url })} />
            <MediaPicker label="Dokumen" kind="document" value={form.document_url} onChange={(url) => setForm({ ...form, document_url: url })} />
            <Field label="Tautan">
              <input className={inputClass} value={form.link_url ?? ""} onChange={(e) => setForm({ ...form, link_url: e.target.value })} />
            </Field>
          </div>

          <Toggle label="Tayang" checked={form.is_published} onChange={(v) => setForm({ ...form, is_published: v })} />

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="utYellow" size="form" onClick={() => save.mutate()} disabled={save.isPending}>
              <Save className="size-4" aria-hidden="true" />
              Simpan isi
            </Button>
            <Button
              type="button"
              variant="formOutline"
              size="form"
              onClick={() => {
                if (confirm("Hapus isi ini?")) remove.mutate();
              }}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Hapus
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-ut-navy">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-ut-blue" />
      {label}
    </label>
  );
}
