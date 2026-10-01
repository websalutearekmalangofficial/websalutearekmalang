import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  Mail,
  MessageCircle,
  Pencil,
  RefreshCw,
  Save,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { inputClass } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  createRegistrationDocumentUrl,
  fetchRegistrationDocuments,
  fetchRegistrations,
  type RegistrationRow,
} from "@/lib/admin-cms";

export const Route = createFileRoute("/_authenticated/admin/pendaftar")({
  component: RegistrationsAdmin,
});

const STATUS_OPTIONS = [
  "Menunggu Verifikasi",
  "Menunggu Upload Dokumen",
  "baru",
  "diproses",
  "terverifikasi",
  "ditolak",
];

const FIELD_GROUPS = [
  {
    title: "Data Diri",
    fields: [
      ["nama", "Nama Lengkap"],
      ["tempat_lahir", "Tempat Lahir"],
      ["tanggal_lahir", "Tanggal Lahir"],
      ["agama", "Agama"],
      ["jenis_kelamin", "Jenis Kelamin"],
      ["kewarganegaraan", "Kewarganegaraan"],
      ["nama_ibu_kandung", "Nama Ibu Kandung"],
    ],
  },
  {
    title: "Kontak & Domisili",
    fields: [
      ["alamat_lengkap", "Alamat Lengkap"],
      ["telp_rumah", "Telepon Rumah"],
      ["nomor_hp", "Nomor HP / WhatsApp"],
      ["nomor_hp_2", "Nomor HP 2"],
      ["email", "Email"],
      ["sosial_media", "Sosial Media"],
    ],
  },
  {
    title: "Pendidikan & Pendaftaran",
    fields: [
      ["jalur", "Jalur Pendaftaran"],
      ["jenjang_pendidikan", "Jenjang Pendidikan"],
      ["fakultas", "Fakultas"],
      ["jurusan", "Program Studi"],
      ["sekolah", "Sekolah (data lama)"],
      ["kota", "Kota (data lama)"],
    ],
  },
] as const;

const DOCUMENT_LABELS: Record<string, string> = {
  pasFoto: "Pas Foto",
  ktp: "Kartu Tanda Penduduk (KTP)",
  kk: "Kartu Keluarga (KK)",
  ijazah: "Ijazah Terakhir",
  transkrip: "Transkrip Nilai",
  suratSehat: "Surat Keterangan Sehat",
};

function documentLabel(filename: string) {
  const key = filename.replace(/\.[^.]+$/, "");
  return DOCUMENT_LABELS[key] ?? filename;
}

function formatFileSize(size: number | null) {
  if (size === null || !Number.isFinite(size)) return "";
  return size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function whatsappUrl(phone: string | null, message = "") {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

function initials(name: string | null) {
  return (name || "Profile")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function RegistrationsAdmin() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["registrations"], queryFn: fetchRegistrations });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [draft, setDraft] = useState<RegistrationRow | null>(null);

  const rows: RegistrationRow[] = query.data ?? [];
  const selected = rows.find((row) => row.id === selectedId) ?? null;

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        const haystack = [
          row.nama,
          row.email,
          row.nomor_hp,
          row.jalur,
          row.jenjang_pendidikan,
          row.fakultas,
          row.jurusan,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          (!search || haystack.includes(search.toLowerCase())) &&
          (statusFilter === "all" || row.status === statusFilter)
        );
      }),
    [rows, search, statusFilter],
  );

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["registrations"] });

  const update = useMutation({
    mutationFn: async (row: RegistrationRow) => {
      const { id, created_at, updated_at, user_id, ...payload } = row;
      const { error } = await supabase
        .from("registrations")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Data pendaftar berhasil disimpan.");
      setEditing(false);
      refresh();
    },
    onError: (error: Error) =>
      toast.error(`Gagal menyimpan: ${error.message}`),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("registrations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Data pendaftar dihapus.");
      setSelectedId(null);
      refresh();
    },
    onError: (error: Error) =>
      toast.error(`Gagal menghapus: ${error.message}`),
  });

  const openDetail = (row: RegistrationRow) => {
    setSelectedId(row.id);
    setDraft(row);
    setEditing(false);
  };

  const setField = (key: keyof RegistrationRow, value: string) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const setSocialField = (key: string, value: string) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            sosial_media: { ...(current.sosial_media ?? {}), [key]: value },
          }
        : current,
    );
  };

  return (\n    <div className="space-y-6">
            <div className="mx-auto max-w-[1500px]">
              <section className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-slate-800">
                    <ClipboardList className="size-3.5" />
                    Pendaftaran
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Data Pendaftar</h2>
                  <p className="mt-1 max-w-2xl text-sm text-slate-500">
                    Kelola data calon mahasiswa, verifikasi status, dan periksa dokumen pendaftaran dari satu tempat.
                  </p>
                </div>
                <Button
                  variant="formOutline"
                  onClick={refresh}
                  disabled={query.isFetching}
                  className="w-fit rounded-xl bg-white"
                >
                  <RefreshCw className={`size-4 ${query.isFetching ? "animate-spin" : ""}`} />
                  Refresh Data
                </Button>
              </section>

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-4 sm:p-5">
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_230px]">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-slate-400" />
                      <input
                        className={inputClass + " h-11 rounded-xl border-slate-200 bg-slate-50 pl-10"}
                        placeholder="Cari nama, email, WhatsApp, jurusan…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <select
                      className={inputClass + " h-11 rounded-xl border-slate-200 bg-slate-50"}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Semua Status</option>
                      {Array.from(new Set([...STATUS_OPTIONS, ...rows.map((r) => r.status)])).map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
                    <thead className="bg-slate-50">
                      <tr className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                        <th className="border-b px-5 py-4">Nama Lengkap</th>
                        <th className="border-b px-4 py-4">Tanggal Lahir</th>
                        <th className="border-b px-4 py-4">Jenis Kelamin</th>
                        <th className="border-b px-4 py-4">Nomor HP / WhatsApp</th>
                        <th className="border-b px-4 py-4">Waktu Daftar</th>
                        <th className="border-b px-4 py-4">Status</th>
                        <th className="border-b px-4 py-4">Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((row) => (
                        <tr key={row.id} className="align-middle transition hover:bg-slate-50">
                          <td className="border-b px-5 py-4">
                            <button
                              type="button"
                              onClick={() => openDetail(row)}
                              className="text-left font-bold text-slate-900 hover:text-slate-600"
                            >
                              {row.nama || "-"}
                            </button>
                          </td>
                          <td className="whitespace-nowrap border-b px-4 py-4 text-slate-600">{row.tanggal_lahir || "-"}</td>
                          <td className="border-b px-4 py-4 text-slate-600">{row.jenis_kelamin || "-"}</td>
                          <td className="whitespace-nowrap border-b px-4 py-4 font-medium text-slate-700">{row.nomor_hp || "-"}</td>
                          <td className="whitespace-nowrap border-b px-4 py-4 text-slate-500">{new Date(row.created_at).toLocaleString("id-ID")}</td>
                          <td className="border-b px-4 py-4">
                            <select
                              className={inputClass + " h-9 min-w-44 rounded-lg border-slate-200 bg-white text-xs"}
                              value={row.status}
                              onChange={(e) => update.mutate({ ...row, status: e.target.value })}
                            >
                              {Array.from(new Set([...STATUS_OPTIONS, row.status])).map((status) => (
                                <option key={status}>{status}</option>
                              ))}
                            </select>
                          </td>
                          <td className="border-b px-4 py-4">
                            <Button
                              variant="formOutline"
                              className="h-9 rounded-lg px-3"
                              onClick={() => openDetail(row)}
                            >
                              <UserRound className="size-4" /> Detail
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {query.isLoading ? (
                    <div className="p-10 text-center text-sm font-semibold text-slate-500">Memuat data pendaftar…</div>
                  ) : filtered.length === 0 ? (
                    <div className="p-10 text-center text-sm text-slate-500">Tidak ada data sesuai filter.</div>
                  ) : null}
                </div>
              </section>

              {selected && draft ? (
                <RegistrationDetail
                  row={draft}
                  editing={editing}
                  onClose={() => setSelectedId(null)}
                  onEdit={() => {
                    setDraft(selected);
                    setEditing(true);
                  }}
                  onSave={() => update.mutate(draft)}
                  onField={setField}
                  onSocialField={setSocialField}
                  saving={update.isPending}
                  onDelete={() => remove.mutate(selected.id)}
                />
              ) : null}
            </div>
          </div>
        \n  );
}

function DocumentSummary({ registrationId }: { registrationId: string }) {
  const documents = useQuery({
    queryKey: ["registration-documents-summary", registrationId],
    queryFn: () => fetchRegistrationDocuments(registrationId),
  });

  if (documents.isLoading) return <span className="text-xs text-slate-400">Memuat…</span>;
  if (documents.isError) return <span className="text-xs text-red-600">Gagal memuat</span>;
  if (!documents.data?.length) return <span className="text-xs text-slate-400">Belum diunggah</span>;

  return (
    <div className="space-y-1">
      {documents.data.map((doc) => (
        <button
          key={doc.path}
          type="button"
          className="block text-left text-xs font-semibold text-blue-700 hover:underline"
          onClick={async () => {
            try {
              const url = await createRegistrationDocumentUrl(doc.path);
              window.open(url, "_blank", "noopener,noreferrer");
            } catch (error: any) {
              toast.error(`Gagal membuka dokumen: ${error.message}`);
            }
          }}
        >
          <FileText className="mr-1 inline size-3" />
          {documentLabel(doc.name)}
        </button>
      ))}
    </div>
  );
}

function RegistrationDetail({
  row,
  editing,
  onClose,
  onEdit,
  onSave,
  onField,
  onSocialField,
  saving,
  onDelete,
}: {
  row: RegistrationRow;
  editing: boolean;
  onClose: () => void;
  onEdit: () => void;
  onSave: () => void;
  onField: (key: keyof RegistrationRow, value: string) => void;
  onSocialField: (key: string, value: string) => void;
  saving: boolean;
  onDelete: () => void;
}) {
  const documents = useQuery({
    queryKey: ["registration-documents", row.id],
    queryFn: () => fetchRegistrationDocuments(row.id),
  });

  const wa = whatsappUrl(row.nomor_hp, `Halo ${row.nama}, kami dari Sentra Layanan UT Arek Malang.`);
  const socials = row.sosial_media ?? {};

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">Detail Pendaftar</p>
          <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">{row.nama || "Tanpa Nama"}</h2>
          <p className="mt-1 text-sm text-slate-500">Nomor Referensi: <span className="font-bold text-slate-700">{row.id}</span></p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="formOutline" onClick={onClose} className="rounded-xl">
            <X className="size-4" /> Tutup
          </Button>
          {!editing ? (
            <Button variant="formOutline" onClick={onEdit} className="rounded-xl">
              <Pencil className="size-4" /> Edit Data
            </Button>
          ) : (
            <Button variant="utYellow" onClick={onSave} disabled={saving} className="rounded-xl">
              <Save className="size-4" /> {saving ? "Menyimpan…" : "Simpan Perubahan"}
            </Button>
          )}
          <Button
            variant="formOutline"
            className="rounded-xl text-red-600 hover:text-red-700"
            onClick={() => {
              if (confirm("Hapus data pendaftar ini?")) onDelete();
            }}
          >
            <Trash2 className="size-4" /> Hapus
          </Button>
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-slate-50 p-5 xl:border-b-0 xl:border-r">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white">
              {initials(row.nama)}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-slate-900">{row.nama || "-"}</h3>
              <p className="mt-1 truncate text-xs text-slate-500">{row.email || "Email belum diisi"}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <InfoItem label="Sekolah" value={row.sekolah} />
            <InfoItem label="Email" value={row.email} />
            <InfoItem label="No. HP / WhatsApp" value={row.nomor_hp} />
            <InfoItem label="Jalur" value={row.jalur} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Status</p>
              <StatusBadge status={row.status} />
            </div>
          </div>

          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <MessageCircle className="size-4" /> Buka WhatsApp
            </a>
          ) : null}
        </aside>

        <div className="min-w-0 p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <DetailSection title="Data Diri" description="Informasi identitas pendaftar">
              <FieldGrid
                fields={FIELD_GROUPS[0].fields}
                row={row}
                editing={editing}
                socials={socials}
                onField={onField}
                onSocialField={onSocialField}
              />
            </DetailSection>

            <DetailSection title="Pilihan Program" description="Informasi jalur dan program pendidikan">
              <FieldGrid
                fields={FIELD_GROUPS[2].fields}
                row={row}
                editing={editing}
                socials={socials}
                onField={onField}
                onSocialField={onSocialField}
              />
            </DetailSection>
          </div>

          <DetailSection title="Kontak & Domisili" description="Informasi komunikasi dan alamat" className="mt-5">
            <FieldGrid
              fields={FIELD_GROUPS[1].fields}
              row={row}
              editing={editing}
              socials={socials}
              onField={onField}
              onSocialField={onSocialField}
            />
          </DetailSection>

          <section className="mt-5 rounded-2xl border border-slate-200 p-4 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-900">Unggah Dokumen</h3>
                <p className="mt-1 text-xs text-slate-500">Dokumen privat pendaftar. Klik kartu untuk pratinjau.</p>
              </div>
              <FileText className="size-5 text-slate-400" />
            </div>

            {documents.isLoading ? (
              <p className="text-sm text-slate-500">Memuat dokumen…</p>
            ) : documents.isError ? (
              <p className="text-sm text-red-600">Dokumen gagal dimuat. Periksa hak akses Storage admin lalu refresh.</p>
            ) : documents.data?.length ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {documents.data.map((doc) => (
                  <DocumentLink key={doc.path} path={doc.path} name={doc.name} size={doc.size} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Belum ada dokumen terunggah untuk pendaftar ini.</p>
            )}
          </section>

          <section className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <h3 className="font-black text-slate-900">Sistem Verifikasi</h3>
                <p className="mt-1 text-xs text-slate-500">Perbarui status dan catatan internal pendaftar.</p>
              </div>
              <CheckCircle2 className="size-5 text-slate-500" />
            </div>

            <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-500">Status Verifikasi</label>
                <select
                  className={inputClass + " h-11 rounded-xl bg-white"}
                  value={row.status}
                  onChange={(e) => onField("status", e.target.value)}
                >
                  {Array.from(new Set([...STATUS_OPTIONS, row.status])).map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-500">Catatan Admin</label>
                <textarea
                  className={inputClass + " min-h-28 rounded-xl bg-white"}
                  placeholder="Tambahkan catatan verifikasi…"
                  value={row.notes ?? ""}
                  onChange={(e) => onField("notes", e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="utYellow"
                className="rounded-xl"
                onClick={() => {
                  if (editing) {
                    onSave();
                  } else {
                    toast.info("Status/catatan berubah di layar. Klik Edit Data untuk menyimpan perubahan.");
                  }
                }}
                disabled={saving}
              >
                <Save className="size-4" /> {saving ? "Menyimpan…" : "Simpan Verifikasi"}
              </Button>
              <Button
                variant="formOutline"
                className="rounded-xl bg-white"
                onClick={() => toast.info("Fitur email konfirmasi belum terhubung ke provider email.")}
              >
                <Mail className="size-4" /> Kirim Email Konfirmasi
              </Button>
            </div>
          </section>

          <section className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Dibuat</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{new Date(row.created_at).toLocaleString("id-ID")}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Diperbarui</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{new Date(row.updated_at).toLocaleString("id-ID")}</p>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function InfoItem({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-700">{formatValue(value)}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone =
    normalized.includes("verifikasi") || normalized.includes("baru")
      ? "bg-amber-100 text-amber-800"
      : normalized.includes("proses")
        ? "bg-blue-100 text-blue-800"
        : normalized.includes("tolak")
          ? "bg-red-100 text-red-800"
          : "bg-emerald-100 text-emerald-800";

  return (
    <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-black ${tone}`}>
      {status || "Belum ditentukan"}
    </span>
  );
}

function DetailSection({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 p-4 sm:p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="font-black text-slate-900">{title}</h3>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function FieldGrid({
  fields,
  row,
  editing,
  socials,
  onField,
  onSocialField,
}: {
  fields: readonly (readonly [string, string])[];
  row: RegistrationRow;
  editing: boolean;
  socials: Record<string, string>;
  onField: (key: keyof RegistrationRow, value: string) => void;
  onSocialField: (key: string, value: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map(([key, label]) => {
        const value = row[key as keyof RegistrationRow];
        const isSocial = key === "sosial_media";

        return (
          <div key={key} className={key === "alamat_lengkap" ? "sm:col-span-2" : ""}>
            <label className="mb-1.5 block text-[11px] font-bold text-slate-500">{label}</label>
            {editing && isSocial ? (
              <div className="space-y-2">
                {["instagram", "tiktok", "facebook", "x"].map((social) => (
                  <input
                    key={social}
                    className={inputClass + " h-10 rounded-xl bg-white"}
                    placeholder={social}
                    aria-label={social}
                    value={socials[social] ?? ""}
                    onChange={(e) => onSocialField(social, e.target.value)}
                  />
                ))}
              </div>
            ) : editing ? (
              key === "alamat_lengkap" ? (
                <textarea
                  className={inputClass + " min-h-24 rounded-xl bg-white"}
                  value={formatValue(value) === "-" ? "" : formatValue(value)}
                  onChange={(e) => onField(key as keyof RegistrationRow, e.target.value)}
                />
              ) : (
                <input
                  className={inputClass + " h-10 rounded-xl bg-white"}
                  type={key === "email" ? "email" : key === "tanggal_lahir" ? "date" : "text"}
                  value={formatValue(value) === "-" ? "" : formatValue(value)}
                  onChange={(e) => onField(key as keyof RegistrationRow, e.target.value)}
                />
              )
            ) : (
              <p className="min-h-10 break-words rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700">
                {isSocial ? formatValue(socials) : formatValue(value)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DocumentLink({
  path,
  name,
  size,
}: {
  path: string;
  name: string;
  size: number | null;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const open = async () => {
    setLoading(true);
    try {
      const signed = await createRegistrationDocumentUrl(path);
      setUrl(signed);
      window.open(signed, "_blank", "noopener,noreferrer");
    } catch (error: any) {
      toast.error(`Gagal membuka dokumen: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={open}
      className="flex min-h-20 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-slate-300 hover:bg-white"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
          <FileText className="size-5 text-slate-500" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-slate-800">{documentLabel(name)}</span>
          <span className="block truncate text-xs text-slate-500">
            {name}{size !== null ? ` · ${formatFileSize(size)}` : ""}
          </span>
        </span>
      </span>
      {loading ? (
        <RefreshCw className="size-4 shrink-0 animate-spin" />
      ) : url ? (
        <ExternalLink className="size-4 shrink-0 text-slate-500" />
      ) : (
        <span className="shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-black text-slate-600">Pratinjau</span>
      )}
    </button>
  );
}
