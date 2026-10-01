import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, CheckCircle2, Clock, XCircle, FileText, Search, RefreshCw, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Dashboard Admin - Sentra Layanan UT Arek Malang" }],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  // Fetch data pendaftar dari Supabase
  const { data: registrations = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Mutasi untuk mengubah status verifikasi
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      const { error } = await supabase
        .from("registrations")
        .update({ status_pendaftaran: newStatus })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-registrations"] });
    },
  });

  // Filter data berdasarkan pencarian dan status
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch = 
      reg.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.jurusan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "Semua" || reg.status_pendaftaran === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-[#f8f9fa] font-sans pb-12">
      {/* Header Admin */}
      <header className="bg-slate-900 text-white shadow-md px-6 py-4 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-7 h-7 text-yellow-400" />
          <div>
            <h1 className="font-extrabold text-lg leading-tight">Dashboard Admin SALUT</h1>
            <p className="text-xs text-slate-400">Sentra Layanan Universitas Terbuka Arek Malang</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800 px-3.5 py-2 rounded-full border border-slate-700 transition">
            ← Kembali ke Website Utama
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Statistik Singkat */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-lg"><FileText className="w-6 h-6"/></div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Total Pendaftar</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{registrations.length}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="bg-yellow-50 text-yellow-600 p-3 rounded-lg"><Clock className="w-6 h-6"/></div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Menunggu Verifikasi</p>
              <h3 className="text-2xl font-extrabold text-slate-900">
                {registrations.filter(r => r.status_pendaftaran === 'Menunggu Verifikasi').length}
              </h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="bg-green-50 text-green-600 p-3 rounded-lg"><CheckCircle2 className="w-6 h-6"/></div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Disetujui</p>
              <h3 className="text-2xl font-extrabold text-slate-900">
                {registrations.filter(r => r.status_pendaftaran === 'Disetujui').length}
              </h3>
            </div>
          </div>
        </div>

        {/* Panel Kontrol & Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, email, atau jurusan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold bg-white text-slate-700 focus:outline-none"
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Ditolak">Ditolak</option>
            </select>

            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition"
              title="Muat Ulang Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabel Data Pendaftar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 font-bold">Memuat data pendaftar dari database...</div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-bold">Tidak ada data pendaftar yang ditemukan.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Calon Mahasiswa</th>
                    <th className="py-4 px-6">Kontak</th>
                    <th className="py-4 px-6">Pilihan Program</th>
                    <th className="py-4 px-6">Status Pendaftaran</th>
                    <th className="py-4 px-6 text-center">Aksi Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-slate-900">{reg.nama_lengkap}</div>
                        <div className="text-xs text-slate-500">Ibu: {reg.nama_ibu_kandung} • TTL: {reg.tempat_lahir}, {reg.tanggal_lahir}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800">{reg.email}</div>
                        <div className="text-xs text-slate-500">{reg.nomor_hp}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-blue-700">{reg.jenjang_pendidikan}</div>
                        <div className="text-xs font-semibold text-slate-600">{reg.jurusan}</div>
                        <span className="inline-block mt-1 bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                          Jalur: {reg.jalur_pendaftaran}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                          reg.status_pendaftaran === 'Disetujui' 
                            ? 'bg-green-100 text-green-800' 
                            : reg.status_pendaftaran === 'Ditolak'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reg.status_pendaftaran === 'Disetujui' && <CheckCircle2 className="w-3.5 h-3.5"/>}
                          {reg.status_pendaftaran === 'Ditolak' && <XCircle className="w-3.5 h-3.5"/>}
                          {reg.status_pendaftaran === 'Menunggu Verifikasi' && <Clock className="w-3.5 h-3.5"/>}
                          {reg.status_pendaftaran}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: reg.id, newStatus: "Disetujui" })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              reg.status_pendaftaran === 'Disetujui'
                                ? 'bg-green-600 text-white shadow-xs'
                                : 'bg-white text-slate-700 hover:bg-green-50 hover:text-green-700'
                            }`}
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: reg.id, newStatus: "Ditolak" })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              reg.status_pendaftaran === 'Ditolak'
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'bg-white text-slate-700 hover:bg-red-50 hover:text-red-700'
                            }`}
                          >
                            Tolak
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
