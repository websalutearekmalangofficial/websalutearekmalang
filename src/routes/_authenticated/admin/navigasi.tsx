import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { AdminCard, Field, inputClass } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fetchNavItems, swapOrder } from "@/lib/admin-cms";
import { SITE_LOGO_SETTING_KEY } from "@/lib/site-settings";
import { iconNames, type NavItem } from "@/lib/cms";

export const Route = createFileRoute("/_authenticated/admin/navigasi")({
  component: NavAdmin,
});

function NavAdmin() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [logoSaving, setLogoSaving] = useState(false);
  const logoInputId = "site-logo-upload";
  const queryClient = useQueryClient();
  const navQuery = useQuery({ queryKey: ["nav"], queryFn: fetchNavItems });
  const items = navQuery.data ?? [];
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["nav"] });

  useEffect(() => {
    let mounted = true;
    const loadLogo = async () => {
      setLogoLoading(true);
      const { data, error } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", SITE_LOGO_SETTING_KEY)
        .maybeSingle();

      if (!mounted) return;
      if (error) {
        toast.error("Logo belum dapat dimuat.");
      } else {
        setLogoUrl(data?.value?.trim() || null);
      }

      const { data: pathData } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "site_logo_storage_path")
        .maybeSingle();
      if (mounted) setLogoPath(pathData?.value?.trim() || null);
      setLogoLoading(false);
    };

    void loadLogo();
    return () => {
      mounted = false;
    };
  }, []);

  const saveLogo = async () => {
    if (!logoFile) return;
    if (!logoFile.type.startsWith("image/")) {
      toast.error("File logo harus berupa gambar.");
      return;
    }
    if (logoFile.size > 5 * 1024 * 1024) {
      toast.error("Ukuran logo maksimal 5 MB.");
      return;
    }

    setLogoSaving(true);
    try {
      const extension = logoFile.name.split(".").pop()?.toLowerCase() || "png";
      const path = `branding/logo-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("cms-media")
        .upload(path, logoFile, { upsert: false, contentType: logoFile.type, cacheControl: "3600" });
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from("cms-media").getPublicUrl(path);
      const { data: userData } = await supabase.auth.getUser();
      const uploadedUrl = publicData.publicUrl;

      const { error: settingsError } = await supabase.from("admin_settings").upsert([
        {
          key: SITE_LOGO_SETTING_KEY,
          value: uploadedUrl,
          description: "Public website logo URL managed from Admin > Navigasi",
          updated_by: userData.user?.id ?? null,
        },
        {
          key: "site_logo_storage_path",
          value: path,
          description: "Storage path for the active public website logo",
          updated_by: userData.user?.id ?? null,
        },
      ]);
      if (settingsError) {
        await supabase.storage.from("cms-media").remove([path]);
        throw settingsError;
      }

      if (logoPath && logoPath !== path) {
        await supabase.storage.from("cms-media").remove([logoPath]);
      }

      setLogoUrl(uploadedUrl);
      setLogoPath(path);
      setLogoFile(null);
      const input = document.getElementById(logoInputId) as HTMLInputElement | null;
      if (input) input.value = "";
      toast.success("Logo berhasil diunggah dan disinkronkan ke website.");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan logo.");
    } finally {
      setLogoSaving(false);
    }
  };

  const removeLogo = async () => {
    setLogoSaving(true);
    try {
      if (logoPath) {
        const { error } = await supabase.storage.from("cms-media").remove([logoPath]);
        if (error) throw error;
      }

      const { error: settingsError } = await supabase
        .from("admin_settings")
        .upsert([
          { key: SITE_LOGO_SETTING_KEY, value: "", description: "Public website logo URL managed from Admin > Navigasi" },
          { key: "site_logo_storage_path", value: "", description: "Storage path for the active public website logo" },
        ]);
      if (settingsError) throw settingsError;

      setLogoUrl(null);
      setLogoPath(null);
      setLogoFile(null);
      toast.success("Logo dihapus dari website.");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus logo.");
    } finally {
      setLogoSaving(false);
    }
  };

  const addItem = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("nav_items").insert({
        label: "Menu Baru",
        href: "/",
        sort_order: items.length + 1,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Menu baru ditambahkan.");
      refresh();
    },
    onError: () => toast.error("Gagal menambah menu."),
  });

  return (
    <>
      <AdminCard
        title="Logo Website"
        description="Upload, replace, atau remove logo utama yang tampil di header website. File disimpan di Supabase Storage dan URL aktif disinkronkan melalui admin_settings."
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
              <label
                htmlFor={logoInputId}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
              >
                <Upload className="size-4" />
                {logoUrl ? "Pilih Logo Pengganti" : "Pilih Logo"}
              </label>
              <input
                id={logoInputId}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
              />
              {logoUrl ? (
                <Button type="button" variant="formOutline" className="h-10 rounded-full px-4" onClick={removeLogo} disabled={logoSaving}>
                  <X className="size-4" />
                  Remove Logo
                </Button>
              ) : null}
              {logoFile ? (
                <Button type="button" variant="utYellow" className="h-10 rounded-full px-4" onClick={saveLogo} disabled={logoSaving}>
                  <Save className="size-4" />
                  {logoSaving ? "Menyimpan…" : "Upload & Simpan"}
                </Button>
              ) : null}
            </div>
            <p className="text-xs font-medium text-slate-500">
              Format gambar: JPG, JPEG, PNG, WebP, SVG, dan format image browser lainnya. Maksimal 5 MB.
              {logoFile ? ` File dipilih: ${logoFile.name}` : ""}
            </p>
            <p className="text-xs text-slate-400">
              Replace akan otomatis menghapus file logo lama setelah logo baru berhasil tersimpan.
            </p>
          </div>
        </div>
      </AdminCard>

      <AdminCard
        title="Menu Navigasi"
      description="Atur nama menu, tautan, badge, ikon, dan urutannya di bagian atas website."
    >
      <div className="space-y-3">
        {items.map((item, index) => (
          <NavRow key={item.id} item={item} index={index} siblings={items} onChanged={refresh} />
        ))}
        {items.length === 0 && !navQuery.isLoading ? (
          <p className="text-sm font-medium text-muted-foreground">Belum ada menu.</p>
        ) : null}
        <Button type="button" variant="formOutline" className="h-11 rounded-full px-4" onClick={() => addItem.mutate()}>
          <Plus className="size-4" aria-hidden="true" />
          Menu baru
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
}: {
  item: NavItem;
  index: number;
  siblings: NavItem[];
  onChanged: () => void;
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
        <Field label="Tautan">
          <input className={inputClass} value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} />
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
