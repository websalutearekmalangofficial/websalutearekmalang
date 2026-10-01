import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, Phone, Building2, Camera, IdCard,
  Users, FileText, ClipboardList, Activity,
  CheckCircle2, XCircle, Trash2, Upload, Calendar, Mail, CheckSquare,
  CircleUserRound, Home, Menu, X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/daftar")({
  head: () => ({
    meta: [{ title: "Pendaftaran - Sentra Layanan UT Arek Malang" }],
  }),
  component: RegistrationPage,
});

const navLinks = ["Informasi", "Panduan", "Kontak"];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ut-sky/25 bg-hero-nav text-hero-foreground shadow-header">
      <div className="mx-auto grid min-h-16 w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-2.5 sm:gap-3 sm:py-3 md:min-h-20 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:px-8 lg:px-12">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label="Sentra Layanan UT Beranda">
          <div className="grid size-10 shrink-0 place-items-center rounded-full border border-hero-foreground/70 bg-hero-foreground/10 sm:size-11 md:size-12">
            <Building2 className="size-6 sm:size-7" aria-hidden="true" />
          </div>
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="min-w-0 leading-none">
              <p className="truncate text-xs font-black uppercase sm:text-sm md:text-base">UNIVERSITAS</p>
              <p className="truncate text-xs font-black uppercase sm:text-sm md:text-base">TERBUKA</p>
            </div>
            <span className="hidden h-10 w-px shrink-0 bg-hero-foreground/70 sm:block" aria-hidden="true" />
            <div className="hidden min-w-0 font-script text-2xl font-bold leading-none text-hero-foreground drop-shadow-title sm:block md:text-4xl">
              Sentra Layanan
              <span className="block font-display text-xl font-black tracking-normal md:text-2xl">UT</span>
            </div>
          </div>
        </Link>

        <nav className="hidden items-center justify-center gap-3 md:flex lg:gap-9" aria-label="Navigasi utama">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-ut-yellow px-4 py-2.5 text-sm font-black text-ut-navy shadow-yellow lg:px-5">
            <Home className="size-4" aria-hidden="true" />
            Beranda
          </Link>
          {navLinks.map((link) => (
            <a
              key={link}
              href={`/#${link.toLowerCase()}`}
              className="rounded-full px-2 py-1 text-sm font-bold text-hero-foreground/95 transition hover:text-ut-yellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-yellow"
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2 md:min-w-0">
          <Button variant="heroOutline" size="pill" className="shrink-0 px-3 text-[0.7rem] sm:px-4 sm:text-xs md:text-sm">
            <CircleUserRound className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Masuk / Daftar</span>
            <span className="sm:hidden">Masuk</span>
          </Button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-daftar"
            aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-hero-foreground/60 bg-hero-foreground/10 transition hover:bg-hero-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-yellow md:hidden"
          >
            {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav id="mobile-nav-daftar" className="border-t border-hero-foreground/20 px-4 pb-4 pt-3 md:hidden" aria-label="Navigasi mobile">
          <ul className="grid gap-2">
            <li>
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-ut-yellow px-4 py-3 text-sm font-black text-ut-navy"
              >
                <Home className="size-4" aria-hidden="true" />
                Beranda
              </Link>
            </li>
            {navLinks.map((link) => (
              <li key={link}>
                <a
                  href={`/#${link.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl bg-hero-foreground/10 px-4 py-3 text-sm font-bold text-hero-foreground transition hover:bg-hero-foreground/20"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

function RegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    namaLengkap: "",
    tempatLahir: "",
    tanggalLahir: "",
    agama: "",
    jenisKelamin: "",
    kewarganegaraan: "WNI",
    namaIbuKandung: "",
    alamatLengkap: "",
    telpRumah: "",
    nomorHp: "",
    nomorHp2: "",
    email: "",
    sosialMedia: {
      instagram: "",
      tiktok: "",
      facebook: "",
      x: "",
    },
    jalurPendaftaran: "Reguler",
    jenjangPendidikan: "Sarjana (S1)",
    fakultas: "FEB",
    jurusan: "S1 Manajemen",
  });

  const [documents, setDocuments] = useState<Record<string, File | null>>({
    pasFoto: null,
    ktp: null,
    kk: null,
    ijazah: null,
    transkrip: null,
    suratSehat: null,
  });

  const [agreements, setAgreements] = useState({
    dataBenar: false,
    setujuKetentuan: false,
  });

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const jumpToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!agreements.dataBenar || !agreements.setujuKetentuan) {
      alert("Harap centang semua pernyataan persetujuan sebelum mengirim.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { error: dbError } = await supabase.from("registrations").insert([
        {
          nama: formData.namaLengkap,
          tempat_lahir: formData.tempatLahir,
          tanggal_lahir: formData.tanggalLahir,
          agama: formData.agama,
          jenis_kelamin: formData.jenisKelamin,
          kewarganegaraan: formData.kewarganegaraan,
          nama_ibu_kandung: formData.namaIbuKandung,
          alamat_lengkap: formData.alamatLengkap,
          telp_rumah: formData.telpRumah || null,
          nomor_hp: formData.nomorHp,
          nomor_hp_2: formData.nomorHp2 || null,
          email: formData.email,
          sosial_media: formData.sosialMedia,
          jalur: formData.jalurPendaftaran,
          jenjang_pendidikan: formData.jenjangPendidikan,
          fakultas: formData.fakultas || null,
          jurusan: formData.jurusan,
          status: "Menunggu Verifikasi",
        },
      ]);

      if (dbError) throw dbError;

      for (const [key, file] of Object.entries(documents)) {
        if (file) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}_${key}.${fileExt}`;
          await supabase.storage.from("dokumen-pendaftaran").upload(fileName, file);
        }
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Gagal mengirim pendaftaran:", err);
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan data ke database.");
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setDocuments(prev => ({ ...prev, [id]: file }));
  };

  const handleRemoveFile = (id: string) => {
    setDocuments(prev => ({ ...prev, [id]: null }));
  };

  const steps = [
    { id: 1, label: "1. Data Diri" },
    { id: 2, label: "2. Jalur & Jurusan" },
    { id: 3, label: "3. Unggah Dokumen" },
    { id: 4, label: "4. Tinjau & Kirim" },
  ];

  const requiredDocs = [
    { id: "pasFoto", label: "1. Pas Foto (Background Merah/Biru)*", icon: Camera },
    { id: "ktp", label: "2. Kartu Tanda Penduduk (KTP)*", icon: IdCard },
    { id: "kk", label: "3. Kartu Keluarga (KK)*", icon: Users },
    { id: "ijazah", label: "4. Ijazah Terakhir (Asli)*", icon: FileText },
    { id: "transkrip", label: "5. Transkrip Nilai (Asli)*", icon: ClipboardList },
    { id: "suratSehat", label: "6. Surat Keterangan Sehat*", icon: Activity },
  ];

  const getJurusanOptions = () => {
    if (formData.jenjangPendidikan === "Diploma") {
      return ["D4 Pengelolaan Arsip dan Rekaman Informasi", "D3 Perpajakan", "D4 Kearsipan", "D3 Teknologi Informasi", "D4 Akuntansi Bisnis Digital", "D4 Manajemen Logistik", "D3 Penyiaran"];
    }
    if (formData.jenjangPendidikan === "Sarjana (S1)") {
      if (formData.fakultas === "FEB") return ["Manajemen", "Ekonomi Pembangunan", "Ekonomi Syariah", "Akuntansi", "Akuntansi Keuangan Publik", "Pariwisata", "Kewirausahaan"];
      if (formData.fakultas === "FKIP") return ["Pendidikan Bahasa dan Sastra Indonesia", "Pendidikan Bahasa Inggris", "Pendidikan Biologi", "Pendidikan Matematika", "Pendidikan Guru Sekolah Dasar (PGSD)", "Pendidikan Agama Islam"];
      if (formData.fakultas === "FST") return ["Statistika", "Matematika", "Biologi", "Teknologi Pangan", "Agribisnis", "Sistem Informasi", "Sains Data"];
      if (formData.fakultas === "FHISIP") return ["Ilmu Administrasi Publik", "Administrasi Bisnis", "Hukum", "Ilmu Pemerintahan", "Ilmu Komunikasi", "Sosiologi", "Sastra Inggris"];
    }
    if (formData.jenjangPendidikan === "Magister (S2)") {
      return ["Administrasi Publik (S2)", "Manajemen (S2)", "Ilmu Kelautan (S2)", "Pendidikan Matematika (S2)", "Pendidikan Dasar (S2)", "Hukum (S2)"];
    }
    if (formData.jenjangPendidikan === "Doktoral (S3)") {
      return ["Doktor Administrasi Publik (S3)", "Doktor Ilmu Manajemen (S3)"];
    }
    if (formData.jenjangPendidikan === "Profesi") return ["Pendidikan Profesi Guru (PPG)"];
    if (formData.jenjangPendidikan === "Sertifikat") return ["Program Sertifikat (MOOCs, BIPA, PMKM)"];
    return [];
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-[#f8f9fa] font-sans pb-12">
        <Header />
        <div className="max-w-4xl mx-auto px-4 md:px-6 pt-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-3xl font-extrabold text-yellow-500 mb-2">Pendaftaran Berhasil Dikirim!</h1>
            <p className="text-slate-700 font-medium mb-8">Data Anda berhasil disimpan ke database Supabase.</p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl mb-8">
              <p className="text-lg text-slate-800 font-bold mb-2">Status: <span className="bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full text-sm ml-2">Menunggu Verifikasi</span></p>
            </div>
            <Link to="/" className="bg-slate-900 text-white font-bold py-3 px-8 rounded-full">Kembali ke Beranda</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] font-sans pb-12">
      <Header />

      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Halaman Pendaftaran</h1>

        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl font-bold text-sm">
            Gagal: {errorMessage}
          </div>
        )}

        <div className="flex flex-wrap md:flex-nowrap items-center gap-1 bg-[#fde047] p-1 rounded-lg mb-6 overflow-hidden shadow-sm">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isPast = currentStep > step.id;
            return (
              <div key={step.id} className={`flex-1 min-w-[120px] text-center py-2.5 px-4 text-sm font-bold ${isActive ? "bg-[#1e293b] text-white rounded-md" : isPast ? "text-[#1e293b] opacity-70" : "text-[#1e293b] opacity-50"}`}>
                {step.label}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative min-h-[550px] flex flex-col">
          <div className="flex flex-col lg:flex-row w-full flex-grow relative z-10">
            {currentStep >= 3 && (
              <aside className="w-full lg:w-[30%] bg-slate-50/95 border-r border-slate-200 p-6 shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sticky top-6">
                  <h3 className="font-extrabold text-slate-800 border-b pb-3 mb-4 text-lg">Profil Pendaftar</h3>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p><span className="text-xs text-slate-500 block">Nama:</span> <strong className="text-slate-900">{formData.namaLengkap || "-"}</strong></p>
                    <p><span className="text-xs text-slate-500 block">Email:</span> <strong className="text-slate-900">{formData.email || "-"}</strong></p>
                    <p><span className="text-xs text-slate-500 block">No HP:</span> <strong className="text-slate-900">{formData.nomorHp || "-"}</strong></p>
                  </div>
                </div>
              </aside>
            )}

            <div className={`p-6 md:p-8 lg:p-10 ${currentStep >= 3 ? 'w-full lg:w-[70%]' : 'w-full md:w-3/5'}`}>
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Langkah 1: Data Diri Calon Mahasiswa</h2>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="font-extrabold text-slate-800 border-b pb-2">1. Data Diri</h3>
                    <input type="text" placeholder="Nama Lengkap" value={formData.namaLengkap} onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-white" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Tempat Lahir" value={formData.tempatLahir} onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-white" />
                      <input type="date" value={formData.tanggalLahir} onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-white" />
                    </div>
                    <select value={formData.agama} onChange={(e) => setFormData({ ...formData, agama: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-white">
                      <option value="">-- Pilih Agama --</option>
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                    </select>
                    <select value={formData.jenisKelamin} onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-white">
                      <option value="">-- Jenis Kelamin --</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                    <input type="text" placeholder="Nama Ibu Kandung" value={formData.namaIbuKandung} onChange={(e) => setFormData({ ...formData, namaIbuKandung: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-white" />
                  </div>

                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="font-extrabold text-slate-800 border-b pb-2">2. Kontak & Domisili</h3>
                    <textarea placeholder="Alamat Lengkap" rows={2} value={formData.alamatLengkap} onChange={(e) => setFormData({ ...formData, alamatLengkap: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-white" />
                    <input type="email" placeholder="Email Aktif" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-white" />
                    <input type="tel" placeholder="Nomor HP / WhatsApp" value={formData.nomorHp} onChange={(e) => setFormData({ ...formData, nomorHp: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-white" />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Langkah 2: Jalur & Program Studi</h2>
                  <select value={formData.jalurPendaftaran} onChange={(e) => setFormData({ ...formData, jalurPendaftaran: e.target.value })} className="w-full px-4 py-3 rounded-lg border bg-white">
                    <option value="Reguler">Reguler</option>
                    <option value="RPL">RPL</option>
                  </select>
                  <select value={formData.jenjangPendidikan} onChange={(e) => setFormData({ ...formData, jenjangPendidikan: e.target.value, fakultas: "", jurusan: "" })} className="w-full px-4 py-3 rounded-lg border bg-white">
                    <option value="Diploma">Diploma (D3 & D4)</option>
                    <option value="Sarjana (S1)">Sarjana (S1)</option>
                    <option value="Magister (S2)">Magister (S2)</option>
                    <option value="Doktoral (S3)">Doktoral (S3)</option>
                    <option value="Profesi">Pendidikan Profesi Guru (PPG)</option>
                  </select>
                  {formData.jenjangPendidikan === "Sarjana (S1)" && (
                    <select value={formData.fakultas} onChange={(e) => setFormData({ ...formData, fakultas: e.target.value, jurusan: "" })} className="w-full px-4 py-3 rounded-lg border bg-white">
                      <option value="FEB">Fakultas Ekonomi dan Bisnis (FEB)</option>
                      <option value="FKIP">Fakultas Keguruan dan Ilmu Pendidikan (FKIP)</option>
                      <option value="FST">Fakultas Sains dan Teknologi (FST)</option>
                      <option value="FHISIP">Fakultas Hukum, Ilmu Sosial, dan Ilmu Politik (FHISIP)</option>
                    </select>
                  )}
                  <select value={formData.jurusan} onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })} className="w-full px-4 py-3 rounded-lg border bg-white">
                    <option value="" disabled>-- Pilih Program Studi --</option>
                    {getJurusanOptions().map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              )}

              {currentStep === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requiredDocs.map(doc => {
                    const file = documents[doc.id];
                    const isUploaded = !!file;
                    return (
                      <div key={doc.id} className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center relative bg-white">
                        <span className="text-xs font-bold mb-2">{doc.label}</span>
                        {!isUploaded ? (
                          <>
                            <input type="file" accept=".pdf,.jpg,.jpeg" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(doc.id, e)} />
                            <span className="bg-slate-100 text-xs font-bold px-3 py-1.5 rounded border">Pilih File</span>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-green-600 truncate">{file.name}</span>
                            <button onClick={() => handleRemoveFile(doc.id)} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Langkah 4: Tinjau & Kirim</h2>
                  <div className="bg-slate-100 p-4 rounded-xl text-sm space-y-1">
                    <p><strong>Nama:</strong> {formData.namaLengkap}</p>
                    <p><strong>Email:</strong> {formData.email}</p>
                    <p><strong>Jenjang / Jurusan:</strong> {formData.jenjangPendidikan} - {formData.jurusan}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-start gap-2 text-sm font-semibold">
                      <input type="checkbox" checked={agreements.dataBenar} onChange={(e) => setAgreements({...agreements, dataBenar: e.target.checked})} />
                      <span>Data yang saya berikan adalah benar dan sah.</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm font-semibold">
                      <input type="checkbox" checked={agreements.setujuKetentuan} onChange={(e) => setAgreements({...agreements, setujuKetentuan: e.target.checked})} />
                      <span>Saya menyetujui ketentuan pendaftaran.</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t bg-white p-5 flex justify-between items-center mt-auto">
            {currentStep > 1 ? <button onClick={handlePrev} className="bg-white border px-6 py-2.5 rounded-full font-bold">← Sebelumnya</button> : <div/>}
            {currentStep < 4 ? (
              <button onClick={handleNext} className="bg-[#fde047] px-8 py-2.5 rounded-full font-bold shadow">Selanjutnya →</button>
            ) : (
              <button disabled={isSubmitting} onClick={handleSubmit} className="bg-[#fde047] px-8 py-2.5 rounded-full font-bold shadow">
                {isSubmitting ? "Mengirim ke Database..." : "✓ Kirim Pendaftaran"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
