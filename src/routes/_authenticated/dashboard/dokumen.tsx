import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Download, FileCheck2, FileText, LogOut, RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";

import { createRegistrationDocumentUrl, fetchRegistrationDocuments } from "@/lib/admin-cms";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/dokumen")({
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
  component: MyDocumentsPage,
});

type Registration = {
  id: string;
  registration_reference: string | null;
  nama: string;
  status: string;
};

function MyDocumentsPage() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();

  const registrationQuery = useQuery({
    queryKey: ["user-registration-for-documents", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("id,registration_reference,nama,status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Registration | null;
    },
  });

  const registration = registrationQuery.data;

  const documentsQuery = useQuery({
    queryKey: ["user-documents", registration?.id],
    queryFn: () => fetchRegistrationDocuments(registration!.id),
    enabled: Boolean(registration?.id),
  });

  const formatDateTime = (value: string | null | undefined) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date);
  };

  const openDocument = async (path: string) => {
    try {
      const url = await createRegistrationDocumentUrl(path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Dokumen tidak dapat dibuka.");
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Gagal keluar dari akun.");
      return;
    }
    await navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/dashboard" className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50" aria-label="Kembali ke Dashboard">
              <ArrowLeft className="size-4" />
            </Link>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Dashboard User</p>
              <h1 className="truncate text-lg font-black text-slate-900">Dokumen Saya</h1>
            </div>
          </div>
          <button type="button" onClick={signOut} className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50" aria-label="Keluar">
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
        <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-yellow-400 text-slate-950"><FileCheck2 className="size-6" /></div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Dokumen Pendaftaran</p>
              <h2 className="mt-1 text-2xl font-black sm:text-3xl">Dokumen Saya</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Semua dokumen yang terhubung dengan pendaftaran Anda ditampilkan di sini. Akses dokumen menggunakan tautan sementara yang aman.
              </p>
            </div>
          </div>
          {registration ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Summary label="Nama" value={registration.nama} />
              <Summary label="Nomor Referensi" value={registration.registration_reference || "-"} />
              <Summary label="Status" value={registration.status || "-"} />
            </div>
          ) : null}
        </section>

        {registrationQuery.isLoading ? (
          <StateCard text="Memuat data pendaftaran..." />
        ) : registrationQuery.error ? (
          <StateCard text="Data pendaftaran tidak dapat dimuat. Silakan coba lagi." error />
        ) : !registration ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <FileText className="mx-auto size-10 text-slate-300" />
            <h2 className="mt-3 text-lg font-black text-slate-900">Belum Ada Pendaftaran</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Dokumen akan tersedia setelah akun Anda terhubung dengan data pendaftaran.</p>
            <Link to="/dashboard/pendaftaran" className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white">Lihat Pendaftaran Saya</Link>
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-black text-slate-900">Daftar Dokumen</h2>
                <p className="mt-1 text-xs text-slate-500">{documentsQuery.data?.length ?? 0} dokumen tersedia</p>
              </div>
              <button type="button" onClick={() => void documentsQuery.refetch()} disabled={documentsQuery.isFetching} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
                <RefreshCw className={"size-3.5 " + (documentsQuery.isFetching ? "animate-spin" : "")} />
                Perbarui
              </button>
            </div>

            {documentsQuery.isLoading ? (
              <div className="py-10 text-center text-sm text-slate-500">Memuat dokumen...</div>
            ) : documentsQuery.error ? (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">Dokumen tidak dapat dimuat. Pastikan akses akun Anda sudah benar atau hubungi Admin.</div>
            ) : documentsQuery.data?.length ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {documentsQuery.data.map((document) => (
                  <article key={document.path} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white">
                    <div className="flex items-start gap-3">
                      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white shadow-sm"><FileText className="size-5 text-slate-600" /></div>
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-sm font-black text-slate-800">{document.name}</h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {document.size !== null ? String(Math.max(1, Math.round(document.size / 1024))) + " KB" : "Ukuran tidak tersedia"}
                          {" • "}
                          {formatDateTime(document.updated_at)}
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={() => void openDocument(document.path)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-black text-white transition hover:bg-slate-800">
                      <Download className="size-3.5" />
                      Buka / Unduh Dokumen
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Upload className="mx-auto size-10 text-slate-300" />
                <h3 className="mt-3 font-black text-slate-900">Belum Ada Dokumen</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Belum ada dokumen yang diunggah untuk pendaftaran Anda. Jika dokumen sudah Anda serahkan sebelumnya, silakan hubungi Admin untuk pemeriksaan.</p>
              </div>
            )}
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">Keamanan Dokumen</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Dokumen tidak menggunakan URL publik. Saat Anda membuka dokumen, sistem membuat tautan sementara dan hanya akun yang terhubung dengan pendaftaran tersebut yang dapat memintanya.
          </p>
        </section>
      </main>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-black text-white">{value}</p></div>;
}

function StateCard({ text, error = false }: { text: string; error?: boolean }) {
  return <div className={"rounded-2xl border p-6 text-center text-sm " + (error ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-500")}>{text}</div>;
}
