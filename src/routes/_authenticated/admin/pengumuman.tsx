import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarClock,
  Check,
  ChevronDown,
  Edit3,
  Megaphone,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { inputClass, textareaClass } from "@/components/admin/field";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/pengumuman")({
  component: AnnouncementsAdmin,
});

type Announcement = {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: number;
  is_published: boolean;
  published_at: string | null;
  expires_at: string | null;
  target_user_id: string | null;
  created_at: string;
  updated_at: string;
};

type RegistrantOption = {
  id: string;
  user_id: string | null;
  registration_reference: string | null;
  nama: string;
  email: string | null;
  nomor_hp: string | null;
  status: string;
};

function AnnouncementsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [targetOpen, setTargetOpen] = useState(false);
  const [targetSearch, setTargetSearch] = useState("");
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "umum",
    priority: 0,
    is_published: false,
    published_at: "",
    expires_at: "",
    target_user_id: "",
  });

  const q = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Announcement[];
    },
  });

  const registrantsQuery = useQuery({
    queryKey: ["admin-announcement-target-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("id,user_id,registration_reference,nama,email,nomor_hp,status")
        .not("user_id", "is", null)
        .order("nama", { ascending: true });
      if (error) throw error;
      return (data ?? []) as RegistrantOption[];
    },
  });

  const targetUsers = registrantsQuery.data ?? [];
  const selectedTarget =
    targetUsers.find((row) => row.user_id === form.target_user_id) ?? null;

  const filteredTargetUsers = useMemo(() => {
    const term = targetSearch.trim().toLowerCase();
    if (!term) return targetUsers;
    return targetUsers.filter((row) =>
      [row.nama, row.email, row.nomor_hp, row.registration_reference, row.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [targetSearch, targetUsers]);

  const save = useMutation({
    mutationFn: async () => {
      if (!form.title.trim() || !form.content.trim()) {
        throw new Error("Judul dan isi pengumuman wajib diisi.");
      }

      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category.trim() || "umum",
        priority: Number(form.priority) || 0,
        is_published: form.is_published,
        published_at: form.is_published
          ? form.published_at
            ? new Date(form.published_at).toISOString()
            : new Date().toISOString()
          : null,
        expires_at: form.expires_at
          ? new Date(form.expires_at).toISOString()
          : null,
        target_user_id: form.target_user_id || null,
        updated_at: new Date().toISOString(),
      };

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Sesi admin tidak ditemukan.");

      if (editing) {
        const { error } = await supabase
          .from("announcements")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("announcements")
          .insert({ ...payload, created_by: user.user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Pengumuman diperbarui." : "Pengumuman dibuat.");
      setEditing(null);
      reset();
      void qc.invalidateQueries({ queryKey: ["admin-announcements"] });
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan pengumuman."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pengumuman dihapus.");
      void qc.invalidateQueries({ queryKey: ["admin-announcements"] });
    },
    onError: () => toast.error("Gagal menghapus pengumuman."),
  });

  function reset() {
    setForm({
      title: "",
      content: "",
      category: "umum",
      priority: 0,
      is_published: false,
      published_at: "",
      expires_at: "",
      target_user_id: "",
    });
    setTargetSearch("");
    setTargetOpen(false);
  }

  function edit(a: Announcement) {
    setEditing(a);
    setForm({
      title: a.title,
      content: a.content,
      category: a.category,
      priority: a.priority,
      is_published: a.is_published,
      published_at: a.published_at ? a.published_at.slice(0, 16) : "",
      expires_at: a.expires_at ? a.expires_at.slice(0, 16) : "",
      target_user_id: a.target_user_id ?? "",
    });
    setTargetSearch("");
    setTargetOpen(false);
  }

  function selectTarget(userId: string) {
    setForm((current) => ({ ...current, target_user_id: userId }));
    setTargetOpen(false);
    setTargetSearch("");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2">
              <Megaphone className="size-5 text-ut-navy" />
              <h1 className="text-2xl font-black text-slate-900">
                {editing ? "Edit Pengumuman" : "Pengumuman"}
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Kelola informasi resmi yang tampil di Dashboard User.
            </p>
          </div>
          <Button
            variant="utYellow"
            className="rounded-xl"
            onClick={() => {
              setEditing(null);
              reset();
            }}
          >
            <Plus className="size-4" />
            Pengumuman Baru
          </Button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase text-slate-500">
              Judul
            </label>
            <input
              className={inputClass + " h-11 rounded-xl"}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Judul pengumuman"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-black uppercase text-slate-500">
              Kategori
            </label>
            <input
              className={inputClass + " h-11 rounded-xl"}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="umum"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="mb-1.5 block text-xs font-black uppercase text-slate-500">
              Isi Pengumuman
            </label>
            <textarea
              className={textareaClass + " min-h-40 rounded-xl"}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Tulis informasi pengumuman..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-black uppercase text-slate-500">
              Prioritas
            </label>
            <input
              type="number"
              min="0"
              className={inputClass + " h-11 rounded-xl"}
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: Number(e.target.value) })
              }
            />
          </div>

          <div className="relative">
            <label className="mb-1.5 block text-xs font-black uppercase text-slate-500">
              Target Pendaftar
            </label>
            <button
              type="button"
              className={
                inputClass +
                " flex h-11 w-full items-center justify-between rounded-xl bg-white text-left"
              }
              onClick={() => setTargetOpen((open) => !open)}
            >
              <span className={selectedTarget ? "text-slate-900" : "text-slate-400"}>
                {selectedTarget ? selectedTarget.nama : "Semua User"}
              </span>
              <ChevronDown className="size-4 text-slate-400" />
            </button>

            {targetOpen ? (
              <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 p-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
                    <input
                      autoFocus
                      className={inputClass + " h-10 w-full rounded-xl pl-9"}
                      value={targetSearch}
                      onChange={(e) => setTargetSearch(e.target.value)}
                      placeholder="Cari nama, email, No. referensi..."
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50"
                  onClick={() => {
                    setForm((current) => ({ ...current, target_user_id: "" }));
                    setTargetOpen(false);
                    setTargetSearch("");
                  }}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <Users className="size-4 text-slate-500" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black text-slate-800">
                      Semua User
                    </span>
                    <span className="block text-xs text-slate-500">
                      Pengumuman tampil untuk semua user yang memenuhi jadwal tayang
                    </span>
                  </span>
                  {!form.target_user_id ? <Check className="size-4 text-emerald-600" /> : null}
                </button>

                <div className="max-h-64 overflow-y-auto">
                  {registrantsQuery.isLoading ? (
                    <p className="p-4 text-sm text-slate-500">Memuat daftar pendaftar...</p>
                  ) : registrantsQuery.error ? (
                    <p className="p-4 text-sm text-red-600">
                      Daftar pendaftar tidak dapat dimuat.
                    </p>
                  ) : filteredTargetUsers.length ? (
                    filteredTargetUsers.map((row) => (
                      <button
                        type="button"
                        key={row.user_id}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
                        onClick={() => selectTarget(row.user_id ?? "")}
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50">
                          <UserRound className="size-4 text-blue-600" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-black text-slate-800">
                            {row.nama}
                          </span>
                          <span className="block truncate text-xs text-slate-500">
                            {row.registration_reference || "Tanpa nomor referensi"}
                            {row.email ? " · " + row.email : ""}
                          </span>
                        </span>
                        {row.user_id === form.target_user_id ? (
                          <Check className="size-4 text-emerald-600" />
                        ) : null}
                      </button>
                    ))
                  ) : (
                    <p className="p-4 text-sm text-slate-500">
                      Tidak ada pendaftar dengan akun user yang cocok.
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            {selectedTarget ? (
              <div className="mt-2 flex items-center justify-between rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-800">
                <span className="min-w-0 truncate">
                  <strong>Target:</strong> {selectedTarget.nama}
                  {selectedTarget.registration_reference
                    ? " · " + selectedTarget.registration_reference
                    : ""}
                </span>
                <button
                  type="button"
                  className="ml-2 shrink-0 rounded-full p-1 hover:bg-blue-100"
                  onClick={() => setForm((current) => ({ ...current, target_user_id: "" }))}
                  aria-label="Hapus target user"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-black uppercase text-slate-500">
              Mulai Tayang
            </label>
            <input
              type="datetime-local"
              className={inputClass + " h-11 rounded-xl"}
              value={form.published_at}
              onChange={(e) => setForm({ ...form, published_at: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-black uppercase text-slate-500">
              Berakhir
            </label>
            <input
              type="datetime-local"
              className={inputClass + " h-11 rounded-xl"}
              value={form.expires_at}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
            />
          </div>
        </div>

        <label className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
          />
          Terbitkan pengumuman
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="utYellow"
            className="rounded-xl"
            onClick={() => save.mutate()}
            disabled={save.isPending}
          >
            {save.isPending
              ? "Menyimpan…"
              : editing
                ? "Simpan Perubahan"
                : "Simpan Pengumuman"}
          </Button>
          {editing ? (
            <Button
              variant="formOutline"
              className="rounded-xl"
              onClick={() => {
                setEditing(null);
                reset();
              }}
            >
              Batal
            </Button>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <CalendarClock className="size-5 text-slate-500" />
          <h2 className="font-black text-slate-900">Daftar Pengumuman</h2>
        </div>

        {q.isLoading ? (
          <p className="text-sm text-slate-500">Memuat...</p>
        ) : q.error ? (
          <p className="text-sm text-red-600">Gagal memuat pengumuman.</p>
        ) : q.data?.length ? (
          <div className="space-y-3">
            {q.data.map((a) => {
              const target = targetUsers.find((row) => row.user_id === a.target_user_id);
              return (
                <article key={a.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-black uppercase">
                          {a.category}
                        </span>
                        <span
                          className={
                            a.is_published
                              ? "rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-black text-emerald-800"
                              : "rounded-full bg-amber-100 px-2 py-1 text-[11px] font-black text-amber-800"
                          }
                        >
                          {a.is_published ? "Tayang" : "Draft"}
                        </span>
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-black text-blue-800">
                          {target ? "Target: " + target.nama : "Semua User"}
                        </span>
                      </div>
                      <h3 className="mt-2 font-black text-slate-900">{a.title}</h3>
                      <p className="mt-1 whitespace-pre-line text-sm text-slate-500">
                        {a.content}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="formOutline"
                        className="rounded-xl"
                        onClick={() => edit(a)}
                      >
                        <Edit3 className="size-4" />
                        Edit
                      </Button>
                      <Button
                        variant="formOutline"
                        className="rounded-xl text-red-600"
                        onClick={() => {
                          if (confirm("Hapus pengumuman ini?")) remove.mutate(a.id);
                        }}
                      >
                        <Trash2 className="size-4" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Belum ada pengumuman.</p>
        )}
      </section>
    </div>
  );
}
