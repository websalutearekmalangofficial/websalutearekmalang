import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, Phone, Camera, IdCard,
  Users, FileText, ClipboardList, Activity,
  CheckCircle2, XCircle, Trash2, Upload, Calendar, Mail, CheckSquare,
  CircleUserRound, Home, Menu, X, Printer, Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PublicHeader, PublicFooter } from "@/components/public-site-chrome";

export const Route = createFileRoute("/daftar")({
  head: () => ({
    meta: [{ title: "Pendaftaran - Sentra Layanan UT Arek Malang" }],
  }),
  component: RegistrationPage,
});

const navLinks = ["Informasi", "Panduan", "Kontak"];

function RegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // Menyimpan ID Referensi Pendaftaran setelah berhasil
  const [registrationRefId, setRegistrationRefId] = useState("");

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
      const filesToUpload = Object.entries(documents).filter((entry): entry is [string, File] => Boolean(entry[1]));

      for (const [, file] of filesToUpload) {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File "${file.name}" melebihi batas 10 MB.`);
        }
        if (!["application/pdf", "image/jpeg", "image/jpg"].includes(file.type)) {
          throw new Error(`Format file "${file.name}" tidak didukung. Gunakan PDF atau JPG/JPEG.`);
        }
      }

      // Pendaftaran publik diproses melalui Edge Function agar anon tidak perlu
      // memiliki SELECT access ke seluruh tabel registrations hanya untuk mendapatkan
      // ID dan nomor referensi milik pendaftaran yang baru dibuat.
      const { data: submitResult, error: submitError } = await supabase.functions.invoke("submit-registration", {
        body: {
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
      });

      if (submitError) {
        throw new Error(submitResult?.error || submitError.message || "Pendaftaran gagal dikirim ke server.");
      }

      const registration = submitResult?.registration;
      if (!registration?.id) {
        throw new Error("Pendaftaran tersimpan tetapi ID pendaftaran tidak dapat diperoleh.");
      }

      const uploadedPaths: string[] = [];

      for (const [key, file] of filesToUpload) {
        const fileExt = file.name.split(".").pop()?.toLowerCase();
        const filePath = `${registration.id}/${key}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("dokumen-pendaftaran")
          .upload(filePath, file, { upsert: false });

        if (uploadError) {
          if (uploadedPaths.length) {
            await supabase.storage.from("dokumen-pendaftaran").remove(uploadedPaths);
          }
          await supabase
            .from("registrations")
            .update({ status: "Menunggu Upload Dokumen" })
            .eq("id", registration.id);
          throw new Error(`Dokumen "${file.name}" gagal diunggah: ${uploadError.message}`);
        }

        uploadedPaths.push(filePath);
      }

      // Referensi dibuat oleh database dan menjadi identitas tetap pendaftaran.
      setRegistrationRefId(registration.registration_reference || "");

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

  // HALAMAN SUKSES (REDESAIN MENGKUTI MOCKUP)
  if (isSuccess) {
    return (
      <main className="min-h-screen bg-[#f8f9fa] font-sans pb-12">
        <PublicHeader />
        <div className="mx-auto w-full max-w-4xl px-4 pt-6 sm:px-6 md:pt-10">
          <div className="mb-6 rounded-t-2xl bg-white p-6 md:p-10 shadow-sm border border-slate-200">
            <h1 className="text-3xl font-extrabold text-[#d2a32c] sm:text-4xl mb-3 tracking-tight">Pendaftaran Berhasil Dikirim!</h1>
            <p className="text-slate-600 font-medium md:text-lg mb-8">Terima kasih atas pendaftaran Anda. Informasi pendaftaran Anda telah kami terima dan akan segera diproses.</p>
            
            {/* Box Status Warna Kuning */}
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 overflow-hidden mb-8 shadow-sm">
              <div className="p-5 md:p-6 border-b border-yellow-200 bg-[#fdf8e7]">
                <p className="text-sm md:text-base text-slate-800">Nomor Referensi Pendaftaran: <span className="font-extrabold text-lg md:text-xl text-slate-900 ml-1">{registrationRefId || "Menyiapkan..."}</span></p>
              </div>
              <div className="p-5 md:p-6 bg-white">
                <p className="text-sm md:text-base text-slate-800">Status Pendaftaran: <span className="font-extrabold text-[#d2a32c] ml-1">Menunggu Verifikasi</span></p>
              </div>
            </div>

            {/* Box Langkah Selanjutnya Abu-abu dengan Image/Icon Background */}
            <div className="relative rounded-2xl bg-slate-100 p-6 md:p-8 overflow-hidden mb-8 border border-slate-200">
              {/* Gambar/Icon Background Abstrak (Sebagai ganti gambar mahasiswa) */}
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
                <Users className="w-64 h-64 text-slate-900" />
              </div>

              <div className="relative z-10 flex items-start gap-4 mb-4">
                <Calendar className="w-6 h-6 text-slate-700 mt-1 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg mb-2">Langkah Selanjutnya</h3>
                  <p className="text-slate-700 font-medium mb-4 leading-relaxed">1. Tim Admin kami akan memverifikasi dokumen Anda dalam waktu 3-5 hari kerja.</p>
                </div>
              </div>
              
              <div className="relative z-10 flex items-start gap-4 mb-4">
                <Mail className="w-6 h-6 text-slate-700 mt-1 shrink-0" />
                <div>
                  <p className="text-slate-700 font-medium mb-4 leading-relaxed">2. Nomor Induk Mahasiswa (NIM) sementara dan panduan pembayaran akan dikirimkan ke email pendaftar: '<strong className="text-slate-900">{formData.email}</strong>'.</p>
                </div>
              </div>

              <div className="relative z-10 flex items-start gap-4">
                <CheckSquare className="w-6 h-6 text-slate-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-700 font-medium leading-relaxed">3. Mohon cek email Anda secara berkala, termasuk folder spam.</p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 mb-8">Periksa email Anda secara berkala.</h3>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center">
              <button 
                onClick={() => window.print()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-[#facc15] px-6 py-3 text-sm font-black text-slate-900 shadow-sm transition hover:bg-yellow-400"
              >
                Cetak Bukti Pendaftaran (PDF) <CheckCircle2 className="w-4 h-4 ml-1" />
              </button>
              
              <Link 
                to="/"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
              >
                Lihat Status Pendaftaran
              </Link>
              
              <Link 
                to="/"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
          <div className="px-4 md:px-0 mt-6 pb-12">
             <p className="text-slate-600 font-medium">Selamat bergabung di Universitas Terbuka!</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] font-sans pb-12">
      <PublicHeader />

      <div className="mx-auto w-full max-w-6xl px-3 pb-6 pt-4 sm:px-5 sm:pt-6 lg:px-8">
        <div className="mb-5 text-center sm:mb-7 sm:text-left">
          <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.18em] text-yellow-600">Sentra Layanan UT Arek Malang</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Formulir Pendaftaran</h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-base">Lengkapi data secara bertahap. Anda dapat kembali ke langkah sebelumnya kapan saja.</p>
        </div>

        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl font-bold text-sm">
            Gagal: {errorMessage}
          </div>
        )}

        <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-2xl border border-yellow-200 bg-yellow-50 p-1.5 shadow-sm sm:grid-cols-4 sm:gap-1 md:mb-6">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isPast = currentStep > step.id;
            return (
              <div key={step.id} className={`min-w-0 rounded-xl px-2 py-2.5 text-center text-[11px] font-extrabold leading-tight transition sm:px-3 sm:text-sm ${isActive ? "bg-slate-900 text-white shadow-sm" : isPast ? "bg-white text-slate-800" : "text-slate-500"}`}>
                {step.label}
              </div>
            );
          })}
        </div>

        <div className="relative flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:rounded-3xl">
          <div className="relative z-10 flex w-full flex-1 flex-col lg:flex-row">
            <div className="w-full min-w-0 p-4 sm:p-6 lg:p-8">
              {currentStep === 1 && (
                <div className="space-y-5 sm:space-y-6">
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-yellow-600">Langkah 1 dari 4</p>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">Data Diri Calon Mahasiswa</h2>
                    <p className="mt-1 text-sm text-slate-500">Isi identitas dan informasi kontak yang aktif.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-6">
                    <h3 className="mb-5 border-b border-slate-200 pb-3 text-sm font-black uppercase tracking-wide text-slate-800">1. Data Diri</h3>
                    <div className="space-y-5">
                      <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">Nama Lengkap</label>
                        <input type="text" placeholder="Masukkan nama lengkap" value={formData.namaLengkap} onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
                      </div>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-bold text-slate-700">Tempat Lahir</label>
                          <input type="text" placeholder="Masukkan tempat lahir" value={formData.tempatLahir} onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-bold text-slate-700">Tanggal Lahir</label>
                          <input type="date" value={formData.tanggalLahir} onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-bold text-slate-700">Agama</label>
                          <select value={formData.agama} onChange={(e) => setFormData({ ...formData, agama: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
                            <option value="">Pilih agama</option>
                            <option value="Islam">Islam</option><option value="Kristen">Kristen</option><option value="Katolik">Katolik</option><option value="Hindu">Hindu</option><option value="Buddha">Buddha</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-bold text-slate-700">Jenis Kelamin</label>
                          <select value={formData.jenisKelamin} onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
                            <option value="">Pilih jenis kelamin</option>
                            <option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">Nama Ibu Kandung</label>
                        <input type="text" placeholder="Masukkan nama ibu kandung" value={formData.namaIbuKandung} onChange={(e) => setFormData({ ...formData, namaIbuKandung: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
                    <h3 className="mb-5 border-b border-slate-200 pb-3 text-sm font-black uppercase tracking-wide text-slate-800">2. Kontak & Domisili</h3>
                    <div className="space-y-5">
                      <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">Alamat Lengkap</label>
                        <textarea placeholder="Masukkan alamat lengkap" rows={3} value={formData.alamatLengkap} onChange={(e) => setFormData({ ...formData, alamatLengkap: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">Email Aktif</label>
                        <input type="email" placeholder="Masukkan email aktif" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">Nomor HP / WhatsApp</label>
                        <input type="tel" placeholder="Masukkan nomor HP / WhatsApp" value={formData.nomorHp} onChange={(e) => setFormData({ ...formData, nomorHp: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-5 sm:space-y-6">
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-yellow-600">Langkah 2 dari 4</p>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">Jalur & Program Studi</h2>
                    <p className="mt-1 text-sm text-slate-500">Tentukan jalur, jenjang, fakultas, dan program studi yang dipilih.</p>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">Jalur Pendaftaran</label>
                      <select value={formData.jalurPendaftaran} onChange={(e) => setFormData({ ...formData, jalurPendaftaran: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
                        <option value="Reguler">Reguler</option><option value="RPL">RPL</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">Program Pendidikan / Jenjang</label>
                      <select value={formData.jenjangPendidikan} onChange={(e) => setFormData({ ...formData, jenjangPendidikan: e.target.value, fakultas: "", jurusan: "" })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
                        <option value="Diploma">Diploma (D3 & D4)</option><option value="Sarjana (S1)">Sarjana (S1)</option><option value="Magister (S2)">Magister (S2)</option><option value="Doktoral (S3)">Doktoral (S3)</option><option value="Profesi">Pendidikan Profesi Guru (PPG)</option>
                      </select>
                    </div>
                    {formData.jenjangPendidikan === "Sarjana (S1)" && (
                      <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">Fakultas</label>
                        <select value={formData.fakultas} onChange={(e) => setFormData({ ...formData, fakultas: e.target.value, jurusan: "" })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
                          <option value="FEB">Fakultas Ekonomi dan Bisnis (FEB)</option><option value="FKIP">Fakultas Keguruan dan Ilmu Pendidikan (FKIP)</option><option value="FST">Fakultas Sains dan Teknologi (FST)</option><option value="FHISIP">Fakultas Hukum, Ilmu Sosial, dan Ilmu Politik (FHISIP)</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">Jurusan / Program Studi</label>
                      <select value={formData.jurusan} onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
                        <option value="" disabled>-- Pilih Program Studi --</option>
                        {getJurusanOptions().map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-5">
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-yellow-600">Langkah 3 dari 4</p>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">Unggah Dokumen</h2>
                    <p className="mt-1 text-sm text-slate-500">Gunakan file PDF, JPG, atau JPEG dengan ukuran maksimal 10 MB per dokumen.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {requiredDocs.map(doc => {
                    const file = documents[doc.id];
                    const isUploaded = !!file;
                    return (
                      <div key={doc.id} className="relative flex min-h-36 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-4 text-center transition hover:border-yellow-400 hover:bg-yellow-50/30">
                        <doc.icon className="mb-2 size-7 text-slate-400" aria-hidden="true" />
                        <span className="text-xs font-bold leading-5 text-slate-700 sm:text-sm">{doc.label}</span>
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
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-yellow-600">Langkah 4 dari 4</p>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">Tinjau & Kirim Permohonan</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">Harap tinjau semua informasi Anda di bawah ini sebelum mengirim. Data yang dikirim tidak dapat diubah.</p>
                  </div>

                  <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h3 className="text-base font-black text-slate-900">Profil Pendaftar Saat Ini</h3><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">Preview Data</span></div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div><p className="text-xs font-semibold text-slate-500">Nama</p><p className="mt-1 font-bold text-slate-900">{formData.namaLengkap || "-"}</p></div>
                      <div><p className="text-xs font-semibold text-slate-500">Sekolah Asal</p><p className="mt-1 font-bold text-slate-900">-</p></div>
                      <div><p className="text-xs font-semibold text-slate-500">Email</p><p className="mt-1 break-all font-bold text-slate-900">{formData.email || "-"}</p></div>
                      <div><p className="text-xs font-semibold text-slate-500">Nomor HP / WhatsApp</p><p className="mt-1 font-bold text-slate-900">{formData.nomorHp || "-"}</p></div>
                      <div><p className="text-xs font-semibold text-slate-500">Jalur Pendaftaran</p><p className="mt-1 font-bold text-slate-900">{formData.jalurPendaftaran || "-"}</p></div>
                      <div><p className="text-xs font-semibold text-slate-500">Jurusan Pendaftaran</p><p className="mt-1 font-bold text-slate-900">{formData.jurusan || "-"}</p></div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-base font-black text-slate-900">1. Ringkasan Data Diri</h3><button type="button" onClick={() => setCurrentStep(1)} className="text-sm font-bold text-yellow-700 hover:text-yellow-800">Ubah</button></div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><p className="text-xs font-semibold text-slate-500">Nama Lengkap</p><p className="mt-1 font-semibold text-slate-900">{formData.namaLengkap || "-"}</p></div>
                      <div><p className="text-xs font-semibold text-slate-500">Tempat, Tanggal Lahir</p><p className="mt-1 font-semibold text-slate-900">{[formData.tempatLahir, formData.tanggalLahir].filter(Boolean).join(", ") || "-"}</p></div>
                      <div><p className="text-xs font-semibold text-slate-500">Jenis Kelamin</p><p className="mt-1 font-semibold text-slate-900">{formData.jenisKelamin || "-"}</p></div>
                      <div><p className="text-xs font-semibold text-slate-500">Agama</p><p className="mt-1 font-semibold text-slate-900">{formData.agama || "-"}</p></div>
                      <div><p className="text-xs font-semibold text-slate-500">Kewarganegaraan</p><p className="mt-1 font-semibold text-slate-900">{formData.kewarganegaraan || "-"}</p></div>
                      <div><p className="text-xs font-semibold text-slate-500">Nama Ibu Kandung</p><p className="mt-1 font-semibold text-slate-900">{formData.namaIbuKandung || "-"}</p></div>
                      <div className="sm:col-span-2"><p className="text-xs font-semibold text-slate-500">Alamat Lengkap</p><p className="mt-1 font-semibold text-slate-900">{formData.alamatLengkap || "-"}</p></div>
                      <div><p className="text-xs font-semibold text-slate-500">Telepon Rumah</p><p className="mt-1 font-semibold text-slate-900">{formData.telpRumah || "-"}</p></div>
                      <div><p className="text-xs font-semibold text-slate-500">Nomor HP / WhatsApp</p><p className="mt-1 font-semibold text-slate-900">{formData.nomorHp || "-"}</p></div>
                      <div><p className="text-xs font-semibold text-slate-500">Nomor HP Alternatif</p><p className="mt-1 font-semibold text-slate-900">{formData.nomorHp2 || "-"}</p></div>
                      <div><p className="text-xs font-semibold text-slate-500">Email Aktif</p><p className="mt-1 break-all font-semibold text-slate-900">{formData.email || "-"}</p></div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-base font-black text-slate-900">2. Pilihan Program & Jalur</h3><button type="button" onClick={() => setCurrentStep(2)} className="text-sm font-bold text-yellow-700 hover:text-yellow-800">Ubah</button></div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><p className="text-xs font-semibold text-slate-500">Jalur Pendaftaran</p><p className="mt-1 font-semibold text-slate-900">{formData.jalurPendaftaran || "-"}</p></div>
                      <div><p className="text-xs font-semibold text-slate-500">Program Pendidikan / Jenjang</p><p className="mt-1 font-semibold text-slate-900">{formData.jenjangPendidikan || "-"}</p></div>
                      <div><p className="text-xs font-semibold text-slate-500">Fakultas</p><p className="mt-1 font-semibold text-slate-900">{formData.fakultas || "-"}</p></div>
                      <div><p className="text-xs font-semibold text-slate-500">Jurusan / Program Studi</p><p className="mt-1 font-semibold text-slate-900">{formData.jurusan || "-"}</p></div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-base font-black text-slate-900">3. Ringkasan Dokumen Diunggah</h3><button type="button" onClick={() => setCurrentStep(3)} className="text-sm font-bold text-yellow-700 hover:text-yellow-800">Ubah</button></div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[["Pas Foto","pasFoto"],["KTP","ktp"],["KK","kk"],["Ijazah Terakhir","ijazah"],["Transkrip Nilai","transkrip"],["Surat Keterangan Sehat","suratSehat"]].map(([label,key]) => {
                        // Perbaikan Akses file
                        const file = documents[key as keyof typeof documents];
                        return <div key={key} className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="mt-0.5 text-emerald-600">✓</span><div className="min-w-0"><p className="text-sm font-bold text-slate-900">{label}</p><p className="truncate text-xs text-slate-500">{file?.name || "Belum diunggah"}</p></div></div>;
                      })}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 sm:p-5">
                    <h3 className="text-base font-black text-slate-900">Pernyataan Persetujuan</h3>
                    <div className="mt-4 space-y-4">
                      <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-700"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0" checked={agreements.dataBenar} onChange={(e) => setAgreements({...agreements, dataBenar: e.target.checked})} /><span>Saya menyatakan bahwa semua data dan dokumen yang saya berikan adalah benar dan sah.</span></label>
                      <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-700"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0" checked={agreements.setujuKetentuan} onChange={(e) => setAgreements({...agreements, setujuKetentuan: e.target.checked})} /><span>Saya mengerti dan menyetujui ketentuan pendaftaran Sentra Layanan Universitas Terbuka.</span></label>
                    </div>
                  </section>
                  <p className="text-center text-xs font-medium leading-5 text-slate-500">Periksa kembali data Anda sebelum menekan tombol Kirim.</p>
                </div>
              )}

            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-200 bg-white p-4 sm:p-5">
            {currentStep > 1 ? <button onClick={handlePrev} className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:px-6">← Sebelumnya</button> : <div/>}
            {currentStep < 4 ? (
              <button onClick={handleNext} className="rounded-full bg-yellow-300 px-5 py-2.5 text-sm font-black text-slate-900 shadow-sm transition hover:bg-yellow-400 sm:px-8">Selanjutnya →</button>
            ) : (
              <button disabled={isSubmitting} onClick={handleSubmit} className="rounded-full bg-yellow-300 px-5 py-2.5 text-sm font-black text-slate-900 shadow-sm transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60 sm:px-8">
                {isSubmitting ? "Mengirim ke Database..." : "✓ Kirim Pendaftaran"}
              </button>
            )}
          </div>
        </div>
      </div>
          <PublicFooter />
</main>
  );
}
