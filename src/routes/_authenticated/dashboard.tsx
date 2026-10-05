import { createFileRoute, Link, Outlet, redirect, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  HelpCircle,
  KeyRound,
  LogOut,
  Megaphone,
  MessageCircle,
  Settings,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/admin/field";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
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
  component: UserDashboard,
});

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  username: string | null;
  must_change_password: boolean;
};

type Registration = {
  id: string;
  registration_reference: string | null;
  nama: string;
  status: string;
  notes: string | null;
  jalur: string | null;
  jenjang_pendidikan: string | null;
  fakultas: string | null;
  jurusan: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
};

const statusSteps = [
  ["Pendaftaran", "Pendaftaran Anda telah tercatat."],
  ["Verifikasi Data", "Data pendaftaran diperiksa oleh admin."],
  ["Verifikasi Dokumen", "Dokumen pendaftaran diperiksa."],
  ["Pembayaran", "Menunggu instruksi/status pembayaran."],
  ["Selesai", "Proses pendaftaran selesai."],
] as const;

function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = Route.useRouteContext();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["user-profile", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,full_name,email,username,must_change_password")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data as unknown as Profile;
    },
  });

  const registrationQuery = useQuery({
    queryKey: ["user-registration", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("id,registration_reference,nama,status,notes,jalur,jenjang_pendidikan,fakultas,jurusan,created_at,updated_at,user_id")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data as Registration;
    },
  });

  const profile = profileQuery.data;
  const registration = registrationQuery.data;
  const normalizedStatus = (registration?.status ?? "baru").toLowerCase();
  const verificationIndex = normalizedStatus.includes("terverifikasi") ? 2 : normalizedStatus.includes("tolak") ? -1 : normalizedStatus.includes("proses") ? 1 : 1;
  const currentStep = normalizedStatus.includes("terverifikasi") ? 3 : normalizedStatus.includes("diproses") ? 2 : normalizedStatus.includes("ditolak") ? 0 : 2;

  const changePassword = async () => {
    if (newPassword.length < 8) return toast.error("Password baru minimal 8 karakter.");
    if (newPassword !== confirmPassword) return toast.error("Konfirmasi password belum sama.");
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      const { error: profileError } = await supabase.from("profiles").update({
        must_change_password: false,
        first_login_at: new Date().toISOString(),
      } as never).eq("id", user.id);
      if (profileError) throw profileError;
      await queryClient.invalidateQueries({ queryKey: ["user-profile", user.id] });
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password berhasil diperbarui.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  };

  const menu = [
    { label: "Beranda", icon: GraduationCap, href: "/dashboard" },
    { label: "Profil Saya", icon: UserRound, href: "/dashboard/profile" },
    { label: "Pendaftaran Saya", icon: ClipboardList, href: "/dashboard/pendaftaran" },
    { label: "Dokumen Saya", icon: FileText, href: "/dashboard/dokumen" },
    { label: "Pembayaran", icon: CreditCard, href: "#pembayaran" },
    { label: "Progress Saya", icon: CheckCircle2, href: "#progress" },
    { label: "Pengumuman", icon: Megaphone, href: "#pengumuman" },
    { label: "Pesan & Bantuan", icon: MessageCircle, href: "#bantuan" },
    { label: "Akademik", icon: BookOpen, href: "#akademik" },
    { label: "Notifikasi", icon: Bell, href: "#notifikasi" },
    { label: "Pengaturan", icon: Settings, href: "#pengaturan" },
  ];

  if (location.pathname !== "/dashboard") {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-slate-900 text-white lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-yellow-400 text-slate-950"><GraduationCap className="size-6" /></div>
            <div><p className="font-black">SALUT AREK MALANG</p><p className="text-[11px] text-slate-400">Dashboard Pendaftar</p></div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {menu.map((item) => {
            const Icon = item.icon;
            return <a key={item.label} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"><Icon className="size-5" />{item.label}</a>;
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10"><LogOut className="size-5" />Keluar</button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
          <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Dashboard User</p><h1 className="text-xl font-black text-slate-900">Selamat datang, {profile?.full_name || registration?.nama || "Pendaftar"}</h1></div>
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 sm:block">Website</Link>
            <button type="button" onClick={signOut} className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="Keluar"><LogOut className="size-4" /></button>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
          {profile?.must_change_password ? (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6" id="pengaturan">
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-yellow-400 text-slate-950"><KeyRound className="size-5" /></div>
                <div className="min-w-0 flex-1"><h2 className="font-black text-slate-900">Ganti Password Awal</h2><p className="mt-1 text-sm text-slate-600">Demi keamanan, password yang diberikan admin harus diganti pada login pertama.</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2"><input type="password" className={inputClass + " h-11 rounded-xl bg-white"} placeholder="Password baru" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /><input type="password" className={inputClass + " h-11 rounded-xl bg-white"} placeholder="Ulangi password baru" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
                  <Button variant="utYellow" className="mt-3 rounded-xl" onClick={changePassword} disabled={changingPassword}>{changingPassword ? "Menyimpan…" : "Simpan Password Baru"}</Button>
                </div>
              </div>
            </section>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Status Pendaftaran" value={registration?.status || "Memuat…"} icon={CheckCircle2} />
            <SummaryCard label="Nomor Referensi" value={registration?.registration_reference || "-"} icon={ClipboardList} />
            <SummaryCard label="Program" value={registration?.jurusan || registration?.jenjang_pendidikan || "-"} icon={GraduationCap} />
            <SummaryCard label="Username" value={profile?.username || "-"} icon={UserRound} />
          </section>

          <section id="progress" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5"><p className="text-xs font-black uppercase tracking-wider text-slate-400">Perjalanan Anda</p><h2 className="text-2xl font-black text-slate-900">Progress Pendaftaran</h2></div>
            <div className="grid gap-4 md:grid-cols-5">
              {statusSteps.map(([label, description], index) => {
                const done = index < currentStep;
                const active = index === currentStep;
                return <div key={label} className="relative"><div className={`flex size-10 items-center justify-center rounded-full border-2 text-sm font-black ${done || active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-400"}`}>{done ? "✓" : index + 1}</div><p className="mt-3 text-sm font-black text-slate-900">{label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{active ? "Tahap saat ini." : description}</p></div>;
              })}
            </div>
          </section>

          <section id="profil" className="grid gap-4 lg:grid-cols-2">
            <InfoCard title="Profil Saya" icon={UserRound}>
              <InfoRow label="Nama" value={profile?.full_name || registration?.nama} />
              <InfoRow label="Email" value={profile?.email || user.email} />
              <InfoRow label="Username" value={profile?.username} />
            </InfoCard>
            <InfoCard title="Pendaftaran Saya" icon={ClipboardList}>
              <InfoRow label="Nomor Referensi" value={registration?.registration_reference} />
              <InfoRow label="Jalur" value={registration?.jalur} />
              <InfoRow label="Jenjang" value={registration?.jenjang_pendidikan} />
              <InfoRow label="Program Studi" value={registration?.jurusan} />
            </InfoCard>
          </section>

          <section id="dokumen" className="grid gap-4 lg:grid-cols-3">
            <InfoCard title="Dokumen Saya" icon={FileText}><EmptyFeature text="Status dokumen dan upload ulang akan dihubungkan ke data Storage pendaftaran." /></InfoCard>
            <InfoCard title="Pembayaran" icon={CreditCard} id="pembayaran"><EmptyFeature text="Instruksi dan status pembayaran akan diaktifkan pada tahap pembayaran." /></InfoCard>
            <InfoCard title="Pengumuman" icon={Megaphone} id="pengumuman"><EmptyFeature text="Belum ada pengumuman khusus untuk akun Anda." /></InfoCard>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <InfoCard title="Pesan & Bantuan" icon={MessageCircle} id="bantuan"><EmptyFeature text="Pesan resmi dari admin akan tampil di sini." /></InfoCard>
            <InfoCard title="Akademik" icon={BookOpen} id="akademik"><EmptyFeature text="Menu akademik akan aktif setelah status Anda masuk tahap mahasiswa/peserta aktif." /></InfoCard>
            <InfoCard title="Notifikasi" icon={Bell} id="notifikasi"><EmptyFeature text="Notifikasi status, dokumen, pembayaran, dan pengumuman akan tampil di sini." /></InfoCard>
          </section>

          {registration?.notes ? <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5"><div className="flex items-start gap-3"><HelpCircle className="mt-0.5 size-5 text-blue-700" /><div><h2 className="font-black text-slate-900">Catatan dari Admin</h2><p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{registration.notes}</p></div></div></section> : null}

          <section id="pengaturan" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-start gap-3"><Settings className="mt-0.5 size-5 text-slate-500" /><div><h2 className="font-black text-slate-900">Pengaturan Akun</h2><p className="mt-1 text-sm text-slate-500">Akun Anda dibuat dan dikelola melalui proses verifikasi admin.</p></div></div>
          </section>
        </main>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof CheckCircle2 }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 grid size-10 place-items-center rounded-xl bg-yellow-100 text-slate-900"><Icon className="size-5" /></div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 break-words text-lg font-black text-slate-900">{value}</p></div>;
}
function InfoCard({ title, icon: Icon, children, id }: { title: string; icon: typeof CheckCircle2; children: React.ReactNode; id?: string }) {
  return <section id={id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-slate-100"><Icon className="size-5 text-slate-700" /></div><h2 className="font-black text-slate-900">{title}</h2></div>{children}</section>;
}
function InfoRow({ label, value }: { label: string; value: string | null | undefined }) { return <div className="flex flex-col gap-1 border-t border-slate-100 py-3 first:border-t-0"><span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span><span className="break-words text-sm font-semibold text-slate-700">{value || "-"}</span></div>; }
function EmptyFeature({ text }: { text: string }) { return <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">{text}</div>; }
