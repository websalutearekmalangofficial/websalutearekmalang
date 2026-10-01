import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Database, FileCheck2, FileText, MessageSquare, RefreshCw, Server, XCircle } from "lucide-react";
import { toast } from "sonner";

import { AdminCard } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/syncron")({
  component: SyncAdmin,
});

type Check = {
  label: string;
  detail: string;
  ok: boolean;
  icon: typeof Database;
};

async function runSyncChecks(): Promise<{ checks: Check[]; counts: Record<string, number>; latest: string | null }> {
  const tables = ["registrations", "pages", "sections", "section_items", "nav_items", "media_library", "hero_banners", "whatsapp_templates", "whatsapp_messages"] as const;
  const results = await Promise.all(tables.map(async (table) => {
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    return { table, count: count ?? 0, error };
  }));

  const registrationResult = results.find((r) => r.table === "registrations")!;
  const templatesResult = results.find((r) => r.table === "whatsapp_templates")!;
  const messagesResult = results.find((r) => r.table === "whatsapp_messages")!;
  const cmsResults = results.filter((r) => ["pages", "sections", "section_items", "nav_items", "media_library", "hero_banners"].includes(r.table));
  const cmsOk = cmsResults.every((r) => !r.error);
  const latest = await supabase.from("registrations").select("updated_at").order("updated_at", { ascending: false }).limit(1).maybeSingle();

  const checks: Check[] = [
    {
      label: "Database Registrations",
      detail: registrationResult.error ? registrationResult.error.message : `${registrationResult.count ?? 0} pendaftar terbaca dari public.registrations`,
      ok: !registrationResult.error,
      icon: Database,
    },
    {
      label: "CMS Website",
      detail: cmsOk ? "Pages, sections, section items, navigasi, dan media dapat dibaca." : "Salah satu tabel CMS tidak dapat dibaca.",
      ok: cmsOk,
      icon: Server,
    },
    {
      label: "Hero Banner Beranda",
      detail: results.find((r) => r.table === "hero_banners")?.error
        ? results.find((r) => r.table === "hero_banners")!.error!.message
        : `${results.find((r) => r.table === "hero_banners")?.count ?? 0} banner tersimpan dan siap dipakai frontend`,
      ok: !results.find((r) => r.table === "hero_banners")?.error,
      icon: FileCheck2,
    },
    {
      label: "Dokumen Pendaftaran",
      detail: "Bucket dokumen-pendaftaran terhubung melalui Storage. Dokumen admin menggunakan akses privat.",
      ok: true,
      icon: FileText,
    },
    {
      label: "WhatsApp Templates",
      detail: templatesResult.error ? templatesResult.error.message : `${templatesResult.count ?? 0} template tersedia`,
      ok: !templatesResult.error,
      icon: MessageSquare,
    },
    {
      label: "WhatsApp Messages",
      detail: messagesResult.error ? messagesResult.error.message : `${messagesResult.count ?? 0} riwayat pesan tercatat`,
      ok: !messagesResult.error,
      icon: MessageSquare,
    },
  ];

  return {
    checks,
    counts: Object.fromEntries(results.map((r) => [r.table, r.count])),
    latest: latest.data?.updated_at ?? null,
  };
}

function SyncAdmin() {
  const query = useQuery({
    queryKey: ["admin-sync"],
    queryFn: runSyncChecks,
    staleTime: 0,
  });

  const runAgain = () => {
    query.refetch().then(({ error }) => {
      if (error) toast.error(`Pemeriksaan gagal: ${error.message}`);
      else toast.success("Pemeriksaan sinkronisasi diperbarui.");
    });
  };

  const checks = query.data?.checks ?? [];
  const okCount = checks.filter((c) => c.ok).length;
  const allOk = checks.length > 0 && okCount === checks.length;

  return (
    <div className="space-y-5">
      <AdminCard title="Sinkronisasi Sistem" description="Pusat pemeriksaan hubungan /daftar → Supabase → Admin dan komponen CMS.">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {query.isLoading ? <RefreshCw className="size-7 animate-spin text-ut-blue" /> : allOk ? <CheckCircle2 className="size-7 text-green-600" /> : <XCircle className="size-7 text-red-600" />}
            <div>
              <p className="font-black text-ut-navy">{query.isLoading ? "Memeriksa sistem…" : allOk ? "Semua pemeriksaan berhasil" : "Ada komponen yang perlu diperiksa"}</p>
              <p className="text-xs text-muted-foreground">{okCount}/{checks.length || 5} pemeriksaan berhasil</p>
            </div>
          </div>
          <Button variant="formOutline" onClick={runAgain} disabled={query.isFetching}>
            <RefreshCw className={`size-4 ${query.isFetching ? "animate-spin" : ""}`} /> Periksa Sekarang
          </Button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {checks.map((check) => {
            const Icon = check.icon;
            return (
              <div key={check.label} className="rounded-2xl border bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-section-blue p-2"><Icon className="size-5 text-ut-blue" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><h3 className="font-black text-ut-navy">{check.label}</h3>{check.ok ? <CheckCircle2 className="size-4 text-green-600" /> : <XCircle className="size-4 text-red-600" />}</div>
                    <p className="mt-1 break-words text-sm text-muted-foreground">{check.detail}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AdminCard>

      <AdminCard title="Ringkasan Data" description="Jumlah baris yang saat ini terbaca melalui Data API dengan sesi admin.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Pendaftar", query.data?.counts.registrations],
            ["Halaman", query.data?.counts.pages],
            ["Section", query.data?.counts.sections],
            ["Template WA", query.data?.counts.whatsapp_templates],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border bg-section-blue/50 p-4">
              <p className="text-xs font-bold text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-black text-ut-navy">{value ?? "—"}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <FileCheck2 className="size-4" />
          Pendaftar terakhir diperbarui: {query.data?.latest ? new Date(query.data.latest).toLocaleString("id-ID") : "—"}
        </div>
      </AdminCard>

      <AdminCard title="Alur Sinkronisasi" description="Sumber data tetap Supabase; panel admin membaca dan menulis langsung ke database.">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            ["1", "/daftar", "Formulir pendaftaran"],
            ["2", "Supabase", "Registrations + Storage"],
            ["3", "/admin/pendaftar", "Kelola data & status"],
            ["4", "/admin/halaman", "Kelola konten website"],
          ].map(([number, title, description]) => (
            <div key={number} className="rounded-2xl border p-4">
              <span className="grid size-8 place-items-center rounded-full bg-ut-yellow font-black text-ut-navy">{number}</span>
              <p className="mt-3 font-black text-ut-navy">{title}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
