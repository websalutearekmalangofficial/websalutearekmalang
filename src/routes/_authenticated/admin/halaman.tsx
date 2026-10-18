import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, ImagePlus, Plus, Power, RefreshCw, Replace, Save, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminCard, Field, inputClass, textareaClass } from "@/components/admin/field";
import { MediaPicker } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fetchPages, fetchSections, swapOrder, uploadMedia } from "@/lib/admin-cms";
import { deleteHeroBanner, fetchHeroBanners, moveHeroBanner, replaceHeroBanner, setHeroBannerActive, uploadHeroBanner, type HeroBanner } from "@/lib/hero-banners";
import { iconNames, sectionKinds, type PageRecord, type Section, type SectionItem } from "@/lib/cms";

export const Route = createFileRoute("/_authenticated/admin/halaman")({
  component: PagesAdmin,
});

function PagesAdmin() {
  const queryClient = useQueryClient();
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [pageSearch, setPageSearch] = useState("");
  const [pagePickerOpen, setPagePickerOpen] = useState(false);

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

  const [addSectionOpen, setAddSectionOpen] = useState(false);

  const addSection = useMutation({
    mutationFn: async ({ kind, title, isPublished }: { kind: string; title: string; isPublished: boolean }) => {
      if (!selectedPageId) throw new Error("Pilih halaman terlebih dahulu.");
      const nextOrder = (sectionsQuery.data?.length ?? 0) + 1;
      const { data, error } = await supabase
        .from("sections")
        .insert({
          page_id: selectedPageId,
          kind,
          sort_order: nextOrder,
          title: title.trim() || "Section Baru",
          is_published: isPublished,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Section baru berhasil ditambahkan.");
      setAddSectionOpen(false);
      refreshSections();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Gagal menambah section.");
    },
  });

  const selectedPage = pages.find((page) => page.id === selectedPageId) ?? null;
  const sections = sectionsQuery.data ?? [];
  const heroSection = sections.find((section) => section.kind === "hero") ?? null;
  const contentSections = sections.filter((section) => section.kind !== "hero");

  return (
    <>
      <AdminCard title="Daftar Halaman" description="Pilih halaman untuk mengelola section di dalamnya.">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="relative min-w-0 flex-1">
            <label htmlFor="admin-page-search" className="mb-1.5 block text-xs font-black uppercase tracking-wide text-ut-navy">
              Pilih halaman
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id="admin-page-search"
                type="text"
                value={pagePickerOpen ? pageSearch : (pages.find((page) => page.id === selectedPageId)?.title ?? "")}
                onFocus={() => {
                  setPagePickerOpen(true);
                  setPageSearch("");
                }}
                onChange={(event) => {
                  setPageSearch(event.target.value);
                  setPagePickerOpen(true);
                }}
                placeholder="Ketik untuk mencari halaman..."
                autoComplete="off"
                className={`${inputClass} pl-10 pr-10`}
                role="combobox"
                aria-expanded={pagePickerOpen}
                aria-controls="admin-page-options"
                aria-autocomplete="list"
              />
              <ChevronDown
                className={`pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ut-navy transition ${pagePickerOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </div>

            {pagePickerOpen ? (
              <div
                id="admin-page-options"
                className="absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-lg"
                role="listbox"
              >
                {pages
                  .filter((page) => {
                    const query = pageSearch.trim().toLowerCase();
                    if (!query) return true;
                    return [page.title, page.slug, page.nav_label ?? ""].some((value) =>
                      value.toLowerCase().includes(query),
                    );
                  })
                  .map((page) => (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => {
                        setSelectedPageId(page.id);
                        setPageSearch("");
                        setPagePickerOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-bold transition hover:bg-section-blue ${page.id === selectedPageId ? "bg-ut-yellow/20 text-ut-navy" : "text-ut-navy"}`}
                      role="option"
                      aria-selected={page.id === selectedPageId}
                    >
                      <span className="min-w-0">
                        <span className="block truncate">{page.title}</span>
                        <span className="block truncate text-xs font-medium text-muted-foreground">{page.slug}</span>
                      </span>
                      {page.is_published ? (
                        <Eye className="size-4 shrink-0 text-emerald-600" aria-label="Tayang" />
                      ) : (
                        <EyeOff className="size-4 shrink-0 text-muted-foreground" aria-label="Tidak tayang" />
                      )}
                    </button>
                  ))}
                {pages.filter((page) => {
                  const query = pageSearch.trim().toLowerCase();
                  if (!query) return true;
                  return [page.title, page.slug, page.nav_label ?? ""].some((value) =>
                    value.toLowerCase().includes(query),
                  );
                }).length === 0 ? (
                  <p className="px-3 py-4 text-center text-sm text-muted-foreground">Halaman tidak ditemukan.</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="formOutline" className="h-10 rounded-full px-4" onClick={() => addPage.mutate()}>
              <Plus className="size-4" aria-hidden="true" />
              Halaman baru
            </Button>
          </div>
        </div>

        {selectedPage ? <PageForm page={selectedPage} onSaved={refreshPages} /> : null}

      </AdminCard>

      {selectedPage?.slug === "beranda" ? (
        <HeroBannerManager pageId={selectedPage.id} sectionId={heroSection?.id ?? null} />
      ) : null}

      {selectedPage?.slug === "kemahasiswaan" ? (
        <AdminCard
          title="Hero Banner Kemahasiswaan"
          description="Gambar, judul, subjudul, dan teks hero halaman Kemahasiswaan disimpan pada section hero di database. Upload atau pilih gambar, lalu simpan section untuk menerapkan perubahan ke halaman publik."
        >
          {heroSection ? (
            <SectionEditor
              key={heroSection.id}
              section={heroSection}
              index={0}
              total={1}
              siblings={[heroSection]}
              onChanged={refreshSections}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Section hero belum tersedia. Muat ulang halaman setelah section dibuat.</p>
          )}
        </AdminCard>
      ) : null}

      <AdminCard
        title="Section di Halaman Ini"
        description="Kelola section konten halaman. Pengaturan Hero Banner Beranda dan Hero Banner Kemahasiswaan dipisahkan di bagian khusus di atas."
      >
        <div className="space-y-3">
          {contentSections.map((section, index) => (
            <SectionEditor
              key={section.id}
              section={section}
              index={index}
              total={contentSections.length}
              siblings={contentSections}
              onChanged={refreshSections}
            />
          ))}
          {contentSections.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada section di halaman ini.</p>
          ) : null}
          <Button
            type="button"
            variant="utYellow"
            size="form"
            onClick={() => setAddSectionOpen(true)}
            disabled={!selectedPageId || addSection.isPending}
          >
            <Plus className="size-4" aria-hidden="true" />
            Tambah section
          </Button>
        </div>
      </AdminCard>

      {addSectionOpen && selectedPage ? (
        <AddSectionDialog
          pageTitle={selectedPage.title}
          pending={addSection.isPending}
          onClose={() => setAddSectionOpen(false)}
          onSubmit={(kind, title, isPublished) => addSection.mutate({ kind, title, isPublished })}
        />
      ) : null}
    </>
  );
}

function AddSectionDialog({
  pageTitle,
  pending,
  onClose,
  onSubmit,
}: {
  pageTitle: string;
  pending: boolean;
  onClose: () => void;
  onSubmit: (kind: string, title: string, isPublished: boolean) => void;
}) {
  const [kind, setKind] = useState<string>("richtext");
  const [title, setTitle] = useState("Section Baru");
  const [isPublished, setIsPublished] = useState(false);

  const submit = () => {
    if (pending) return;
    onSubmit(kind, title, isPublished);
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Tambah Section"
    >
      <div className="w-full max-w-lg rounded-2xl bg-card p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="add-section-title" className="text-lg font-black text-ut-navy">Tambah Section</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tambahkan section baru ke halaman “{pageTitle}”.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-full px-2 py-1 text-xl leading-none text-muted-foreground hover:bg-muted"
            aria-label="Tutup"
          >
            ×
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <Field label="Jenis section">
            <select
              autoFocus
              className={inputClass}
              value={kind}
              onChange={(event) => setKind(event.target.value)}
              disabled={pending}
            >
              {sectionKinds.map((sectionKind) => (
                <option key={sectionKind.value} value={sectionKind.value}>
                  {sectionKind.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Judul section">
            <input
              className={inputClass}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Contoh: Keunggulan Salute Arek Malang"
              disabled={pending}
            />
          </Field>

          <Toggle label="Tayang di halaman" checked={isPublished} onChange={setIsPublished} />

          <div className="rounded-xl bg-section-blue p-3 text-xs leading-5 text-muted-foreground">
            Setelah dibuat, section dapat dibuka untuk mengatur isi, gambar, video, tombol, konfigurasi, dan item-item di dalamnya.
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="formOutline" size="form" onClick={onClose} disabled={pending}>
            Batal
          </Button>
          <Button
            type="button"
            variant="utYellow"
            size="form"
            onClick={submit}
            disabled={pending}
          >
            <Plus className="size-4" aria-hidden="true" />
            {pending ? "Menambahkan..." : "Tambah Section"}
          </Button>
        </div>
      </div>
    </div>
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
  const [processDetails, setProcessDetails] = useState(String(section.config?.details ?? ""));
  const sectionKind = form.kind;

  useEffect(() => {
    setForm(section);
    setProcessDetails(String(section.config?.details ?? ""));
  }, [section]);

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
          config: sectionKind === "process"
            ? { ...(form.config ?? {}), details: processDetails.trim() }
            : form.config as Record<string, string | number | boolean | null>,
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

          {sectionKind === "process" ? (
            <Field label="Detail langkah (satu poin per baris)">
              <textarea
                className={textareaClass}
                value={processDetails}
                onChange={(e) => setProcessDetails(e.target.value)}
                placeholder="Contoh: Lengkapi data diri\nSiapkan dokumen\nTunggu verifikasi admin"
              />
            </Field>
          ) : null}

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

          {form.kind === "contact_banner" ? (
            <div className="rounded-xl border border-ut-sky/30 bg-section-blue p-4">
              <p className="mb-3 text-sm font-black text-ut-navy">Pengaturan Kontak & Lokasi</p>
              <p className="mb-4 text-xs leading-5 text-muted-foreground">
                Data ini dapat digunakan langsung untuk Banner Kontak di homepage dan section Kontak & Lokasi di halaman Profile.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nomor WhatsApp">
                  <input
                    className={inputClass}
                    value={String(form.config["whatsapp"] ?? "")}
                    onChange={(e) => setConfig("whatsapp", e.target.value)}
                    placeholder="0812-3002-4264"
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    className={inputClass}
                    value={String(form.config["email"] ?? "")}
                    onChange={(e) => setConfig("email", e.target.value)}
                    placeholder="admin@salutarekmalang.com"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Alamat">
                    <textarea
                      className={textareaClass}
                      value={String(form.config["address"] ?? "")}
                      onChange={(e) => setConfig("address", e.target.value)}
                      placeholder="Masukkan alamat lengkap"
                    />
                  </Field>
                </div>
              </div>
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
                  sectionKind={section.kind}
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

function ItemEditor(props: {
  sectionKind: string;
  item: SectionItem;
  index: number;
  total: number;
  siblings: SectionItem[];
  onChanged: () => void;
}) {
  if (props.sectionKind === "testimonials") {
    return <TestimonialItemEditor {...props} />;
  }

  if (props.sectionKind === "payment_methods") {
    return <PaymentLogoItemEditor {...props} />;
  }

  if (props.sectionKind === "scholarships") {
    return <ScholarshipItemEditor {...props} />;
  }

  return <GenericItemEditor {...props} />;
}

function GenericItemEditor({
  sectionKind,
  item,
  index,
  total,
  siblings,
  onChanged,
}: {
  sectionKind: string;
  item: SectionItem;
  index: number;
  total: number;
  siblings: SectionItem[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(item);
  const [badgeText, setBadgeText] = useState((item.badges ?? []).join(", "));
  const [processDetails, setProcessDetails] = useState(String(item.config?.details ?? ""));
  useEffect(() => {
    setForm(item);
    setBadgeText((item.badges ?? []).join(", "));
    setProcessDetails(String(item.config?.details ?? ""));
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
          config: form.config as Record<string, string | number | boolean | null>,
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

function ScholarshipItemEditor({
  item, index, total, siblings, onChanged,
}: {
  item: SectionItem;
  index: number;
  total: number;
  siblings: SectionItem[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(item);
  const [requirements, setRequirements] = useState(String(item.config?.requirements ?? ""));
  const [benefits, setBenefits] = useState(String(item.config?.benefits ?? ""));

  useEffect(() => {
    setForm(item);
    setRequirements(String(item.config?.requirements ?? ""));
    setBenefits(String(item.config?.benefits ?? ""));
  }, [item]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("section_items").update({
        title: form.title?.trim() || null,
        body: form.body?.trim() || null,
        link_url: form.link_url?.trim() || "/daftar",
        link_label: form.link_label?.trim() || "Mendaftar Beasiswa",
        config: {
          ...(form.config ?? {}),
          requirements: requirements.trim(),
          benefits: benefits.trim(),
        },
        is_published: form.is_published,
      }).eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Beasiswa disimpan."); onChanged(); },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Gagal menyimpan beasiswa."),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("section_items").delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Beasiswa dihapus."); onChanged(); },
    onError: () => toast.error("Gagal menghapus beasiswa."),
  });

  const move = useMutation({
    mutationFn: async (direction: -1 | 1) => {
      const target = siblings[index + direction];
      if (!target) return;
      await swapOrder("section_items", { id: item.id, order: item.sort_order }, { id: target.id, order: target.sort_order });
    },
    onSuccess: onChanged,
    onError: () => toast.error("Gagal mengubah urutan beasiswa."),
  });

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 p-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ut-blue text-xs font-black text-hero-foreground">{index + 1}</span>
        <button type="button" onClick={() => setOpen((v) => !v)} className="min-w-0 flex-1 truncate text-left text-sm font-bold text-ut-navy">
          {form.title || "(tanpa nama beasiswa)"}
        </button>
        <div className="flex shrink-0 gap-1">
          <Button type="button" variant="formOutline" size="icon" aria-label="Naikkan urutan" disabled={index === 0} onClick={() => move.mutate(-1)}><ArrowUp className="size-4" /></Button>
          <Button type="button" variant="formOutline" size="icon" aria-label="Turunkan urutan" disabled={index === total - 1} onClick={() => move.mutate(1)}><ArrowDown className="size-4" /></Button>
        </div>
      </div>
      {open ? (
        <div className="space-y-4 border-t border-border p-4">
          <Field label="Nama Beasiswa"><input className={inputClass} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Deskripsi Beasiswa"><textarea className={textareaClass} value={form.body ?? ""} onChange={(e) => setForm({ ...form, body: e.target.value })} /></Field>
          <Field label="Persyaratan (satu item per baris)"><textarea className={textareaClass} value={requirements} onChange={(e) => setRequirements(e.target.value)} /></Field>
          <Field label="Benefit (satu item per baris)"><textarea className={textareaClass} value={benefits} onChange={(e) => setBenefits(e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Link Pendaftaran"><input className={inputClass} value={form.link_url ?? "/daftar"} onChange={(e) => setForm({ ...form, link_url: e.target.value })} /></Field>
            <Field label="Teks Tombol"><input className={inputClass} value={form.link_label ?? "Mendaftar Beasiswa"} onChange={(e) => setForm({ ...form, link_label: e.target.value })} /></Field>
          </div>
          <Toggle label="Tayang" checked={form.is_published} onChange={(v) => setForm({ ...form, is_published: v })} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="utYellow" size="form" onClick={() => save.mutate()} disabled={save.isPending}><Save className="size-4" />Simpan Beasiswa</Button>
            <Button type="button" variant="formOutline" size="form" onClick={() => { if (confirm("Hapus beasiswa ini?")) remove.mutate(); }}><Trash2 className="size-4" />Hapus</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PaymentLogoItemEditor({
  item, index, total, siblings, onChanged,
}: {
  item: SectionItem;
  index: number;
  total: number;
  siblings: SectionItem[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(item);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(item);
  }, [item]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("section_items").update({
        title: form.title?.trim() || null,
        media_url: form.media_url || null,
        config: { ...(form.config ?? {}), role: "payment_logo" },
        is_published: form.is_published,
      }).eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Logo pembayaran disimpan."); onChanged(); },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Gagal menyimpan logo pembayaran."),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("section_items").delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Logo pembayaran dihapus."); onChanged(); },
    onError: () => toast.error("Gagal menghapus logo pembayaran."),
  });

  const move = useMutation({
    mutationFn: async (direction: -1 | 1) => {
      const target = siblings[index + direction];
      if (!target) return;
      await swapOrder("section_items", { id: item.id, order: item.sort_order }, { id: target.id, order: target.sort_order });
    },
    onSuccess: onChanged,
    onError: () => toast.error("Gagal mengubah urutan logo."),
  });

  const uploadImage = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File logo harus berupa gambar.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran logo maksimal 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadMedia(file, "Logo Pembayaran - " + (form.title || file.name));
      setForm((current) => ({ ...current, media_url: url }));
      toast.success("Logo berhasil diunggah ke Media. Klik Simpan Logo untuk menerapkannya.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengunggah logo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 p-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ut-blue text-xs font-black text-hero-foreground">{index + 1}</span>
        <button type="button" onClick={() => setOpen((v) => !v)} className="min-w-0 flex-1 truncate text-left text-sm font-bold text-ut-navy">
          {form.title || "Logo Pembayaran"}
        </button>
        <div className="flex shrink-0 gap-1">
          <Button type="button" variant="formOutline" size="icon" aria-label="Naikkan urutan" disabled={index === 0} onClick={() => move.mutate(-1)}><ArrowUp className="size-4" /></Button>
          <Button type="button" variant="formOutline" size="icon" aria-label="Turunkan urutan" disabled={index === total - 1} onClick={() => move.mutate(1)}><ArrowDown className="size-4" /></Button>
        </div>
      </div>
      {open ? (
        <div className="space-y-4 border-t border-border p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama logo / metode pembayaran">
              <input className={inputClass} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Contoh: Bank Mandiri" />
            </Field>
            <Field label="Status">
              <Toggle label="Tayang di homepage" checked={form.is_published} onChange={(v) => setForm({ ...form, is_published: v })} />
            </Field>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-black uppercase tracking-wide text-ut-navy">Logo pembayaran</span>
            <div className="rounded-xl border border-dashed border-border bg-section-blue p-3">
              <div className="flex flex-wrap items-center gap-3">
                {form.media_url ? (
                  <div className="flex h-24 w-40 items-center justify-center rounded-lg border border-border bg-white p-3">
                    <img src={form.media_url} alt={form.title || "Logo pembayaran"} className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="grid h-24 w-40 place-items-center rounded-lg border border-border bg-white text-xs font-bold text-muted-foreground">Belum ada logo</div>
                )}
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-ut-yellow px-4 py-2.5 text-sm font-black text-ut-navy shadow-yellow transition hover:-translate-y-0.5">
                    <ImagePlus className="size-4" />
                    {uploading ? "Mengunggah..." : "Upload Logo Langsung"}
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" className="sr-only" disabled={uploading} onChange={(e) => { void uploadImage(e.target.files?.[0]); e.currentTarget.value = ""; }} />
                  </label>
                  {form.media_url ? <Button type="button" variant="formOutline" size="form" onClick={() => setForm({ ...form, media_url: null })}>Hapus Logo</Button> : null}
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Upload langsung akan otomatis masuk ke Media dan dapat dipilih kembali dari perpustakaan media.</p>
            </div>
          </div>

          <MediaPicker label="Pilih dari Media" value={form.media_url} onChange={(url) => setForm({ ...form, media_url: url })} />

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="utYellow" size="form" onClick={() => save.mutate()} disabled={save.isPending || uploading}><Save className="size-4" />Simpan Logo</Button>
            <Button type="button" variant="formOutline" size="form" onClick={() => { if (confirm("Hapus logo pembayaran ini?")) remove.mutate(); }}><Trash2 className="size-4" />Hapus</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TestimonialItemEditor({
  item, index, total, siblings, onChanged,
}: {
  item: SectionItem;
  index: number;
  total: number;
  siblings: SectionItem[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(item);
  const [role, setRole] = useState(String(item.config?.role ?? item.subtitle ?? ""));
  const [degree, setDegree] = useState(String(item.config?.degree ?? ""));
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(item);
    setRole(String(item.config?.role ?? item.subtitle ?? ""));
    setDegree(String(item.config?.degree ?? ""));
  }, [item]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("section_items").update({
        title: form.title?.trim() || null,
        subtitle: role.trim() || null,
        body: form.body?.trim() || null,
        media_url: form.media_url || null,
        config: { ...(form.config ?? {}), role: role.trim(), degree: degree.trim() },
        is_published: form.is_published,
      }).eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Testimoni disimpan."); onChanged(); },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Gagal menyimpan testimoni."),
  });

  const move = useMutation({
    mutationFn: async (direction: -1 | 1) => {
      const target = siblings[index + direction];
      if (!target) return;
      await swapOrder("section_items", { id: item.id, order: item.sort_order }, { id: target.id, order: target.sort_order });
    },
    onSuccess: onChanged,
    onError: () => toast.error("Gagal mengubah urutan."),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("section_items").delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Testimoni dihapus."); onChanged(); },
    onError: () => toast.error("Gagal menghapus testimoni."),
  });

  const uploadImage = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file, "Testimoni - " + (form.title || file.name));
      setForm((current) => ({ ...current, media_url: url }));
      toast.success("Foto testimoni berhasil diunggah.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengunggah foto.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 p-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ut-blue text-xs font-black text-hero-foreground">{index + 1}</span>
        <button type="button" onClick={() => setOpen((v) => !v)} className="min-w-0 flex-1 truncate text-left text-sm font-bold text-ut-navy">{form.title || "(tanpa nama)"}</button>
        <div className="flex shrink-0 gap-1">
          <Button type="button" variant="formOutline" size="icon" disabled={index === 0} onClick={() => move.mutate(-1)}><ArrowUp className="size-4" /></Button>
          <Button type="button" variant="formOutline" size="icon" disabled={index === total - 1} onClick={() => move.mutate(1)}><ArrowDown className="size-4" /></Button>
        </div>
      </div>
      {open ? (
        <div className="space-y-4 border-t border-border p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama"><input className={inputClass} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nama lengkap" /></Field>
            <Field label="Jabatan / Profesi"><input className={inputClass} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Contoh: Mahasiswa Aktif / Alumni / Karyawan" /></Field>
            <Field label="Gelar"><input className={inputClass} value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="Contoh: S.E., S.Pd., M.M." /></Field>
          </div>
          <Field label="Teks Testimoni"><textarea className={textareaClass} value={form.body ?? ""} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Tulis pengalaman/testimoni..." /></Field>
          <div className="space-y-2">
            <span className="block text-xs font-black uppercase tracking-wide text-ut-navy">Foto Testimoni</span>
            <div className="flex flex-wrap items-center gap-3">
              {form.media_url ? <img src={form.media_url} alt="Pratinjau testimoni" className="size-20 rounded-full object-cover border border-border" /> : <div className="grid size-20 place-items-center rounded-full bg-section-blue text-xs font-bold text-muted-foreground">Tanpa foto</div>}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-ut-yellow px-4 py-2.5 text-sm font-black text-ut-navy shadow-yellow">
                <ImagePlus className="size-4" />{uploading ? "Mengunggah..." : "Upload Image"}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" className="sr-only" disabled={uploading} onChange={(e) => { void uploadImage(e.target.files?.[0]); e.currentTarget.value = ""; }} />
              </label>
              {form.media_url ? <Button type="button" variant="formOutline" size="form" onClick={() => setForm({ ...form, media_url: null })}>Hapus Foto</Button> : null}
            </div>
          </div>
          <Toggle label="Tayang di homepage" checked={form.is_published} onChange={(v) => setForm({ ...form, is_published: v })} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="utYellow" size="form" onClick={() => save.mutate()} disabled={save.isPending}><Save className="size-4" />Simpan Testimoni</Button>
            <Button type="button" variant="formOutline" size="form" onClick={() => { if (confirm("Hapus testimoni ini?")) remove.mutate(); }}><Trash2 className="size-4" />Hapus</Button>
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
