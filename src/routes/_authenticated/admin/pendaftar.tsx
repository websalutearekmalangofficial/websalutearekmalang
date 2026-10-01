import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ExternalLink, FileText, MessageCircle, Pencil, RefreshCw, Save, Search, Trash2, UserRound, X,
} from "lucide-react";
import { toast } from "sonner";

import { AdminCard, inputClass } from "@/components/admin/field";
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
      ["nama", "Nama Lengkap"], ["tempat_lahir", "Tempat Lahir"], ["tanggal_lahir", "Tanggal Lahir"],
      ["agama", "Agama"], ["jenis_kelamin", "Jenis Kelamin"], ["kewarganegaraan", "Kewarganegaraan"],
      ["nama_ibu_kandung", "Nama Ibu Kandung"],
    ],
  },
  {
    title: "Kontak & Domisili",
    fields: [
      ["alamat_lengkap", "Alamat Lengkap"], ["telp_rumah", "Telepon Rumah"], ["nomor_hp", "Nomor HP / WhatsApp"],
      ["nomor_hp_2", "Nomor HP 2"], ["email", "Email"], ["sosial_media", "Sosial Media"],
    ],
  },
  {
    title: "Pendidikan & Pendaftaran",
    fields: [
      ["jalur", "Jalur Pendaftaran"], ["jenjang_pendidikan", "Jenjang Pendidikan"],
      ["fakultas", "Fakultas"], ["jurusan", "Program Studi"],
      ["sekolah", "Sekolah (data lama)"], ["kota", "Kota (data lama)"],
    ],
  },
] as const;

const DOCUMENT_LABELS: Record<string, string> = {
  "pasFoto": "Pas Foto",
  "ktp": "Kartu Tanda Penduduk (KTP)",
  "kk": "Kartu Keluarga (KK)",
  "ijazah": "Ijazah Terakhir",
  "transkrip": "Transkrip Nilai",
  "suratSehat": "Surat Keterangan Sehat",
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

  const filtered = useMemo(() => rows.filter((row) => {
    const haystack = [
      row.nama, row.email, row.nomor_hp, row.jalur, row.jenjang_pendidikan, row.fakultas, row.jurusan,
    ].filter(Boolean).join(" ").toLowerCase();
    return (!search || haystack.includes(search.toLowerCase())) &&
      (statusFilter === "all" || row.status === statusFilter);
  }), [rows, search, statusFilter]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["registrations"] });

  const update = useMutation({
    mutationFn: async (row: RegistrationRow) => {
      const { id, created_at, updated_at, user_id, ...payload } = row;
      const { error } = await supabase.from("registrations").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Data pendaftar berhasil disimpan.");
      setEditing(false);
      refresh();
    },
    onError: (error: Error) => toast.error(`Gagal menyimpan: ${error.message}`),
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
    onError: (error: Error) => toast.error(`Gagal menghapus: ${error.message}`),
  });

  const openDetail = (row: RegistrationRow) => {
    setSelectedId(row.id);
    setDraft(row);
    setEditing(false);
  };

  const setField = (key: keyof RegistrationRow, value: string) => {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  };

  const setSocialField = (key: string, value: string) => {
    setDraft((current) => current ? {
      ...current,
      sosial_media: { ...(current.sosial_media ?? {}), [key]: value },
    } : current);
  };

  return (
    <div className="space-y-5">
      <AdminCard title="Data Pendaftar" description="CMS lengkap seluruh data yang masuk dari /daftar, termasuk dokumen unggahan.">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
            <input className={inputClass + " pl-9"} placeholder="Cari nama, email, WhatsApp, jurusan…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className={inputClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Semua Status</option>
            {Array.from(new Set([...STATUS_OPTIONS, ...rows.map((r) => r.status)])).map((status) => <option key={status}>{status}</option>)}
          </select>
          <Button variant="formOutline" onClick={() => refresh()} disabled={query.isFetching}>
            <RefreshCw className={`size-4 ${query.isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[150rem] border-collapse text-left text-sm">
            <thead><tr className="text-xs font-black uppercase tracking-wide text-ut-navy">
              <th className="border-b p-2">Nama Lengkap</th>
              <th className="border-b p-2">Tempat Lahir</th><th className="border-b p-2">Tanggal Lahir</th>
              <th className="border-b p-2">Agama</th><th className="border-b p-2">Jenis Kelamin</th>
              <th className="border-b p-2">Kewarganegaraan</th><th className="border-b p-2">Nama Ibu Kandung</th>
              <th className="border-b p-2">Alamat Lengkap</th><th className="border-b p-2">Telepon Rumah</th>
              <th className="border-b p-2">Nomor HP / WhatsApp</th><th className="border-b p-2">Nomor HP 2</th>
              <th className="border-b p-2">Email</th><th className="border-b p-2">Sosial Media</th>
              <th className="border-b p-2">Jalur Pendaftaran</th><th className="border-b p-2">Jenjang Pendidikan</th>
              <th className="border-b p-2">Fakultas</th><th className="border-b p-2">Program Studi</th>
              <th className="border-b p-2">Dokumen Unggahan</th><th className="border-b p-2">Status</th>
              <th className="border-b p-2">Catatan Admin</th><th className="border-b p-2">Waktu Daftar</th><th className="border-b p-2">Aksi</th>
            </tr></thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="align-top hover:bg-section-blue/40">
                  <td className="border-b p-2 font-bold text-ut-navy">{row.nama || "-"}</td>
                  <td className="border-b p-2">{row.tempat_lahir || "-"}</td>
                  <td className="border-b p-2 whitespace-nowrap">{row.tanggal_lahir || "-"}</td>
                  <td className="border-b p-2">{row.agama || "-"}</td>
                  <td className="border-b p-2">{row.jenis_kelamin || "-"}</td>
                  <td className="border-b p-2">{row.kewarganegaraan || "-"}</td>
                  <td className="border-b p-2">{row.nama_ibu_kandung || "-"}</td>
                  <td className="border-b p-2 min-w-56 max-w-72 whitespace-normal">{row.alamat_lengkap || "-"}</td>
                  <td className="border-b p-2">{row.telp_rumah || "-"}</td>
                  <td className="border-b p-2 whitespace-nowrap">{row.nomor_hp || "-"}</td>
                  <td className="border-b p-2">{row.nomor_hp_2 || "-"}</td>
                  <td className="border-b p-2">{row.email || "-"}</td>
                  <td className="border-b p-2 min-w-40 whitespace-normal">{Object.entries(row.sosial_media ?? {}).filter(([, value]) => Boolean(value)).map(([key, value]) => <div key={key}><span className="font-bold capitalize">{key}:</span> {value}</div>).length ? Object.entries(row.sosial_media ?? {}).filter(([, value]) => Boolean(value)).map(([key, value]) => <div key={key}><span className="font-bold capitalize">{key}:</span> {value}</div>) : "-"}</td>
                  <td className="border-b p-2">{row.jalur || "-"}</td>
                  <td className="border-b p-2">{row.jenjang_pendidikan || "-"}</td>
                  <td className="border-b p-2">{row.fakultas || "-"}</td>
                  <td className="border-b p-2">{row.jurusan || "-"}</td>
                  <td className="border-b p-2 min-w-48"><DocumentSummary registrationId={row.id} /></td>
                  <td className="border-b p-2">
                    <select className={inputClass + " h-9 min-w-44"} value={row.status} onChange={(e) => update.mutate({ ...row, status: e.target.value })}>
                      {Array.from(new Set([...STATUS_OPTIONS, row.status])).map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </td>
                  <td className="border-b p-2 min-w-48 whitespace-normal">{row.notes || "-"}</td>
                  <td className="border-b p-2 whitespace-nowrap">{new Date(row.created_at).toLocaleString("id-ID")}</td>
                  <td className="border-b p-2">
                    <div className="flex gap-2">
                      <Button variant="formOutline" className="h-9 px-3" onClick={() => openDetail(row)}><UserRound className="size-4" /> Detail</Button>
                      {whatsappUrl(row.nomor_hp) && <a className="inline-flex h-9 items-center gap-1 rounded-full border px-3 text-xs font-bold" href={whatsappUrl(row.nomor_hp)!} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> WA</a>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {query.isLoading ? <p className="p-4 text-sm font-bold">Memuat data…</p> : filtered.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Tidak ada data sesuai filter.</p> : null}
        </div>
      </AdminCard>

      {selected && draft ? (
        <RegistrationDetail
          row={draft}
          editing={editing}
          onClose={() => setSelectedId(null)}
          onEdit={() => { setDraft(selected); setEditing(true); }}
          onSave={() => update.mutate(draft)}
          onField={setField}
          onSocialField={setSocialField}
          saving={update.isPending}
          onDelete={() => remove.mutate(selected.id)}
        />
      ) : null}
    </div>
  );
}

function DocumentSummary({ registrationId }: { registrationId: string }) {
  const documents = useQuery({
    queryKey: ["registration-documents-summary", registrationId],
    queryFn: () => fetchRegistrationDocuments(registrationId),
  });

  if (documents.isLoading) return <span className="text-xs text-muted-foreground">Memuat…</span>;
  if (documents.isError) return <span className="text-xs text-destructive">Gagal memuat</span>;
  if (!documents.data?.length) return <span className="text-xs text-muted-foreground">Belum diunggah</span>;

  return (
    <div className="space-y-1">
      {documents.data.map((doc) => (
        <button key={doc.path} type="button" className="block text-left text-xs font-semibold text-ut-blue hover:underline"
          onClick={async () => {
            try {
              const url = await createRegistrationDocumentUrl(doc.path);
              window.open(url, "_blank", "noopener,noreferrer");
            } catch (error: any) {
              toast.error(`Gagal membuka dokumen: ${error.message}`);
            }
          }}>
          <FileText className="mr-1 inline size-3" />{documentLabel(doc.name)}
        </button>
      ))}
    </div>
  );
}

function RegistrationDetail({
  row, editing, onClose, onEdit, onSave, onField, onSocialField, saving, onDelete,
}: {
  row: RegistrationRow; editing: boolean; onClose: () => void; onEdit: () => void;
  onSave: () => void; onField: (key: keyof RegistrationRow, value: string) => void;
  onSocialField: (key: string, value: string) => void; saving: boolean; onDelete: () => void;
}) {
  const documents = useQuery({
    queryKey: ["registration-documents", row.id],
    queryFn: () => fetchRegistrationDocuments(row.id),
  });

  const wa = whatsappUrl(row.nomor_hp, `Halo ${row.nama}, kami dari Sentra Layanan UT Arek Malang.`);
  const socials = row.sosial_media ?? {};

  return (
    <AdminCard title={`Detail Pendaftar — ${row.nama}`} description={`ID: ${row.id}`}>
      <div className="mb-5 flex flex-wrap gap-2">
        <Button variant="formOutline" onClick={onClose}><X className="size-4" /> Tutup</Button>
        {!editing && <Button variant="formOutline" onClick={onEdit}><Pencil className="size-4" /> Edit Data</Button>}
        {editing && <Button variant="utYellow" onClick={onSave} disabled={saving}><Save className="size-4" /> {saving ? "Menyimpan…" : "Simpan Perubahan"}</Button>}
        {wa && <a className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold" href={wa} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> Buka WhatsApp</a>}
        <Button variant="formOutline" className="text-destructive" onClick={() => { if (confirm("Hapus data pendaftar ini?")) onDelete(); }}><Trash2 className="size-4" /> Hapus</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {FIELD_GROUPS.map((group) => (
          <section key={group.title} className="rounded-2xl border bg-card p-4">
            <h3 className="mb-3 font-black text-ut-navy">{group.title}</h3>
            <div className="space-y-3">
              {group.fields.map(([key, label]) => {
                const value = row[key as keyof RegistrationRow];
                const isSocial = key === "sosial_media";
                return <div key={key}>
                  <label className="mb-1 block text-xs font-bold text-muted-foreground">{label}</label>
                  {editing && isSocial ? (
                    <div className="space-y-2">
                      {["instagram", "tiktok", "facebook", "x"].map((social) => (
                        <input key={social} className={inputClass} placeholder={social} aria-label={social}
                          value={socials[social] ?? ""} onChange={(e) => onSocialField(social, e.target.value)} />
                      ))}
                    </div>
                  ) : editing ? (
                    key === "alamat_lengkap" ? <textarea className={inputClass + " min-h-24"} value={formatValue(value) === "-" ? "" : formatValue(value)} onChange={(e) => onField(key as keyof RegistrationRow, e.target.value)} /> :
                    <input className={inputClass} type={key === "email" ? "email" : key === "tanggal_lahir" ? "date" : "text"} value={formatValue(value) === "-" ? "" : formatValue(value)} onChange={(e) => onField(key as keyof RegistrationRow, e.target.value)} />
                  ) : <p className="break-words rounded-lg bg-section-blue/50 px-3 py-2 text-sm font-medium">{isSocial ? formatValue(socials) : formatValue(value)}</p>}
                </div>;
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-4">
          <h3 className="mb-3 font-black text-ut-navy">Status & Catatan Admin</h3>
          <select className={inputClass} value={row.status} onChange={(e) => onField("status", e.target.value)}>
            {Array.from(new Set([...STATUS_OPTIONS, row.status])).map((status) => <option key={status}>{status}</option>)}
          </select>
          <textarea className={inputClass + " mt-3 min-h-32"} placeholder="Catatan admin…" value={row.notes ?? ""} onChange={(e) => onField("notes", e.target.value)} />
        </section>

        <section className="rounded-2xl border bg-card p-4">
          <h3 className="mb-3 font-black text-ut-navy">Ringkasan Sosial Media</h3>
          {Object.entries(socials).some(([, value]) => Boolean(value)) ? Object.entries(socials).filter(([, value]) => Boolean(value)).map(([key, value]) => <p key={key} className="break-words text-sm"><span className="font-bold capitalize">{key}:</span> {value}</p>) : <p className="text-sm text-muted-foreground">Belum ada data sosial media.</p>}
          <div className="mt-4 text-xs text-muted-foreground">Dibuat: {new Date(row.created_at).toLocaleString("id-ID")}<br />Diperbarui: {new Date(row.updated_at).toLocaleString("id-ID")}</div>
        </section>
      </div>

      <section className="mt-4 rounded-2xl border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div><h3 className="font-black text-ut-navy">Dokumen Pendaftaran</h3><p className="text-xs text-muted-foreground">File privat; tautan akses sementara berlaku 10 menit dan hanya tersedia bagi admin.</p></div>
          <FileText className="size-5 text-ut-blue" />
        </div>
        {documents.isLoading ? <p className="text-sm">Memuat dokumen…</p> : documents.isError ? <p className="text-sm text-destructive">Dokumen gagal dimuat. Periksa hak akses Storage admin lalu coba refresh.</p> : documents.data?.length ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {documents.data.map((doc) => (
              <DocumentLink key={doc.path} path={doc.path} name={doc.name} size={doc.size} />
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground">Belum ada dokumen terunggah untuk pendaftar ini.</p>}
      </section>
    </AdminCard>
  );
}

function DocumentLink({ path, name, size }: { path: string; name: string; size: number | null }) {
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
    } finally { setLoading(false); }
  };
  return (
    <button type="button" onClick={open} className="flex items-center justify-between gap-3 rounded-xl border bg-section-blue/30 p-3 text-left hover:bg-section-blue">
      <span className="min-w-0">
        <span className="block text-sm font-bold">{documentLabel(name)}</span>
        <span className="block truncate text-xs text-muted-foreground">{name}{size !== null ? ` · ${formatFileSize(size)}` : ""}</span>
      </span>
      {loading ? <RefreshCw className="size-4 animate-spin" /> : url ? <ExternalLink className="size-4" /> : <FileText className="size-4" />}
    </button>
  );
}
