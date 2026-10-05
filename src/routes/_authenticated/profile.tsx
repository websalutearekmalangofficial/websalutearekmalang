import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, KeyRound, LogOut, Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/admin/field";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/profile")({
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (role?.role === "admin") throw redirect({ to: "/admin/pendaftar" });
    if (role?.role !== "user") throw redirect({ to: "/auth" });

    return { user: data.user };
  },
  component: UserProfilePage,
});

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  must_change_password: boolean;
  first_login_at: string | null;
  created_at: string;
  updated_at: string;
};

type Registration = {
  registration_reference: string | null;
  nama: string;
  status: string;
  jalur: string | null;
  jenjang_pendidikan: string | null;
  fakultas: string | null;
  jurusan: string | null;
};

function UserProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = Route.useRouteContext();

  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["user-profile", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,full_name,email,username,avatar_url,must_change_password,first_login_at,created_at,updated_at")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data as Profile;
    },
  });

  const registrationQuery = useQuery({
    queryKey: ["user-registration", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("registration_reference,nama,status,jalur,jenjang_pendidikan,fakultas,jurusan")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as Registration | null;
    },
  });

  const profile = profileQuery.data;
  const registration = registrationQuery.data;
  const currentName = profile?.full_name ?? registration?.nama ?? "";

  if (profile && fullName === "" && currentName) {
    setFullName(currentName);
  }

  const saveProfile = async () => {
    const normalizedName = fullName.trim();
    if (normalizedName.length < 2) {
      toast.error("Nama minimal 2 karakter.");
      return;
    }

    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: normalizedName })
        .eq("id", user.id);
      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["user-profile", user.id] });
      toast.success("Profil berhasil diperbarui.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profil gagal diperbarui.");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Password baru minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password belum sama.");
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          must_change_password: false,
          first_login_at: profile?.first_login_at ?? new Date().toISOString(),
        } as never)
        .eq("id", user.id);
      if (profileError) throw profileError;

      await queryClient.invalidateQueries({ queryKey: ["user-profile", user.id] });
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password berhasil diperbarui.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password gagal diperbarui.");
    } finally {
      setChangingPassword(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  };

  const formatDate = (value: string | null | undefined) =>
    value ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "-";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
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
              <h1 className="truncate text-lg font-black text-slate-900">Profil Saya</h1>
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

      <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
        <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-yellow-400 text-slate-950">
              <UserRound className="size-9" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-300">Akun Pendaftar</p>
              <h2 className="mt-1 truncate text-2xl font-black">{profile?.full_name || registration?.nama || "Pendaftar"}</h2>
              <p className="mt-1 break-all text-sm text-slate-400">{profile?.email || user.email || "-"}</p>
            </div>
          </div>
        </section>

        {profileQuery.isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Memuat profil…</div>
        ) : profileQuery.error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Profil tidak dapat dimuat. Silakan refresh halaman atau kembali ke Dashboard.
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-yellow-100 text-slate-900">
                  <UserRound className="size-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900">Data Profil</h2>
                  <p className="mt-1 text-sm text-slate-500">Perbarui nama yang digunakan di Dashboard User.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">Nama Lengkap</span>
                  <input
                    className={inputClass + " h-11 rounded-xl"}
                    value={fullName || currentName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Nama lengkap"
                    autoComplete="name"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">Username</span>
                  <input className={inputClass + " h-11 rounded-xl bg-slate-50"} value={profile?.username || "-"} readOnly />
                  <span className="block text-xs text-slate-400">Username dibuat oleh Admin dan digunakan untuk login.</span>
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-bold text-slate-700">Email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      className={inputClass + " h-11 rounded-xl bg-slate-50 pl-10"}
                      value={profile?.email || user.email || "-"}
                      readOnly
                    />
                  </div>
                  <span className="block text-xs text-slate-400">Email akun saat ini belum diubah dari menu profil.</span>
                </label>
              </div>

              <Button variant="utYellow" className="mt-5 rounded-xl" onClick={saveProfile} disabled={savingProfile}>
                <Save className="mr-2 size-4" />
                {savingProfile ? "Menyimpan…" : "Simpan Perubahan"}
              </Button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-900">
                  <KeyRound className="size-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900">Keamanan Akun</h2>
                  <p className="mt-1 text-sm text-slate-500">Ganti password kapan saja tanpa bantuan Admin.</p>
                </div>
              </div>

              {profile?.must_change_password ? (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Password awal dari Admin masih aktif. Silakan ganti sekarang untuk mengamankan akun.
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">Password Baru</span>
                  <input
                    type="password"
                    className={inputClass + " h-11 rounded-xl"}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">Konfirmasi Password</span>
                  <input
                    type="password"
                    className={inputClass + " h-11 rounded-xl"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Ulangi password baru"
                    autoComplete="new-password"
                  />
                </label>
              </div>

              <Button className="mt-5 rounded-xl" onClick={changePassword} disabled={changingPassword}>
                <KeyRound className="mr-2 size-4" />
                {changingPassword ? "Memperbarui…" : "Perbarui Password"}
              </Button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900">Informasi Akun</h2>
                  <p className="mt-1 text-sm text-slate-500">Informasi akun dan pendaftaran yang terhubung.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow label="Status Akun" value={profile?.must_change_password ? "Menunggu ganti password" : "Aktif"} />
                <InfoRow label="Login Pertama" value={formatDate(profile?.first_login_at)} />
                <InfoRow label="Akun Dibuat" value={formatDate(profile?.created_at)} />
                <InfoRow label="Nomor Referensi" value={registration?.registration_reference} />
                <InfoRow label="Status Pendaftaran" value={registration?.status} />
                <InfoRow label="Program Studi" value={registration?.jurusan || registration?.jenjang_pendidikan} />
              </div>
            </section>

            <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-blue-700" />
                <div>
                  <h2 className="font-black text-slate-900">Data Pendaftaran Tetap Terhubung</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    Profil akun terhubung dengan Nomor Referensi Pendaftaran Anda. Perubahan nama akun tidak mengubah Nomor Referensi atau status pendaftaran.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-slate-700">{value || "-"}</p>
    </div>
  );
}
