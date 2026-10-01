import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Phone, Building2 } from "lucide-react";

export const Route = createFileRoute("/daftar")({
  head: () => ({
    meta: [{ title: "Pendaftaran - Sentra Layanan UT Arek Malang" }],
  }),
  component: RegistrationPage,
});

function RegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);

  // State untuk menyimpan data form dari Langkah 1 & 2
  const [formData, setFormData] = useState({
    namaLengkap: "",
    namaSekolah: "",
    asalKota: "",
    email: "",
    nomorHp: "",
    jalurPendaftaran: "",
    jurusan: "",
  });

  const [errors, setErrors] = useState({
    namaLengkap: true, 
    email: true,
  });

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const steps = [
    { id: 1, label: "1. Data Diri" },
    { id: 2, label: "2. Jalur & Jurusan" },
    { id: 3, label: "3. Unggah Dokumen" },
    { id: 4, label: "4. Tinjau & Kirim" },
  ];

  return (
    <main className="min-h-screen bg-[#f8f9fa] font-sans pb-12">
      <header className="bg-white shadow-sm px-6 py-4 mb-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-slate-800 font-bold hover:text-blue-700 transition">
          <Building2 className="w-6 h-6" />
          <span>SALUT UT Arek Malang</span>
        </Link>
        <Link to="/" className="text-sm font-semibold text-slate-500 hover:text-slate-800 px-4 py-2 border rounded-full">
          Batal
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Halaman Pendaftaran</h1>

        {/* Stepper Navigation */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-1 bg-[#fde047] p-1 rounded-lg mb-6 overflow-hidden shadow-sm">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isPast = currentStep > step.id;
            return (
              <div
                key={step.id}
                className={`flex-1 min-w-[120px] text-center py-2.5 px-4 text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-[#1e293b] text-white rounded-md shadow-md"
                    : isPast
                    ? "text-[#1e293b] opacity-70"
                    : "text-[#1e293b] opacity-50"
                }`}
              >
                {step.label}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative min-h-[500px] flex flex-col">
          
          <div className="absolute top-0 right-0 w-full md:w-2/3 h-full z-0 opacity-20 md:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1470&auto=format&fit=crop"
              alt="Background Mahasiswa"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Area Form yang bisa di-scroll jika panjang */}
          <div className="relative z-10 p-6 md:p-10 md:w-3/5 flex-grow">
            
            {/* ================= LANGKAH 1 ================= */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h2 className="text-2xl font-extrabold text-slate-900 leading-tight mb-2">
                  Formulir Pendaftaran Mahasiswa SALUT Arek Malang - Langkah 1: Data Diri Dasar
                </h2>
                <p className="text-sm text-slate-600 mb-8 font-medium">
                  Lengkapi data diri Anda di bawah ini sesuai dengan KTP dan Ijazah.
                </p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1.5">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nama Lengkap"
                      value={formData.namaLengkap}
                      onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 bg-white/90 backdrop-blur-sm ${
                        errors.namaLengkap 
                          ? "border-red-400 focus:ring-red-200" 
                          : "border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                    />
                    {errors.namaLengkap && (
                      <p className="text-xs text-red-500 mt-1.5 font-semibold">Nama Lengkap wajib diisi</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1.5">
                      Nama Sekolah Asal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nama Sekolah Asal"
                      value={formData.namaSekolah}
                      onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white/90 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1.5">
                      Asal Kota/Kabupaten <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Asal Kota/Kabupaten"
                      value={formData.asalKota}
                      onChange={(e) => setFormData({ ...formData, asalKota: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white/90 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1.5">
                      Alamat Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Email@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 bg-white/90 backdrop-blur-sm ${
                        errors.email 
                          ? "border-red-400 focus:ring-red-200" 
                          : "border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1.5 font-semibold">Email tidak valid</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1.5">
                      Nomor HP/WhatsApp <span className="text-red-500">*</span>{" "}
                      <span className="text-slate-500 font-normal">Bisa untuk WhatsApp</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="0812-302-4264"
                        value={formData.nomorHp}
                        onChange={(e) => setFormData({ ...formData, nomorHp: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white/90 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= LANGKAH 2 ================= */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-2xl font-extrabold text-slate-900 leading-tight mb-2">
                  Formulir Pendaftaran Mahasiswa SALUT Arek Malang - Langkah 2: Jalur & Jurusan
                </h2>
                <p className="text-sm text-slate-600 mb-8 font-medium">
                  Pilih jalur pendaftaran dan program studi yang Anda minati.
                </p>

                <div className="space-y-6">
                  {/* Field Jalur Pendaftaran */}
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1.5">
                      Pilih Jalur Pendaftaran <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.jalurPendaftaran}
                      onChange={(e) => setFormData({ ...formData, jalurPendaftaran: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white/90 backdrop-blur-sm font-medium text-slate-700"
                    >
                      <option value="" disabled>-- Pilih Jalur --</option>
                      <option value="Reguler">Reguler</option>
                      <option value="RPL">RPL (Rekognisi Pembelajaran Lampau)</option>
                    </select>
                  </div>

                  {/* Field Jurusan */}
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1.5">
                      Pilih Jurusan / Program Studi <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.jurusan}
                      onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white/90 backdrop-blur-sm font-medium text-slate-700"
                    >
                      <option value="" disabled>-- Cari atau Pilih Jurusan --</option>
                      <option value="S1 Manajemen">S1 Manajemen</option>
                      <option value="S1 Akuntansi">S1 Akuntansi</option>
                      <option value="S1 Ilmu Hukum">S1 Ilmu Hukum</option>
                      <option value="S1 Ilmu Komunikasi">S1 Ilmu Komunikasi</option>
                      <option value="S1 PGSD">S1 PGSD</option>
                      <option value="S1 PGPAUD">S1 PGPAUD</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder untuk Step 3 dan 4 */}
            {currentStep === 3 && (
              <div className="animate-in fade-in h-[400px] flex items-center justify-center">
                <p className="text-slate-500 font-bold">Komponen Langkah 3: Unggah Dokumen akan muncul di sini.</p>
              </div>
            )}
            {currentStep === 4 && (
              <div className="animate-in fade-in h-[400px] flex items-center justify-center">
                <p className="text-slate-500 font-bold">Komponen Langkah 4: Tinjau & Kirim akan muncul di sini.</p>
              </div>
            )}
          </div>

          {/* Area Tombol Footer (Navigasi Sebelumnya & Selanjutnya) */}
          <div className="relative z-10 border-t border-slate-100 bg-white/80 backdrop-blur-md p-6 flex justify-between items-center mt-auto">
            {currentStep > 1 ? (
              <button
                onClick={handlePrev}
                className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3 px-6 rounded-full transition-transform hover:-translate-y-0.5"
              >
                ← Sebelumnya
              </button>
            ) : (
              <div></div> /* Div kosong agar tombol Selanjutnya tetap di kanan */
            )}
            
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-[#fbd043] hover:bg-yellow-400 text-slate-900 font-bold py-3 px-8 rounded-full shadow-md transition-transform hover:-translate-y-0.5"
            >
              Selanjutnya <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
