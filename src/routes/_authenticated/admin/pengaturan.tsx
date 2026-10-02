import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Link2, Plus, Save, Trash2, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminCard, Field, inputClass } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { fetchFooterAdmin, saveFooterAdmin, type FooterColumn, type FooterContent, type FooterItem } from "@/lib/footer";

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
  
  // Fallback untuk image url jika tidak ada
  if (content.building_image_url === undefined) {
    content.building_image_url = "";
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
              Tampilkan alamat fisik & Gambar Gedung
            </label>
          </div>

          {/* === BAGIAN INPUT GAMBAR GEDUNG === */}
          <div className="md:col-span-2 mt-2">
            <Field label="URL Gambar Sketsa Gedung">
              <div className="flex gap-2 items-center">
                 <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-slate-50 text-slate-400">
                    <ImageIcon className="size-5" />
                 </div>
                 <input 
                   className={inputClass + " flex-1"} 
                   value={content.building_image_url} 
                   onChange={(e) => update({ building_image_url: e.target.value })} 
                   placeholder="https://... (URL Gambar Anda)"
                 />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                 Upload gambar via menu <b>Media</b> di Dashboard, lalu copy URL-nya dan paste ke sini. Kosongkan untuk menggunakan gambar bawaan.
              </p>
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
