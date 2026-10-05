import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  LogOut,
  MapPin,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import {
  createRegistrationDocumentUrl,
  fetchRegistrationDocuments,
} from "@/lib/admin-cms";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/pendaftaran")({
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    const { data: role, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (roleError) throw new Error("Role akun tidak dapat diverifikasi.");
    if (role?.role === "admin") throw redirect({ to: "/admin/pendaftar" });
    if (role?.role !== "user") throw redirect({ to: "/auth" });

    return { user: data.user };
  },
  component: MyRegistrationPage,
});

type Registration = {
  id: string;
  registration_reference: string | null;
  nama: string;
  sekolah: string | null;
  kota: string | null;
  email: string | null;
  nomor_hp: string | null;
  jalur: string | null;
  status: string;
  notes: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  agama: string | null;
  jenis_kelamin: string | null;
  kewarganegaraan: string | null;
  nama_ibu_kandung: string | null;
  alamat_lengkap: string | null;
  jenjang_pendidikan: string | null;
  fakultas: string | null;
  jurusan: string | null;
  created_at: string;
  updated_at: string;
};

const statusSteps = [
  { key: "baru", label: "Pendaftaran Diterima", description: "Data pendaftaran sudah tercatat di sistem." },
  { key: "diproses", label: "Verifikasi Data", description: "Data sedang diperiksa oleh Admin." },
  { key: "dokumen", label: "Verifikasi Dokumen", description: "Dokumen pendaftaran sedang diperiksa." },
  { key: "pembayaran", label: "Pembayaran", description: "Status pembayaran akan ditampilkan setelah tahap ini aktif." },
  { key: "selesai", label: "Selesai", description: "Proses pendaftaran telah selesai." },
] as const;

function MyRegistrationPage() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();

  const registrationQuery = useQuery({
    queryKey: ["user-registration-detail", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select(
          "id,registration_reference,nama,sekolah,kota,email,nomor_hp,jalur,status,notes,tempat_lahir,tanggal_lahir,agama,jenis_kelamin,kewarganegaraan,nama_ibu_kandung,alamat_lengkap,jenjang_pendidikan,fakultas,jurusan,created_at,updated_at",
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Registration | null;
    },
  });

  const registration = registrationQuery.data;

  const documentsQuery = useQuery({
    queryKey: ["user-registration-documents", registration?.id],
    queryFn: () => fetchRegistrationDocuments(registration!.id),
    enabled: Boolean(registration?.id),
  });

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Gagal keluar dari akun.");
      return;
    }
    await navigate({ to: "/auth", replace: true });
  };

  const formatDate = (value: string | null | undefined) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date);
  };

  const formatDateTime = (value: string | null | undefined) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date);
  };

  const normalizedStatus = (registration?.status ?? "baru").toLowerCase();
  const currentStep =
    normalizedStatus.includes("selesai")
      ? 4
      : normalizedStatus.includes("pembayaran")
        ? 3
        : normalizedStatus.includes("dokumen")
          ? 2
          : normalizedStatus.includes("proses") || normalizedStatus.includes("diproses")
            ? 1
            : normalizedStatus.includes("tolak")
              ? -1
              : 0;

  const openDocument = async (path: string) => {
    try {
      const url = await createRegistrationDocumentUrl(path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Dokumen tidak dapat dibuka.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/dashboard"
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              aria-label="Kembali ke Dashboard"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Dashboard User</p>
              <h1 className="truncate text-lg font-black text-slate-900">Pendaftaran Saya</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label="Keluar"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
        {registrationQuery.isLoading ? (
          <LoadingCard />
        ) : registrationQuery.error ? (
          <ErrorCard message="Data pendaftaran tidak dapat dimuat. Silakan refresh halaman." />
        ) : !registration ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <ClipboardList className="mx-auto size-10 text-slate-300" />
            <h2 className="mt-3 text-xl font-black text-slate-900">Belum Ada Pendaftaran Terhubung</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Akun ini belum memiliki data pendaftaran yang terhubung. Jika Anda sudah mendaftar,
              silakan hubungi Admin untuk memeriksa hubungan akun dan Nomor Referensi Pendaftaran.
            </p>
            <Link to="/dashboard" className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white">
              Kembali ke Dashboard
            </Link>
          </section>
        ) : (
          <>
            <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-slate-950">
                    <ClipboardList className="size-3.5" />
                    Pendaftaran Saya
                  </div>
                  <h2 className="mt-4 text-2xl font-black sm:text-3xl">{registration.nama}</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Nomor Referensi:{" "}
                    <span className="font-black text-white">{registration.registration_reference || "-"}</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:min-w-56">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Status Saat Ini</p>
                  <p className="mt-1 text-lg font-black text-yellow-300">{registration.status || "Belum ditentukan"}</p>
                  <p className="mt-1 text-xs text-slate-400">Diperbarui {formatDateTime(registration.updated_at)}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Perjalanan Pendaftaran</p>
                <h2 className="mt-1 text-xl font-black text-slate-900">Status & Progress</h2>
              </div>

              {currentStep === -1 ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
                  Pendaftaran saat ini berstatus ditolak. Silakan periksa Catatan Admin di bawah atau hubungi Admin.
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-5">
                  {statusSteps.map((step, index) => {
                    const done = index < currentStep;
                    const active = index === currentStep;
                    return (
                      <div key={step.key}>
                        <div
                          className={
                            "flex size-10 items-center justify-center rounded-full border-2 text-sm font-black " +
                            (done || active
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white text-slate-400")
                          }
                        >
                          {done ? <CheckCircle2 className="size-5" /> : index + 1}
                        </div>
                        <p className="mt-3 text-sm font-black text-slate-900">{step.label}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {active ? "Tahap saat ini." : step.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <InfoCard title="Data Pendaftaran" icon={ClipboardList}>
                <InfoRow label="Nomor Referensi" value={registration.registration_reference} />
                <InfoRow label="Nama Lengkap" value={registration.nama} />
                <InfoRow label="Jalur Pendaftaran" value={registration.jalur} />
                <InfoRow label="Jenjang Pendidikan" value={registration.jenjang_pendidikan} />
                <InfoRow label="Fakultas" value={registration.fakultas} />
                <InfoRow label="Program Studi" value={registration.jurusan} />
                <InfoRow label="Tanggal Daftar" value={formatDateTime(registration.created_at)} />
              </InfoCard>

              <InfoCard title="Data Pribadi" icon={UserRound}>
                <InfoRow label="Tempat Lahir" value={registration.tempat_lahir} />
                <InfoRow label="Tanggal Lahir" value={formatDate(registration.tanggal_lahir)} />
                <InfoRow label="Jenis Kelamin" value={registration.jenis_kelamin} />
                <InfoRow label="Agama" value={registration.agama} />
                <InfoRow label="Kewarganegaraan" value={registration.kewarganegaraan} />
                <InfoRow label="Nama Ibu Kandung" value={registration.nama_ibu_kandung} />
              </InfoCard>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <InfoCard title="Kontak & Domisili" icon={MapPin}>
                <InfoRow label="Email" value={registration.email} />
                <InfoRow label="Nomor HP / WhatsApp" value={registration.nomor_hp} />
                <InfoRow label="Sekolah" value={registration.sekolah} />
                <InfoRow label="Kota" value={registration.kota} />
                <InfoRow label="Alamat Lengkap" value={registration.alamat_lengkap} multiline />
              </InfoCard>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-slate-100">
                    <FileText className="size-5 text-slate-700" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900">Dokumen Saya</h2>
                    <p className="mt-1 text-xs text-slate-500">Dokumen yang terhubung ke pendaftaran Anda.</p>
                  </div>
                </div>

                {documentsQuery.isLoading ? (
                  <p className="text-sm text-slate-500">Memuat dokumen...</p>
                ) : documentsQuery.error ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                    Dokumen belum dapat dimuat. Silakan refresh atau hubungi Admin.
                  </div>
                ) : documentsQuery.data?.length ? (
                  <div className="space-y-2">
                    {documentsQuery.data.map((document) => (
                      <button
                        key={document.path}
                        type="button"
                        onClick={() => void openDocument(document.path)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-slate-300 hover:bg-white"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white">
                            <FileText className="size-4 text-slate-500" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-slate-800">{document.name}</span>
                            <span className="block text-xs text-slate-500">
                              {document.size !== null ? "${Math.max(1, Math.round(document.size / 1024))} KB" : "Ukuran tidak tersedia"}
                            </span>
                          </span>
                        </span>
                        <Download className="size-4 shrink-0 text-slate-500" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                    Belum ada dokumen yang terunggah untuk pendaftaran ini.
                  </div>
                )}
              </section>
            </section>

            {registration.notes ? (
              <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
                <h2 className="font-black text-slate-900">Catatan Admin</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{registration.notes}</p>
              </section>
            ) : null}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Terakhir Diperbarui</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{formatDateTime(registration.updated_at)}</p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function InfoCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof ClipboardList;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-slate-100">
          <Icon className="size-5 text-slate-700" />
        </div>
        <h2 className="font-black text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function InfoRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string | null | undefined;
  multiline?: boolean;
}) {
  return (
    <div className="border-t border-slate-100 py-3 first:border-t-0">
      <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className={"mt-1 text-sm font-semibold text-slate-700 " + (multiline ? "whitespace-pre-line" : "break-words")}>
        {value || "-"}
      </p>
    </div>
  );
}

function LoadingCard() {
  return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Memuat data Pendaftaran Saya...</div>;
}

function ErrorCard({ message }: { message: string }) {
  return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{message}</div>;
}
