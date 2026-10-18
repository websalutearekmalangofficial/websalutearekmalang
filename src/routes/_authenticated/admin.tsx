import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  ClipboardList,
  ExternalLink,
  FileText,
  GraduationCap,
  ListOrdered,
  Settings,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { claimFirstAdmin } from "@/lib/admin-bootstrap.functions";
import { fetchIsAdmin } from "@/lib/admin-cms";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const menu = [
  { to: "/admin/pendaftar", label: "Pendaftaran", icon: ClipboardList, exact: false },
  { to: "/admin/halaman", label: "Halaman & Section", icon: ListOrdered, exact: false },
  { to: "/admin/navigasi", label: "Menu Navigasi", icon: Menu, exact: false },
  { to: "/admin/media", label: "Media / Dokumen", icon: FileText, exact: false },
  { to: "/admin/pengaturan", label: "Pengaturan", icon: Settings, exact: false },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin", userId],
    queryFn: () => fetchIsAdmin(userId!),
    enabled: Boolean(userId),
  });

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const result = await claimFirstAdmin();
      if (result.ok) {
        toast.success(result.message);
        await queryClient.invalidateQueries({ queryKey: ["is-admin"] });
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Gagal meminta akses admin.");
    } finally {
      setClaiming(false);
    }
  };

  const currentPath = location.pathname;

  if (isLoading || !userId) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8f9fa]">
        <p className="text-sm font-bold text-slate-700">Memuat panel…</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8f9fa] px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <ShieldCheck className="mx-auto mb-3 size-12 text-slate-700" aria-hidden="true" />
          <h1 className="text-xl font-black text-slate-900">Akun Anda belum berperan admin</h1>
          <p className="mt-2 text-sm text-slate-500">
            Hanya admin yang bisa mengelola konten. Jika Anda pemilik website dan belum ada admin sama sekali, klaim akses admin sekarang.
          </p>
          <div className="mt-5 grid gap-2">
            <Button variant="utYellow" size="form" onClick={handleClaim} disabled={claiming}>
              Klaim akses admin
            </Button>
            <Button variant="formOutline" size="form" onClick={handleSignOut}>
              <LogOut className="size-4" /> Keluar
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col bg-slate-900 text-white shadow-xl lg:flex">
        <div className="flex min-h-20 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-yellow-400 text-slate-900">
            <GraduationCap className="size-7" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-black tracking-wide">SALUT</p>
            <p className="text-[11px] font-semibold text-slate-300">UNIVERSITAS TERBUKA</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5" aria-label="Menu panel admin">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = item.exact ? currentPath === item.to : currentPath.startsWith(item.to);
            return (
              <Link
                key={item.label}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${
                  item.disabled
                    ? "cursor-not-allowed text-slate-500"
                    : active
                      ? "bg-yellow-400 text-slate-950 shadow-sm"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
                onMouseDown={(e) => {
                  if (item.disabled) e.preventDefault();
                }}
                aria-disabled={item.disabled}
              >
                <Icon className="size-5 shrink-0" />
                <span>{item.label}</span>
                {active && !item.disabled ? <span className="ml-auto size-2 rounded-full bg-slate-900" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-5" />
            Keluar
          </button>
        </div>
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/60" onClick={() => setSidebarOpen(false)} aria-label="Tutup menu" />
          <aside className="relative flex h-full w-72 flex-col bg-slate-900 text-white shadow-xl">
            <div className="flex min-h-20 items-center justify-between border-b border-white/10 px-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-yellow-400 text-slate-900">
                  <GraduationCap className="size-7" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-black">SALUT</p>
                  <p className="text-[11px] font-semibold text-slate-300">UNIVERSITAS TERBUKA</p>
                </div>
              </div>
              <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Tutup menu">
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5">
              {menu.map((item) => {
                const Icon = item.icon;
                const active = item.exact ? currentPath === item.to : currentPath.startsWith(item.to);
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    activeOptions={{ exact: item.exact }}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold ${
                      item.disabled
                        ? "cursor-not-allowed text-slate-500"
                        : active
                          ? "bg-yellow-400 text-slate-950"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                    onMouseDown={(e) => {
                      if (item.disabled) e.preventDefault();
                    }}
                    aria-disabled={item.disabled}
                  >
                    <Icon className="size-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-white/10 p-4">
              <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10">
                <LogOut className="size-5" /> Keluar
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
              aria-label="Buka menu"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black tracking-tight text-slate-900 sm:text-2xl">Dashboard Admin</h1>
              <p className="hidden text-xs font-medium text-slate-500 sm:block">Panel Pengelolaan SALUT Arek Malang</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              aria-label="Lihat Website"
            >
              <ExternalLink className="size-4" />
              <span className="hidden sm:inline">Lihat Website</span>
            </a>

            <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">AD</span>
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-black text-slate-900">Profile</span>
                <span className="block text-[10px] text-slate-500">Administrator</span>
              </span>
              <ChevronDown className="size-4 text-slate-500" />
            </button>
            {profileOpen ? (
              <div className="absolute right-0 top-12 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <LogOut className="size-4" /> Keluar
                </button>
              </div>
            ) : null}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] overflow-x-hidden bg-[#f8f9fa] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1500px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
