import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminCard, Field, inputClass } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fetchAdminPageOptions, fetchNavItems, swapOrder } from "@/lib/admin-cms";
import { iconNames, type NavItem } from "@/lib/cms";

export const Route = createFileRoute("/_authenticated/admin/navigasi")({
  component: NavAdmin,
});

function NavAdmin() {
  const queryClient = useQueryClient();
  const navQuery = useQuery({ queryKey: ["nav"], queryFn: fetchNavItems });
  const pagesQuery = useQuery({ queryKey: ["admin-page-options"], queryFn: fetchAdminPageOptions });
  const [selectedPageId, setSelectedPageId] = useState("");
  const items = navQuery.data ?? [];
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["nav"] });

  const addItem = useMutation({
    mutationFn: async () => {
      const page = pagesQuery.data?.find((entry) => entry.id === selectedPageId);
      if (!page) throw new Error("Pilih halaman dari daftar terlebih dahulu.");
      const href = page.slug === "beranda" ? "/" : "/" + page.slug;
      if (items.some((item) => item.href === href)) throw new Error("Halaman tersebut sudah ada di navigasi.");
      const { error } = await supabase.from("nav_items").insert({
        label: page.title,
        href,
        badge: null,
        icon: null,
        sort_order: items.length + 1,
        is_active: true,
        parent_id: null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Halaman berhasil ditambahkan ke navigasi.");
      setSelectedPageId("");
      refresh();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Gagal menambah menu."),
  });

  return (
    <>
      <AdminCard
        title="Menu Navigasi"
      description="Atur nama menu, tautan, badge, ikon, dan urutannya di bagian atas website."
    >
      <div className="space-y-3">
        {items.map((item, index) => (
          <NavRow key={item.id} item={item} index={index} siblings={items} onChanged={refresh} pageOptions={pagesQuery.data ?? []} />
        ))}
        {items.length === 0 && !navQuery.isLoading ? (
          <p className="text-sm font-medium text-muted-foreground">Belum ada menu.</p>
        ) : null}
        <div className="flex flex-col gap-3 rounded-2xl border border-ut-sky/20 bg-section-blue p-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <Field label="Tambah dari Page">
              <select className={inputClass} value={selectedPageId} onChange={(e) => setSelectedPageId(e.target.value)}>
                <option value="">Pilih halaman dari database...</option>
                {(pagesQuery.data ?? []).map((page) => (
                  <option key={page.id} value={page.id}>{page.title} — /{page.slug === "beranda" ? "" : page.slug}</option>
                ))}
              </select>
            </Field>
          </div>
          <Button type="button" variant="utYellow" className="h-11 rounded-full px-5" disabled={!selectedPageId || addItem.isPending} onClick={() => addItem.mutate()}>
            <Plus className="size-4" aria-hidden="true" />
            {addItem.isPending ? "Menambahkan..." : "Tambahkan ke Header"}
          </Button>
        </div>
        <Button type="button" variant="formOutline" className="h-11 rounded-full px-4" onClick={async () => {
          const { error } = await supabase.from("nav_items").insert({ label: "Menu Baru", href: "/", sort_order: items.length + 1, is_active: true });
          if (error) toast.error("Gagal menambah menu."); else { toast.success("Menu manual ditambahkan."); refresh(); }
        }}>
          <Plus className="size-4" aria-hidden="true" />
          Menu manual
        </Button>
      </div>
      </AdminCard>
    </>
  );
}

function NavRow({
  item,
  index,
  siblings,
  onChanged,
  pageOptions,
}: {
  item: NavItem;
  index: number;
  siblings: NavItem[];
  onChanged: () => void;
  pageOptions: { id: string; title: string; slug: string }[];
}) {
  const [form, setForm] = useState(item);
  useEffect(() => setForm(item), [item]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("nav_items")
        .update({
          label: form.label,
          href: form.href,
          badge: form.badge,
          icon: form.icon,
          is_active: form.is_active,
          parent_id: form.parent_id ?? null,
        })
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Menu disimpan.");
      onChanged();
    },
    onError: () => toast.error("Gagal menyimpan menu."),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("nav_items").delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Menu dihapus.");
      onChanged();
    },
    onError: () => toast.error("Gagal menghapus menu."),
  });

  const move = useMutation({
    mutationFn: async (direction: -1 | 1) => {
      const other = siblings[index + direction];
      if (!other) return;
      await swapOrder(
        "nav_items",
        { id: item.id, order: item.sort_order },
        { id: other.id, order: other.sort_order },
      );
    },
    onSuccess: onChanged,
    onError: () => toast.error("Gagal mengubah urutan."),
  });

  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Nama menu">
          <input className={inputClass} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        </Field>
        <Field label="Pilih Page">
          <select className={inputClass} value={form.href} onChange={(e) => {
            const page = pageOptions.find((entry) => (entry.slug === "beranda" ? "/" : "/" + entry.slug) === e.target.value);
            setForm({ ...form, href: e.target.value, label: page?.title ?? form.label });
          }}>
            <option value={form.href}>URL saat ini: {form.href}</option>
            {pageOptions.map((page) => <option key={page.id} value={page.slug === "beranda" ? "/" : "/" + page.slug}>{page.title} — /{page.slug === "beranda" ? "" : page.slug}</option>)}
          </select>
        </Field>
                <Field label="Tautan">
          <input className={inputClass} value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} />
        </Field>
        <Field label="Jadikan Submenu dari">
          <select
            className={inputClass}
            value={form.parent_id ?? ""}
            onChange={(e) => setForm({ ...form, parent_id: e.target.value || null })}
          >
            <option value="">Menu utama (Top Level)</option>
            {siblings
              .filter((entry) => entry.id !== item.id && entry.parent_id === null)
              .map((entry) => (
                <option key={entry.id} value={entry.id}>{entry.label}</option>
              ))}
          </select>
        </Field>
        <Field label="Badge (opsional)">
          <input
            className={inputClass}
            value={form.badge ?? ""}
            onChange={(e) => setForm({ ...form, badge: e.target.value || null })}
          />
        </Field>
        <Field label="Ikon">
          <select
            className={inputClass}
            value={form.icon ?? ""}
            onChange={(e) => setForm({ ...form, icon: e.target.value || null })}
          >
            <option value="">Tanpa ikon</option>
            {iconNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="mr-auto inline-flex items-center gap-2 text-sm font-bold text-ut-navy">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Tampilkan di website
        </label>
        <Button
          type="button"
          variant="formOutline"
          className="h-10 w-10 rounded-full p-0"
          aria-label="Naikkan urutan"
          disabled={index === 0}
          onClick={() => move.mutate(-1)}
        >
          <ArrowUp className="size-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="formOutline"
          className="h-10 w-10 rounded-full p-0"
          aria-label="Turunkan urutan"
          disabled={index === siblings.length - 1}
          onClick={() => move.mutate(1)}
        >
          <ArrowDown className="size-4" aria-hidden="true" />
        </Button>
        <Button type="button" variant="utYellow" className="h-10 rounded-full px-4" onClick={() => save.mutate()}>
          <Save className="size-4" aria-hidden="true" />
          Simpan
        </Button>
        <Button type="button" variant="formOutline" className="h-10 rounded-full px-4" onClick={() => remove.mutate()}>
          <Trash2 className="size-4" aria-hidden="true" />
          Hapus
        </Button>
      </div>
    </div>
  );
}
