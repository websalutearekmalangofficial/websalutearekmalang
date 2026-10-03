import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Link2, Plus, Save, Trash2, Palette, ImagePlus, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminCard, Field, inputClass } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { fetchFooterAdmin, saveFooterAdmin, type FooterColumn, type FooterContent, type FooterItem } from "@/lib/footer";
import { supabase } from "@/integrations/supabase/client";
import { SITE_LOGO_SETTING_KEY } from "@/lib/site-settings";

export const Route = createFileRoute("/_authenticated/admin/pengaturan")({ component: FooterSettingsAdmin });

const emptyItem = (): FooterItem => ({
  id: "item-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
  label: "",
  href: "",
  icon: "",
  enabled: true,
});

const emptyColumn = (): FooterColumn => ({
  id: "column-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
  title: "Kolom Footer Baru",
  items: [],
  enabled: true,
});

function FooterSettingsAdmin() {
  const queryClient = useQueryClient();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [logoSaving, setLogoSaving] = useState(false);
  const logoInputId = "site-logo-upload";

  useEffect(() => {
    let mounted = true;
    const loadLogo = async () => {
      setLogoLoading(true);
      const { data, error } = await supabase.from("admin_settings").select("value").eq("key", SITE_LOGO_SETTING_KEY).maybeSingle();
      if (!mounted) return;
      if (error) toast.error("Logo belum dapat dimuat.");
      else setLogoUrl(data?.value?.trim() || null);
      const { data: pathData } = await supabase.from("admin_settings").select("value").eq("key", "site_logo_storage_path").maybeSingle();
      if (mounted) setLogoPath(pathData?.value?.trim() || null);
      setLogoLoading(false);
    };
    void loadLogo();
    return () => { mounted = false; };
  }, []);

  const saveLogo = async () => {
    if (!logoFile) return;
    if (!logoFile.type.startsWith("image/")) { toast.error("File logo harus berupa gambar."); return; }
    if (logoFile.size > 5 * 1024 * 1024) { toast.error("Ukuran logo maksimal 5 MB."); return; }
    setLogoSaving(true);
    try {
      const extension = logoFile.name.split(".").pop()?.toLowerCase() || "png";
      const path = `branding/logo-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("cms-media").upload(path, logoFile, { upsert: false, contentType: logoFile.type, cacheControl: "3600" });
      if (uploadError) throw uploadError;
      const { data: publicData } = supabase.storage.from("cms-media").getPublicUrl(path);
      const { data: userData } = await supabase.auth.getUser();
      const uploadedUrl = publicData.publicUrl;
      const { error: settingsError } = await supabase.from("admin_settings").upsert([
        { key: SITE_LOGO_SETTING_KEY, value: uploadedUrl, description: "Public website logo URL managed from Admin > Pengaturan", updated_by: userData.user?.id ?? null },
        { key: "site_logo_storage_path", value: path, description: "Storage path for the active public website logo", updated_by: userData.user?.id ?? null },
      ]);
      if (settingsError) { await supabase.storage.from("cms-media").remove([path]); throw settingsError; }
      if (logoPath && logoPath !== path) await supabase.storage.from("cms-media").remove([logoPath]);
      setLogoUrl(uploadedUrl); setLogoPath(path); setLogoFile(null);
      const input = document.getElementById(logoInputId) as HTMLInputElement | null;
      if (input) input.value = "";
      toast.success("Logo berhasil diunggah dan disinkronkan ke website.");
    } catch (error) {
      console.error(error); toast.error("Gagal menyimpan logo.");
    } finally { setLogoSaving(false); }
  };

  const removeLogo = async () => {
    setLogoSaving(true);
    try {
      if (logoPath) {
        const { error } = await supabase.storage.from("cms-media").remove([logoPath]);
        if (error) throw error;
      }
      const { error: settingsError } = await supabase.from("admin_settings").upsert([
        { key: SITE_LOGO_SETTING_KEY, value: "", description: "Public website logo URL managed from Admin > Pengaturan" },
        { key: "site_logo_storage_path", value: "", description: "Storage path for the active public website logo" },
      ]);
      if (settingsError) throw settingsError;
      setLogoUrl(null); setLogoPath(null); setLogoFile(null);
      toast.success("Logo dihapus dari website.");
    } catch (error) {
      console.error(error); toast.error("Gagal menghapus logo.");
    } finally { setLogoSaving(false); }
  };
  const [form, setForm] = useState<FooterContent | null>(null);
  const query = useQuery({ queryKey: ["footer-settings"], queryFn: fetchFooterAdmin });

  useEffect(() => { if (query.data) setForm(query.data); }, [query.data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!form) throw new Error("Konten footer belum siap.");
      await saveFooterAdmin(form);
    },
    onSuccess: async () => {
      toast.success("Footer berhasil disimpan.");
      await queryClient.invalidateQueries({ queryKey: ["footer-settings"] });
      await queryClient.invalidateQueries({ queryKey: ["public-footer"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Gagal menyimpan Footer."),
  });

  const content = form ?? query.data;
  if (!content) {
    return <AdminCard title="Footer Website" description="Kelola konten Footer yang tampil di halaman publik."><p className="text-sm text-muted-foreground">{query.isLoading ? "Memuat pengaturan Footer…" : "Pengaturan Footer belum dapat dimuat."}</p></AdminCard>;
  }

  // Fallback agar tidak error jika data address belum ada di database lama
  if (!content.address) {
    content.address = { text: "Mall Pelayanan Publik Merdeka Malang Lt. 3 (Ramayana Alun-Alun Kota Malang) Jl. Merdeka Timur No. 4 Malang.", enabled: true };
  }
  
  const update = (patch: Partial<FooterContent>) => setForm({ ...content, ...patch });
  const updateColumn = (columnId: string, patch: Partial<FooterColumn>) => update({ columns: content.columns.map((column) => column.id === columnId ? { ...column, ...patch } : column) });
  const updateItem = (columnId: string, itemId: string, patch: Partial<FooterItem>) => update({
    columns: content.columns.map((column) => column.id === columnId
      ? { ...column, items: column.items.map((item) => item.id === itemId ? { ...item, ...patch } : item) }
      : column),
  });

  const moveColumn = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= content.columns.length) return;
    const columns = [...content.columns];
    [columns[index], columns[target]] = [columns[target]!, columns[index]!];
    update({ columns });
  };

  const removeColumn = (columnId: string) => {
    if (!confirm("Hapus kolom Footer ini beserta semua item di dalamnya?")) return;
    update({ columns: content.columns.filter((column) => column.id !== columnId) });
  };

  return (
    <div className="space-y-5">
      <AdminCard
        title="Logo Website"
        description="Kelola logo utama yang tampil di header website. Logo disimpan di Supabase Storage dan URL aktif disinkronkan melalui admin_settings."
      >
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
            {logoLoading ? (
              <span className="text-sm font-semibold text-slate-500">Memuat logo…</span>
            ) : logoUrl ? (
              <img src={logoUrl} alt="Logo website aktif" className="max-h-32 max-w-full object-contain" />
            ) : (
              <div className="text-center text-slate-400">
                <ImagePlus className="mx-auto size-10" />
                <p className="mt-2 text-sm font-semibold">Belum ada logo</p>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center gap-3">
            <div className="flex flex-wrap gap-2">
              <label htmlFor={logoInputId} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:bg-slate-50">
                <Upload className="size-4" /> {logoUrl ? "Pilih Logo Pengganti" : "Pilih Logo"}
              </label>
              <input id={logoInputId} type="file" accept="image/*" className="sr-only" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} />
              {logoUrl ? (
                <Button type="button" variant="formOutline" className="h-10 rounded-full px-4" onClick={removeLogo} disabled={logoSaving}>
                  <X className="size-4" /> Remove Logo
                </Button>
              ) : null}
              {logoFile ? (
                <Button type="button" variant="utYellow" className="h-10 rounded-full px-4" onClick={saveLogo} disabled={logoSaving}>
                  <Save className="size-4" /> {logoSaving ? "Menyimpan…" : "Upload & Simpan"}
                </Button>
              ) : null}
            </div>
            <p className="text-xs font-medium text-slate-500">
              Format gambar: JPG, JPEG, PNG, WebP, SVG, dan format image browser lainnya. Maksimal 5 MB.
              {logoFile ? ` File dipilih: ${logoFile.name}` : ""}
            </p>
            <p className="text-xs text-slate-400">Replace akan otomatis menghapus file logo lama setelah logo baru berhasil tersimpan.</p>
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Footer Website" description="Semua perubahan di sini tersimpan ke Supabase dan otomatis menjadi sumber konten Footer di website.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Label layanan kontak"><input className={inputClass} value={content.contact.label} onChange={(e) => update({ contact: { ...content.contact, label: e.target.value } })} /></Field>
          <Field label="Nomor telepon"><input className={inputClass} value={content.contact.phone} onChange={(e) => {
            const phone = e.target.value;
            const digits = phone.replace(/[^0-9+]/g, "");
            update({ contact: { ...content.contact, phone, phone_href: "tel:" + digits } });
          }} /></Field>
          <Field label="Link telepon"><input className={inputClass} value={content.contact.phone_href} onChange={(e) => update({ contact: { ...content.contact, phone_href: e.target.value } })} /></Field>
          <div className="flex items-end"><label className="inline-flex items-center gap-2 text-sm font-bold text-ut-navy"><input type="checkbox" checked={content.contact.enabled} onChange={(e) => update({ contact: { ...content.contact, enabled: e.target.checked } })} />Tampilkan informasi kontak</label></div>
          
          <Field label="Slogan baris pertama"><input className={inputClass} value={content.slogan.line1} onChange={(e) => update({ slogan: { ...content.slogan, line1: e.target.value } })} /></Field>
          <Field label="Slogan baris kedua"><input className={inputClass} value={content.slogan.line2} onChange={(e) => update({ slogan: { ...content.slogan, line2: e.target.value } })} /></Field>
          <div className="md:col-span-2"><label className="inline-flex items-center gap-2 text-sm font-bold text-ut-navy"><input type="checkbox" checked={content.slogan.enabled} onChange={(e) => update({ slogan: { ...content.slogan, enabled: e.target.checked } })} />Tampilkan slogan</label></div>

          {/* === BAGIAN INPUT ALAMAT FISIK === */}
          <div className="md:col-span-2 mt-4">
            <Field label="Teks Alamat Fisik">
              <textarea 
                className={inputClass + " min-h-[80px] resize-y py-2"} 
                value={content.address.text} 
                onChange={(e) => update({ address: { ...content.address, text: e.target.value } })} 
                placeholder="Contoh: Jl. Merdeka Timur No. 4 Malang..."
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm font-bold text-ut-navy">
              <input type="checkbox" checked={content.address.enabled} onChange={(e) => update({ address: { ...content.address, enabled: e.target.checked } })} />
              Tampilkan alamat fisik
            </label>
          </div>

          <div className="md:col-span-2 mt-2 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-black text-ut-navy">
                  <Link2 className="size-4" /> Layout 2 Kolom Footer
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Atur tinggi dan posisi vertikal masing-masing kolom: Layanan Informasi Pendaftaran dan Alamat Kantor.
                </p>
              </div>
              <label className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ut-navy/10 bg-slate-50 px-4 py-2 text-sm font-bold text-ut-navy">
                <input
                  type="checkbox"
                  checked={content.layout.sync_columns}
                  onChange={(e) => update({
                    layout: { ...content.layout, sync_columns: e.target.checked },
                  })}
                />
                <Link2 className="size-4" />
                Sync / Lock / Rantai
              </label>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {([
                ["contact", "Layanan Informasi Pendaftaran"],
                ["address", "Alamat Kantor"],
              ] as const).map(([key, label]) => (
                <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-sm font-black text-ut-navy">{label}</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <Field label="Tinggi kolom (px)">
                      <input
                        className={inputClass}
                        type="number"
                        min={160}
                        max={800}
                        step={10}
                        value={content.layout.columns[key].height}
                        onChange={(e) => {
                          const height = Math.min(800, Math.max(160, Number(e.target.value) || 160));
                          const columns = content.layout.sync_columns
                            ? {
                                contact: { ...content.layout.columns.contact, height },
                                address: { ...content.layout.columns.address, height },
                                }
                            : {
                                ...content.layout.columns,
                                [key]: { ...content.layout.columns[key], height },
                              };
                          update({ layout: { ...content.layout, columns } });
                        }}
                      />
                    </Field>
                    <Field label="Alignment vertikal">
                      <select
                        className={inputClass}
                        value={content.layout.columns[key].alignment}
                        onChange={(e) => {
                          const alignment = e.target.value as FooterContent["layout"]["columns"]["contact"]["alignment"];
                          const columns = content.layout.sync_columns
                            ? {
                                contact: { ...content.layout.columns.contact, alignment },
                                address: { ...content.layout.columns.address, alignment },
                              }
                            : {
                                ...content.layout.columns,
                                [key]: { ...content.layout.columns[key], alignment },
                              };
                          update({ layout: { ...content.layout, columns } });
                        }}
                      >
                        <option value="start">Atas</option>
                        <option value="center">Tengah</option>
                        <option value="end">Bawah</option>
                      </select>
                    </Field>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600">
              <b>Mode Sync aktif:</b> ubah tinggi atau alignment pada satu kolom → dua kolom lainnya otomatis mengikuti nilai yang sama. Matikan Sync untuk mengatur setiap kolom secara independen.
            </div>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <Field label="Warna Background Footer">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    aria-label="Pilih warna background Footer"
                    className="h-11 w-16 cursor-pointer rounded-lg border border-border bg-white p-1"
                    value={content.layout.background_color}
                    onChange={(e) => update({ layout: { ...content.layout, background_color: e.target.value } })}
                  />
                  <input
                    className={inputClass + " max-w-[180px]"}
                    value={content.layout.background_color}
                    onChange={(e) => update({ layout: { ...content.layout, background_color: e.target.value } })}
                    placeholder="#a7c8e1"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Palette className="size-4" />
                  Warna ini diterapkan ke seluruh area Footer dan Copyright setelah disimpan.
                </div>
              </div>
            </Field>
          </div>
          {/* ================================ */}

        </div>
        <div className="mt-5 flex justify-end"><Button type="button" variant="utYellow" size="form" onClick={() => save.mutate()} disabled={save.isPending}><Save className="size-4" />{save.isPending ? "Menyimpan…" : "Simpan Footer"}</Button></div>
      </AdminCard>

      <AdminCard title="Kolom & Item Footer" description="Tambahkan beberapa kolom dan item link. Urutan kolom mengikuti urutan tampil di Footer.">
        <div className="space-y-4">
          {content.columns.map((column, columnIndex) => (
            <section key={column.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-center gap-2">
                <input className={inputClass + " min-w-[220px] flex-1 font-black"} value={column.title} onChange={(e) => updateColumn(column.id, { title: e.target.value })} placeholder="Judul kolom" />
                <Button type="button" variant="formOutline" className="h-10 w-10 rounded-full p-0" disabled={columnIndex === 0} onClick={() => moveColumn(columnIndex, -1)} aria-label="Naikkan kolom"><ArrowUp className="size-4" /></Button>
                <Button type="button" variant="formOutline" className="h-10 w-10 rounded-full p-0" disabled={columnIndex === content.columns.length - 1} onClick={() => moveColumn(columnIndex, 1)} aria-label="Turunkan kolom"><ArrowDown className="size-4" /></Button>
                <Button type="button" variant="formOutline" className="h-10 rounded-full px-3" onClick={() => removeColumn(column.id)}><Trash2 className="size-4" /> Hapus kolom</Button>
                <label className="inline-flex items-center gap-2 text-sm font-bold text-ut-navy"><input type="checkbox" checked={column.enabled} onChange={(e) => updateColumn(column.id, { enabled: e.target.checked })} />Aktif</label>
              </div>
              <div className="mt-4 space-y-3">
                {column.items.map((item) => (
                  <div key={item.id} className="grid gap-3 rounded-xl border border-border p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                    <Field label="Label"><input className={inputClass} value={item.label} onChange={(e) => updateItem(column.id, item.id, { label: e.target.value })} placeholder="Contoh: Informasi Pendaftaran" /></Field>
                    <Field label="Tautan"><input className={inputClass} value={item.href} onChange={(e) => updateItem(column.id, item.id, { href: e.target.value })} placeholder="/daftar atau https://..." /></Field>
                    <div className="flex items-end gap-2">
                      <label className="inline-flex h-10 items-center gap-2 text-xs font-bold text-ut-navy"><input type="checkbox" checked={item.enabled} onChange={(e) => updateItem(column.id, item.id, { enabled: e.target.checked })} />Aktif</label>
                      <Button type="button" variant="formOutline" className="h-10 w-10 rounded-full p-0" onClick={() => updateColumn(column.id, { items: column.items.filter((entry) => entry.id !== item.id) })} aria-label="Hapus item"><Trash2 className="size-4" /></Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="formOutline" size="form" onClick={() => updateColumn(column.id, { items: [...column.items, emptyItem()] })}><Plus className="size-4" /> Tambah item</Button>
              </div>
            </section>
          ))}
          {content.columns.length === 0 ? <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Belum ada kolom Footer. Tambahkan kolom pertama lalu isi beberapa item.</div> : null}
          <Button type="button" variant="utYellow" size="form" onClick={() => update({ columns: [...content.columns, emptyColumn()] })}><Plus className="size-4" /> Tambah kolom Footer</Button>
          <div className="rounded-xl bg-section-blue p-4 text-sm text-muted-foreground"><div className="flex items-center gap-2 font-black text-ut-navy"><Link2 className="size-4" /> Contoh item</div><p className="mt-1">Tentang SALUT → /tentang · Pendaftaran → /daftar · Instagram → tautan eksternal</p></div>
        </div>
        <div className="mt-5 flex justify-end"><Button type="button" variant="utYellow" size="form" onClick={() => save.mutate()} disabled={save.isPending}><Save className="size-4" />{save.isPending ? "Menyimpan…" : "Simpan Kolom & Item"}</Button></div>
      </AdminCard>
    </div>
  );
}
