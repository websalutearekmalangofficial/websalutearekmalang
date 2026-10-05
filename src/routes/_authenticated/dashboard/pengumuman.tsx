import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Bell, LogOut, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/pengumuman")({
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    const { data: role, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).maybeSingle();
    if (roleError) throw new Error("Role akun tidak dapat diverifikasi.");
    if (role?.role === "admin") throw redirect({ to: "/admin/pendaftar" });
    if (role?.role !== "user") throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: UserAnnouncementsPage,
});

type Announcement = { id: string; title: string; content: string; category: string; priority: number; published_at: string | null; expires_at: string | null; created_at: string; };

function UserAnnouncementsPage() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const announcementsQuery = useQuery({
    queryKey: ["user-announcements", user.id],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase.from("announcements").select("id,title,content,category,priority,published_at,expires_at,created_at").eq("is_published", true).or("target_user_id.is.null,target_user_id.eq." + user.id).or("published_at.is.null,published_at.lte." + now).or("expires_at.is.null,expires_at.gt." + now).order("priority", { ascending: false }).order("published_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Announcement[];
    },
  });
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) { toast.error("Gagal keluar dari akun."); return; }
    await navigate({ to: "/auth", replace: true });
  };
  const formatDate = (value: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date);
  };
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/dashboard" className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="Kembali ke Dashboard"><ArrowLeft className="size-4" /></Link>
            <div className="min-w-0"><p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Dashboard User</p><h1 className="truncate text-lg font-black text-slate-900">Pengumuman</h1></div>
          </div>
          <button type="button" onClick={signOut} className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="Keluar"><LogOut className="size-4" /></button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6 lg:p-8">
        <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm sm:p-8"><div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl bg-yellow-400 text-slate-950"><Megaphone className="size-6" /></div><div><p className="text-xs font-black uppercase tracking-wider text-slate-400">Informasi Resmi</p><h2 className="text-2xl font-black">Pengumuman untuk Anda</h2></div></div><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Informasi resmi dari Admin SALUT Arek Malang yang berkaitan dengan proses pendaftaran dan layanan Anda.</p></section>
        {announcementsQuery.isLoading ? <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Memuat pengumuman...</section> : announcementsQuery.error ? <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">Pengumuman tidak dapat dimuat. Silakan refresh halaman.</section> : announcementsQuery.data?.length ? <div className="space-y-4">{announcementsQuery.data.map((announcement) => <article key={announcement.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-yellow-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-slate-800">{announcement.category}</span>{announcement.priority > 0 ? <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white">Penting</span> : null}</div><h3 className="mt-3 text-xl font-black text-slate-900">{announcement.title}</h3></div><div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-400"><Bell className="size-4" />{formatDate(announcement.published_at || announcement.created_at)}</div></div><div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{announcement.content}</div></article>)}</div> : <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm"><Megaphone className="mx-auto size-10 text-slate-300" /><h3 className="mt-3 text-lg font-black text-slate-900">Belum Ada Pengumuman</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Pengumuman resmi akan tampil di halaman ini setelah Admin menerbitkannya.</p></section>}
      </main>
    </div>
  );
}