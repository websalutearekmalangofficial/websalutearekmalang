import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpenCheck,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  ClipboardPenLine,
  CloudUpload,
  GraduationCap,
  Headphones,
  Home,
  IdCard,
  Info,
  Menu,
  MonitorCheck,
  Phone,
  ShieldCheck,
  X,
  Gift,
  Users,
  Clock,
  ArrowRight,
  Check,
  Quote
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { fetchPublicHeroBanners } from "@/lib/hero-banners";
import { fetchPublicTestimonials } from "@/lib/testimonials";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sentra Layanan UT Arek Malang" },
      {
        name: "description",
        content:
          "Landing page resmi Sentra Layanan UT Arek Malang untuk pendaftaran, alur layanan, kelebihan, testimoni, dan informasi kontak.",
      },
      { property: "og:title", content: "Sentra Layanan UT Arek Malang" },
      {
        property: "og:description",
        content:
          "Daftar dan dapatkan informasi pendaftaran Universitas Terbuka melalui Sentra Layanan UT Arek Malang.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const navLinks = ["Informasi", "Panduan", "Kontak"];

// Data alur pendaftaran ditambahkan deskripsi detail untuk pop-up
const processSteps = [
  {
    number: "1",
    icon: ClipboardPenLine,
    title: "Isi Formulir",
    description: "Siapkan dan lengkapi data diri serta informasi kontak Anda.",
    details: [
      "Nama Lengkap (Sesuai Ijazah)",
      "Tempat & Tanggal Lahir",
      "Agama & Jenis Kelamin",
      "Nama Ibu Kandung",
      "Alamat Lengkap Domisili",
      "Email Aktif (Penting untuk verifikasi)",
      "Nomor HP / WhatsApp Aktif"
    ]
  },
  {
    number: "2",
    icon: CheckCircle2,
    title: "Pilih Jalur",
    badges: ["SIPAS", "Non SIPAS"],
    description: "Tentukan jalur masuk yang sesuai dengan latar belakang pendidikan Anda.",
    details: [
      "Jalur Reguler (Untuk lulusan SMA/SMK/MA sederajat)",
      "Jalur RPL / Alih Kredit (Untuk lulusan D3/D4/S1 yang ingin melanjutkan studi atau transfer SKS)",
      "Layanan SIPAS (Sistem Paket Semester) - Mata kuliah sudah dipaketkan",
      "Layanan Non-SIPAS - Mahasiswa bebas memilih mata kuliah sendiri per semester"
    ]
  },
  {
    number: "3",
    icon: GraduationCap,
    title: "Pilih Jurusan",
    description: "Pilih jenjang dan program studi sesuai minat dan karir Anda.",
    details: [
      "Fakultas Ekonomi dan Bisnis (FEB)",
      "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)",
      "Fakultas Sains dan Teknologi (FST)",
      "Fakultas Hukum, Ilmu Sosial dan Ilmu Politik (FHISIP)",
      "Tersedia untuk jenjang Diploma, Sarjana (S1), Magister (S2), hingga Doktoral (S3)"
    ]
  },
  {
    number: "4",
    icon: CloudUpload,
    title: "Unggah Dokumen",
    description: "Siapkan pindaian (scan) dokumen asli berikut dalam format JPG/PDF.",
    details: [
      "Pas Foto (Latar belakang Merah/Biru)",
      "Kartu Tanda Penduduk (KTP)",
      "Kartu Keluarga (KK)",
      "Ijazah Terakhir (Asli dilegalisir)",
      "Transkrip Nilai (Asli dilegalisir)",
      "Surat Keterangan Sehat dari fasilitas kesehatan"
    ]
  },
  {
    number: "5",
    icon: MonitorCheck,
    title: "Verifikasi Admin",
    description: "Tunggu proses pengecekan berkas oleh tim kami.",
    details: [
      "Admin SALUT Arek Malang akan memverifikasi kelengkapan dan keabsahan dokumen Anda.",
      "Proses verifikasi biasanya memakan waktu 1 hingga 3 hari kerja.",
      "Anda dapat memantau status pendaftaran secara berkala melalui website atau menunggu notifikasi dari kami."
    ]
  },
  {
    number: "6",
    icon: IdCard,
    title: "Dapat Nomor Akun",
    description: "Terima akses resmi sebagai calon mahasiswa Universitas Terbuka.",
    details: [
      "Jika verifikasi berhasil disetujui, Anda akan mendapatkan Nomor Induk Mahasiswa (NIM) sementara.",
      "Lembar Informasi Pembayaran (LIP) dan panduan bayar SPP akan dikirimkan ke email terdaftar Anda.",
      "Lakukan pembayaran sesuai batas waktu agar status Anda resmi menjadi mahasiswa aktif UT."
    ]
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Layanan Pendaftaran Gratis",
    description: "Calon mahasiswa dapat berkonsultasi dan dibantu mengisi pendaftaran tanpa biaya layanan tambahan.",
  },
  {
    icon: BookOpenCheck,
    title: "Pendampingan Akademik",
    description: "Tim membantu memahami pilihan program studi, jalur pendaftaran, dan kebutuhan dokumen akademik.",
  },
  {
    icon: Info,
    title: "Informasi Cepat & Akurat",
    description: "Setiap pertanyaan dijawab dengan arahan yang jelas agar proses pendaftaran berjalan lancar.",
  },
  {
    icon: Headphones,
    title: "Waktu & Tempat Fleksibel",
    description: "Layanan mudah dijangkau dan ramah bagi calon mahasiswa yang memiliki aktivitas padat.",
  },
];

function Index() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fafc] font-body text-foreground">
      <Header />
      <HeroBanner />
      <div className="bg-white">
        <CombinedCTAProcessSection />
        <KeunggulanBannerSection />
      </div>
      <BenefitsSection />
      <TestimonialsSection />
      <FooterBanner />
    </main>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ut-sky/25 bg-hero-nav text-hero-foreground shadow-header">
      <div className="mx-auto grid min-h-16 w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-2.5 sm:gap-3 sm:py-3 md:min-h-20 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:px-8 lg:px-12">
        <a href="#home" className="flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label="Sentra Layanan UT Beranda">
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
        </a>

        <nav className="hidden items-center justify-center gap-3 md:flex lg:gap-9" aria-label="Navigasi utama">
          <a href="#home" className="inline-flex items-center gap-2 rounded-full bg-ut-yellow px-4 py-2.5 text-sm font-black text-ut-navy shadow-yellow lg:px-5">
            <Home className="size-4" aria-hidden="true" />
            Beranda
          </a>
          {navLinks.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="rounded-full px-2 py-1 text-sm font-bold text-hero-foreground/95 transition hover:text-ut-yellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-yellow">
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
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-hero-foreground/60 bg-hero-foreground/10 transition hover:bg-hero-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-yellow md:hidden"
          >
            {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav id="mobile-nav" className="border-t border-hero-foreground/20 px-4 pb-4 pt-3 md:hidden" aria-label="Navigasi mobile">
          <ul className="grid gap-2">
            <li>
              <a
                href="#home"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-ut-yellow px-4 py-3 text-sm font-black text-ut-navy"
              >
                <Home className="size-4" aria-hidden="true" />
                Beranda
              </a>
            </li>
            {navLinks.map((link) => (
              <li key={link}>
                <a
                  href={`#${link.toLowerCase()}`}
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

function HeroBanner() {
  const [activeSlide, setActiveSlide] = useState(0);
  const heroBannersQuery = useQuery({
    queryKey: ["public-hero-banners"],
    queryFn: fetchPublicHeroBanners,
    staleTime: 60_000,
  });
  const banners = heroBannersQuery.data ?? [];

  useEffect(() => {
    if (activeSlide >= banners.length) setActiveSlide(0);
  }, [activeSlide, banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % banners.length);
    }, 3_000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  const activeBanner = banners[activeSlide] ?? banners[0];

  return (
    <section id="home" aria-label="Hero Banner" className="relative scroll-mt-20 h-[clamp(220px,38vw,620px)] overflow-hidden bg-hero-deep">
      {activeBanner?.url ? (
        <img
          key={activeBanner.id}
          src={activeBanner.url}
          alt={activeBanner.alt_text ?? "Hero Banner Salute Arek Malang"}
          className="absolute inset-0 z-10 block h-full w-full object-contain object-center"
        />
      ) : (
        <div className="absolute inset-0 bg-hero-deep" aria-hidden="true" />
      )}

      {banners.length > 1 ? (
        <div className="absolute inset-x-4 bottom-4 z-20 flex items-center justify-between sm:inset-x-6 md:inset-x-8">
          <button
            type="button"
            onClick={() => setActiveSlide((current) => (current - 1 + banners.length) % banners.length)}
            aria-label="Banner sebelumnya"
            className="grid size-10 place-items-center rounded-full border border-white/60 bg-black/40 text-white backdrop-blur transition hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-yellow"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-2 backdrop-blur" aria-label="Pilihan slide">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`Tampilkan slide ${index + 1}`}
                aria-current={index === activeSlide ? "true" : undefined}
                className={`h-2.5 rounded-full transition-all ${index === activeSlide ? "w-7 bg-ut-yellow" : "w-2.5 bg-white/70 hover:bg-white"}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setActiveSlide((current) => (current + 1) % banners.length)}
            aria-label="Banner berikutnya"
            className="grid size-10 place-items-center rounded-full border border-white/60 bg-black/40 text-white backdrop-blur transition hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-yellow"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </section>
  );
}

// === REDESAIN: ALUR PENDAFTARAN DENGAN MODAL INTERAKTIF ===
function CombinedCTAProcessSection() {
  const [selectedStep, setSelectedStep] = useState<typeof processSteps[0] | null>(null);

  // Mencegah scroll pada body saat modal terbuka
  useEffect(() => {
    if (selectedStep) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedStep]);

  return (
    <section id="panduan" className="px-4 pt-16 pb-12 sm:px-6 md:px-8 md:pt-24 md:pb-16 lg:px-12 relative z-10">
      
      {/* --- MODAL POP-UP --- */}
      {selectedStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedStep(null)}>
          <div 
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat area dalam di klik
          >
            {/* Header Modal */}
            <div className="bg-[#111c38] p-6 text-white flex items-center justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-[#facc15]/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="grid size-12 place-items-center rounded-full bg-[#facc15] text-[#111c38]">
                  <selectedStep.icon className="size-6" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[#facc15] text-xs font-black uppercase tracking-wider mb-0.5">Langkah {selectedStep.number}</p>
                  <h3 className="text-xl font-extrabold">{selectedStep.title}</h3>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStep(null)}
                className="relative z-10 grid size-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              >
                <X className="size-4" />
              </button>
            </div>
            
            {/* Body Modal */}
            <div className="p-6 md:p-8">
              <p className="text-slate-600 font-medium mb-5">{selectedStep.description}</p>
              <ul className="space-y-3">
                {selectedStep.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                    <div className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
                      <Check className="size-3.5" strokeWidth={3} />
                    </div>
                    <span className="leading-snug">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Footer Modal */}
            <div className="bg-slate-50 p-4 px-6 md:px-8 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedStep(null)}
                className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-bold rounded-full transition-colors"
              >
                Tutup Pemandu
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-[40%_60%] xl:gap-16">
        
        {/* Kolom Kiri: Teks & Tombol */}
        <div className="flex flex-col items-start gap-6">
          <h2 className="text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-[#111c38] leading-[1.15] tracking-tight">
            Kuliah Fleksibel, <br className="hidden md:block"/>
            Raih Masa Depan <br className="hidden md:block"/>
            Bersama <span className="text-[#facc15]">SALUT Arek Malang</span>
          </h2>
          <p className="text-slate-500 text-lg md:text-xl max-w-md leading-relaxed">
            Wujudkan impianmu meraih gelar sarjana dengan sistem belajar jarak jauh yang inovatif dan terjangkau. Klik setiap alur untuk info lebih lanjut!
          </p>
          <Link
            to="/daftar"
            className="group mt-2 inline-flex h-12 md:h-14 items-center justify-center gap-2 rounded-full bg-[#facc15] px-8 text-base font-bold text-[#111c38] shadow-[0_8px_20px_-6px_rgba(250,204,21,0.6)] transition-all hover:bg-yellow-400 hover:-translate-y-1"
          >
            Mulai Pendaftaran <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Kolom Kanan: Kartu Alur Pendaftaran */}
        <div className="w-full">
          <div className="mb-10 border-b-2 border-slate-100 pb-4">
            <h2 className="font-display text-2xl font-extrabold text-[#111c38] md:text-3xl">
              Alur Pendaftaran Sentra Layanan UT
            </h2>
            <div className="mt-3 h-1.5 w-20 rounded-full bg-[#facc15]" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="group relative mt-2">
                  <button 
                    onClick={() => setSelectedStep(step)}
                    className="w-full text-left relative flex h-full min-h-[200px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-500 hover:-translate-y-3 hover:border-transparent hover:bg-[#111c38] hover:shadow-[0_20px_40px_-15px_rgba(17,28,56,0.4)] focus:outline-none focus:ring-4 focus:ring-yellow-400/50"
                  >
                    {/* Nomor Step Melayang */}
                    <div className="absolute -left-4 -top-5 flex size-12 items-center justify-center rounded-full border-4 border-white bg-[#facc15] text-xl font-black text-[#111c38] shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:border-[#111c38]">
                      {step.number}
                    </div>
                    
                    {/* Ikon Container */}
                    <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-all duration-500 group-hover:bg-[#facc15] group-hover:text-[#111c38] group-hover:scale-110 group-hover:-rotate-3 shadow-sm">
                      <Icon className="size-8" strokeWidth={2.5} aria-hidden="true" />
                    </div>
                    
                    {/* Teks */}
                    <h3 className="mb-3 text-lg font-extrabold leading-tight text-[#111c38] transition-colors duration-500 group-hover:text-white">{step.title}</h3>

                    {/* Badges */}
                    {step.badges ? (
                      <div className="flex flex-wrap justify-center gap-2 mt-auto">
                        {step.badges.map((badge) => (
                          <span key={badge} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 transition-colors duration-500 group-hover:border-slate-700 group-hover:bg-slate-800 group-hover:text-slate-200">
                            <CheckCircle2 className="size-3.5 text-[#facc15]" aria-hidden="true" />
                            {badge}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-auto text-xs font-semibold text-blue-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:text-[#facc15]">
                        Klik untuk info detail
                      </div>
                    )}
                  </button>
                  
                  {/* Chevron Penunjuk Arah */}
                  {index % 3 !== 2 && index < processSteps.length - 1 ? (
                    <ChevronRight className="pointer-events-none absolute -right-5 top-1/2 z-10 hidden size-7 -translate-y-1/2 text-slate-300 transition-all duration-500 group-hover:text-[#facc15] group-hover:translate-x-2 lg:block" aria-hidden="true" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// === BANNER KEUNGGULAN LAYANAN ===
function KeunggulanBannerSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 pb-16 relative z-20">
      <div className="bg-[#111c38] rounded-3xl p-6 md:p-10 lg:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-10 shadow-[0_20px_40px_-15px_rgba(17,28,56,0.3)]">
        <div className="flex items-center gap-5 flex-1 w-full">
          <div className="bg-[#facc15] text-[#111c38] p-4 rounded-full shrink-0 shadow-inner">
            <Gift className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-lg md:text-xl mb-1.5 tracking-wide">Layanan Gratis</h3>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Seluruh proses pendampingan diurus tanpa biaya tambahan.
            </p>
          </div>
        </div>
        <div className="hidden md:block w-px h-20 bg-slate-700/60 rounded-full"></div>
        <div className="flex items-center gap-5 flex-1 w-full">
          <div className="bg-[#facc15] text-[#111c38] p-4 rounded-full shrink-0 shadow-inner">
            <Users className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-lg md:text-xl mb-1.5 tracking-wide">Pendampingan</h3>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Tim akademik membantu selama masa perkuliahan.
            </p>
          </div>
        </div>
        <div className="hidden md:block w-px h-20 bg-slate-700/60 rounded-full"></div>
        <div className="flex items-center gap-5 flex-1 w-full">
          <div className="bg-[#facc15] text-[#111c38] p-4 rounded-full shrink-0 shadow-inner">
            <Clock className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-lg md:text-xl mb-1.5 tracking-wide">Waktu Fleksibel</h3>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Sistem belajar yang bisa diakses kapan saja dan di mana saja.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section id="informasi" className="scroll-mt-20 bg-white px-4 py-12 sm:px-6 md:px-8 md:py-20 lg:px-12 border-t border-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-extrabold leading-tight text-[#111c38] sm:text-4xl">
            Kenapa Memilih Salute Arek Malang?
          </h2>
          <div className="mt-4 mx-auto h-1.5 w-24 rounded-full bg-[#facc15]" aria-hidden="true" />
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article key={benefit.title} className="rounded-3xl border border-slate-100 bg-[#f8fafc] p-6 sm:p-8 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-[#facc15] text-[#111c38] shadow-sm rotate-3 hover:rotate-0 transition-transform">
                  <Icon className="size-8" strokeWidth={2} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-extrabold leading-tight text-[#111c38] mb-3">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{benefit.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// === DESAIN BARU: TESTIMONI APA KATA MEREKA ===
function TestimonialsSection() {
  const testimonialsQuery = useQuery({
    queryKey: ["public-testimonials"],
    queryFn: fetchPublicTestimonials,
    staleTime: 60_000,
  });
  const testimonials = testimonialsQuery.data ?? [];

  return (
    <section id="kontak" className="scroll-mt-20 bg-[#111c38] px-4 py-16 sm:px-6 md:px-8 md:py-24 lg:px-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-900/30 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-yellow-400/10 blur-3xl"></div>
      <div className="mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">Apa Kata Mereka?</h2>
          <div className="mt-4 mx-auto h-1.5 w-24 rounded-full bg-[#facc15]" aria-hidden="true" />
        </div>
        {testimonialsQuery.isLoading ? (
          <div className="rounded-3xl border border-slate-700 bg-slate-800/50 p-8 text-center text-slate-300">Memuat testimoni...</div>
        ) : testimonials.length === 0 ? (
          <div className="rounded-3xl border border-slate-700 bg-slate-800/50 p-8 text-center text-slate-300">Belum ada testimoni yang ditayangkan.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {testimonials.map((item) => {
              const initials = item.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "ST";
              return (
                <article key={item.id} className="flex h-full flex-col rounded-3xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm p-6 shadow-xl transition duration-300 hover:-translate-y-2 hover:border-slate-500 sm:p-8">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="mb-5 size-16 rounded-full object-cover ring-2 ring-[#facc15]/70" />
                  ) : (
                    <div className="mb-5 grid size-16 place-items-center rounded-full bg-[#facc15] text-lg font-black text-[#111c38] shadow-md">{initials}</div>
                  )}
                  <Quote className="mb-4 size-10 fill-current text-[#facc15]/80" aria-hidden="true" />
                  <p className="flex-1 text-base italic leading-relaxed text-slate-300">"{item.quote}"</p>
                  <div className="mt-8 min-w-0">
                    <h3 className="truncate text-base font-extrabold text-white">{item.name}</h3>
                    <span className="text-sm font-medium text-slate-400">{[item.degree, item.role].filter(Boolean).join(" • ")}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function FooterBanner() {
  return (
    <footer className="bg-slate-900 px-4 py-8 text-white sm:px-6 md:px-8 md:py-10 lg:px-12 border-t border-slate-800">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 hover:bg-green-400 transition-colors cursor-pointer">
            <Phone className="size-7" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-0.5">Layanan Informasi Pendaftaran</p>
            <a href="tel:081230024264" className="text-2xl font-black tracking-wide text-white hover:text-[#facc15] transition-colors sm:text-3xl">
              0812-3002-4264
            </a>
          </div>
        </div>
        <div className="text-center md:text-right border-t border-slate-800 pt-6 md:border-t-0 md:pt-0">
          <p className="font-display text-2xl font-extrabold italic leading-tight text-white sm:text-3xl">
            Kuliah Fleksibel,
            <span className="block text-[#facc15]">Raih Masa Depan</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
