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
  MapPin
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { fetchPublicHeroBanners } from "@/lib/hero-banners";
import { defaultFooterContent, fetchPublicFooter } from "@/lib/footer";
import { supabase } from "@/integrations/supabase/client";

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
              <p className="truncate text-xs font-black uppercase sm:text-sm md:text-base">
                UNIVERSITAS
              </p>
              <p className="truncate text-xs font-black uppercase sm:text-sm md:text-base">
                TERBUKA
              </p>
            </div>

            <span
              className="hidden h-10 w-px shrink-0 bg-hero-foreground/70 sm:block"
              aria-hidden="true"
            />

            <div className="hidden min-w-0 font-script text-2xl font-bold leading-none text-hero-foreground drop-shadow-title sm:block md:text-4xl">
              Sentra Layanan
              <span className="block font-display text-xl font-black tracking-normal md:text-2xl">
                UT
              </span>
            </div>
          </div>
        </a>

        <nav
          className="hidden items-center justify-center gap-3 md:flex lg:gap-9"
          aria-label="Navigasi utama"
        >
          <a
            href="#home"
            className="inline-flex items-center gap-2 rounded-full bg-ut-yellow px-4 py-2.5 text-sm font-black text-ut-navy shadow-yellow lg:px-5"
          >
            <Home className="size-4" aria-hidden="true" />
            Beranda
          </a>

          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="rounded-full px-2 py-1 text-sm font-bold text-hero-foreground/95 transition hover:text-ut-yellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-yellow"
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2 md:min-w-0">
          <Button
            variant="heroOutline"
            size="pill"
            className="shrink-0 px-3 text-[0.7rem] sm:px-4 sm:text-xs md:text-sm"
          >
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
            {menuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          className="border-t border-hero-foreground/20 px-4 pb-4 pt-3 md:hidden"
          aria-label="Navigasi mobile"
        >
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
    if (activeSlide >= banners.length) {
      setActiveSlide(0);
    }
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
    <section
      id="home"
      aria-label="Hero Banner"
      className="relative scroll-mt-20 h-[clamp(220px,38vw,620px)] overflow-hidden bg-hero-deep"
    >
      {activeBanner?.url ? (
        <img
          key={activeBanner.id}
          src={activeBanner.url}
          alt={activeBanner.alt_text ?? "Hero Banner Salute Arek Malang"}
          className="absolute inset-0 z-10 block h-full w-full object-contain object-center"
        />
      ) : (
        <div
          className="absolute inset-0 bg-hero-deep"
          aria-hidden="true"
        />
      )}

      {banners.length > 1 ? (
        <div className="absolute inset-x-4 bottom-4 z-20 flex items-center justify-between sm:inset-x-6 md:inset-x-8">
          <button
            type="button"
            onClick={() =>
              setActiveSlide(
                (current) => (current - 1 + banners.length) % banners.length,
              )
            }
            aria-label="Banner sebelumnya"
            className="grid size-10 place-items-center rounded-full border border-white/60 bg-black/40 text-white backdrop-blur transition hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-yellow"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>

          <div
            className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-2 backdrop-blur"
            aria-label="Pilihan slide"
          >
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`Tampilkan slide ${index + 1}`}
                aria-current={index === activeSlide ? "true" : undefined}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeSlide
                    ? "w-7 bg-ut-yellow"
                    : "w-2.5 bg-white/70 hover:bg-white"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setActiveSlide((current) => (current + 1) % banners.length)
            }
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

function CombinedCTAProcessSection() {
  const [selectedStep, setSelectedStep] =
    useState<(typeof processSteps)[0] | null>(null);

  useEffect(() => {
    if (selectedStep) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedStep]);

  return (
    <section
      id="panduan"
      className="relative z-10 px-4 pb-12 pt-16 sm:px-6 md:px-8 md:pb-16 md:pt-24 lg:px-12"
    >
      {selectedStep && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedStep(null)}
        >
          <div
            className="flex w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center justify-between overflow-hidden bg-[#111c38] p-6 text-white">
              <div className="absolute right-0 top-0 -mr-10 -mt-10 h-32 w-32 rounded-full bg-[#facc15]/10 blur-2xl" />

              <div className="relative z-10 flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-full bg-[#facc15] text-[#111c38]">
                  <selectedStep.icon
                    className="size-6"
                    strokeWidth={2.5}
                  />
                </div>

                <div>
                  <p className="mb-0.5 text-xs font-black uppercase tracking-wider text-[#facc15]">
                    Langkah {selectedStep.number}
                  </p>
                  <h3 className="text-xl font-extrabold">
                    {selectedStep.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedStep(null)}
                className="relative z-10 grid size-8 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-6 md:p-8">
              <p className="mb-5 font-medium text-slate-600">
                {selectedStep.description}
              </p>

              <ul className="space-y-3">
                {selectedStep.details.map((detail, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm text-slate-700"
                  >
                    <div className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
                      <Check
                        className="size-3.5"
                        strokeWidth={3}
                      />
                    </div>

                    <span className="leading-snug">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end border-t border-slate-100 bg-slate-50 p-4 px-6 md:px-8">
              <button
                onClick={() => setSelectedStep(null)}
                className="rounded-full bg-slate-200 px-6 py-2.5 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-300"
              >
                Tutup Pemandu
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-[40%_60%] xl:gap-16">
        <div className="flex flex-col items-start gap-6">
          <h2 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-[#111c38] md:text-5xl lg:text-[3.25rem]">
            Kuliah Fleksibel,{" "}
            <br className="hidden md:block" />
            Raih Masa Depan{" "}
            <br className="hidden md:block" />
            Bersama{" "}
            <span className="text-[#facc15]">
              SALUT Arek Malang
            </span>
          </h2>

          <p className="max-w-md text-lg leading-relaxed text-slate-500 md:text-xl">
            Wujudkan impianmu meraih gelar sarjana dengan sistem belajar jarak
            jauh yang inovatif dan terjangkau. Klik setiap alur untuk info
            lebih lanjut!
          </p>

          <Link
            to="/daftar"
            className="group mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#facc15] px-8 text-base font-bold text-[#111c38] shadow-[0_8px_20px_-6px_rgba(250,204,21,0.6)] transition-all hover:-translate-y-1 hover:bg-yellow-400 md:h-14"
          >
            Mulai Pendaftaran
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="w-full">
          <div className="mb-10 border-b-2 border-slate-100 pb-4">
            <h2 className="font-display text-2xl font-extrabold text-[#111c38] md:text-3xl">
              Alur Pendaftaran Sentra Layanan UT
            </h2>

            <div
              className="mt-3 h-1.5 w-20 rounded-full bg-[#facc15]"
              aria-hidden="true"
            />
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="group relative mt-2"
                >
                  <button
                    onClick={() => setSelectedStep(step)}
                    className="relative flex h-full min-h-[200px] w-full cursor-pointer flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-3 hover:border-transparent hover:bg-[#111c38] hover:shadow-[0_20px_40px_-15px_rgba(17,28,56,0.4)] focus:outline-none focus:ring-4 focus:ring-yellow-400/50"
                  >
                    <div className="absolute -left-4 -top-5 flex size-12 items-center justify-center rounded-full border-4 border-white bg-[#facc15] text-xl font-black text-[#111c38] shadow-lg transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 group-hover:border-[#111c38]">
                      {step.number}
                    </div>

                    <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm transition-all duration-500 group-hover:-rotate-3 group-hover:scale-110 group-hover:bg-[#facc15] group-hover:text-[#111c38]">
                      <Icon
                        className="size-8"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="mb-3 text-lg font-extrabold leading-tight text-[#111c38] transition-colors duration-500 group-hover:text-white">
                      {step.title}
                    </h3>

                    {step.badges ? (
                      <div className="mt-auto flex flex-wrap justify-center gap-2">
                        {step.badges.map((badge) => (
                          <span
                            key={badge}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 transition-colors duration-500 group-hover:border-slate-700 group-hover:bg-slate-800 group-hover:text-slate-200"
                          >
                            <CheckCircle2
                              className="size-3.5 text-[#facc15]"
                              aria-hidden="true"
                            />
                            {badge}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-auto text-xs font-semibold text-blue-500 opacity-0 transition-opacity duration-500 group-hover:text-[#facc15] group-hover:opacity-100">
                        Klik untuk info detail
                      </div>
                    )}
                  </button>

                  {index % 3 !== 2 &&
                  index < processSteps.length - 1 ? (
                    <ChevronRight
                      className="pointer-events-none absolute -right-5 top-1/2 z-10 hidden size-7 -translate-y-1/2 text-slate-300 transition-all duration-500 group-hover:translate-x-2 group-hover:text-[#facc15] lg:block"
                      aria-hidden="true"
                    />
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

function KeunggulanBannerSection() {
  return (
    <section className="relative z-20 mx-auto max-w-7xl px-4 pb-16 sm:px-6 md:px-8">
      <div className="flex flex-col items-start justify-between gap-10 rounded-3xl bg-[#111c38] p-6 shadow-[0_20px_40px_-15px_rgba(17,28,56,0.3)] md:flex-row md:items-center md:p-10 lg:p-12">
        <div className="flex w-full flex-1 items-center gap-5">
          <div className="shrink-0 rounded-full bg-[#facc15] p-4 text-[#111c38] shadow-inner">
            <Gift
              className="h-8 w-8"
              strokeWidth={2.5}
            />
          </div>

          <div>
            <h3 className="mb-1.5 text-lg font-extrabold tracking-wide text-white md:text-xl">
              Layanan Gratis
            </h3>
            <p className="text-sm leading-relaxed text-slate-300 md:text-base">
              Seluruh proses pendampingan diurus tanpa biaya tambahan.
            </p>
          </div>
        </div>

        <div className="hidden h-20 w-px rounded-full bg-slate-700/60 md:block" />

        <div className="flex w-full flex-1 items-center gap-5">
          <div className="shrink-0 rounded-full bg-[#facc15] p-4 text-[#111c38] shadow-inner">
            <Users
              className="h-8 w-8"
              strokeWidth={2.5}
            />
          </div>

          <div>
            <h3 className="mb-1.5 text-lg font-extrabold tracking-wide text-white md:text-xl">
              Pendampingan
            </h3>
            <p className="text-sm leading-relaxed text-slate-300 md:text-base">
              Tim akademik membantu selama masa perkuliahan.
            </p>
          </div>
        </div>

        <div className="hidden h-20 w-px rounded-full bg-slate-700/60 md:block" />

        <div className="flex w-full flex-1 items-center gap-5">
          <div className="shrink-0 rounded-full bg-[#facc15] p-4 text-[#111c38] shadow-inner">
            <Clock
              className="h-8 w-8"
              strokeWidth={2.5}
            />
          </div>

          <div>
            <h3 className="mb-1.5 text-lg font-extrabold tracking-wide text-white md:text-xl">
              Waktu Fleksibel
            </h3>
            <p className="text-sm leading-relaxed text-slate-300 md:text-base">
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
    <section
      id="informasi"
      className="scroll-mt-20 border-t border-slate-100 bg-white px-4 py-12 sm:px-6 md:px-8 md:py-20 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-extrabold leading-tight text-[#111c38] sm:text-4xl">
            Kenapa Memilih Salute Arek Malang?
          </h2>

          <div
            className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-[#facc15]"
            aria-hidden="true"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article
                key={benefit.title}
                className="rounded-3xl border border-slate-100 bg-[#f8fafc] p-6 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-8"
              >
                <div className="mx-auto mb-6 grid size-16 rotate-3 place-items-center rounded-2xl bg-[#facc15] text-[#111c38] shadow-sm transition-transform hover:rotate-0">
                  <Icon
                    className="size-8"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>

                <h3 className="mb-3 text-lg font-extrabold leading-tight text-[#111c38]">
                  {benefit.title}
                </h3>

                <p className="text-sm leading-relaxed text-slate-500">
                  {benefit.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// === TESTIMONI CMS ===
type PublicTestimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  image: string;
};

async function fetchPublicTestimonials(): Promise<
  PublicTestimonial[]
> {
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", "beranda")
    .eq("is_published", true)
    .maybeSingle();

  if (pageError) throw pageError;
  if (!page?.id) return [];

  const { data: section, error: sectionError } = await supabase
    .from("sections")
    .select("id, title")
    .eq("page_id", page.id)
    .eq("kind", "testimonials")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (sectionError) throw sectionError;
  if (!section?.id) return [];

  const { data: items, error: itemsError } = await supabase
    .from("section_items")
    .select(
      "id, title, subtitle, body, media_url, config, sort_order, is_published",
    )
    .eq("section_id", section.id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (itemsError) throw itemsError;

  return (items ?? [])
    .map((item) => {
      const config =
        item.config &&
        typeof item.config === "object" &&
        !Array.isArray(item.config)
          ? (item.config as Record<string, unknown>)
          : {};

      const name =
        item.title?.trim() ||
        "Mahasiswa SALUT Arek Malang";

      const role =
        item.subtitle?.trim() ||
        (typeof config.role === "string"
          ? config.role.trim()
          : "") ||
        "Mahasiswa Universitas Terbuka";

      const quote = item.body?.trim() || "";

      const image =
        item.media_url?.trim() ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name,
        )}&background=111c38&color=fff&size=256`;

      return {
        id: item.id,
        name,
        role,
        quote,
        image,
      };
    })
    .filter((item) => item.quote.length > 0);
}

function TestimonialsSection() {
  const testimonialsQuery = useQuery({
    queryKey: ["public-testimonials", "beranda"],
    queryFn: fetchPublicTestimonials,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const testimonials = testimonialsQuery.data ?? [];

  return (
    <section
      id="kontak"
      className="relative scroll-mt-20 overflow-hidden bg-[#111c38] px-4 py-16 sm:px-6 md:px-8 md:py-24 lg:px-12"
    >
      <div className="absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-blue-900/30 blur-3xl" />

      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-yellow-400/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
            Apa Kata Mereka?
          </h2>

          <div
            className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-[#facc15]"
            aria-hidden="true"
          />
        </div>

        {testimonialsQuery.isPending ? (
          <div
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-6 lg:gap-4 xl:gap-6"
            aria-label="Memuat testimoni"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex animate-pulse flex-col items-center text-center"
                aria-hidden="true"
              >
                <div className="mb-6 h-48 w-40 rounded-t-full bg-white/10 sm:h-44 sm:w-36 md:h-52 md:w-40 lg:h-36 lg:w-28 xl:h-44 xl:w-36" />

                <div className="mb-3 h-3 w-28 rounded bg-white/10" />

                <div className="mb-3 h-8 w-32 rounded bg-white/10" />

                <div className="h-12 w-full max-w-[150px] rounded bg-white/10" />
              </div>
            ))}
          </div>
        ) : testimonialsQuery.isError ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-center text-sm text-slate-300">
            Testimoni belum dapat dimuat saat ini.
          </div>
        ) : testimonials.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-center text-sm text-slate-300">
            Belum ada testimoni yang dipublikasikan.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-6 lg:gap-4 xl:gap-6">
            {testimonials.map((item) => (
              <article
                key={item.id}
                className="group flex cursor-default flex-col items-center text-center transition-all duration-500 hover:-translate-y-4"
              >
                <div className="mb-6 h-48 w-40 overflow-hidden rounded-t-full border-[5px] border-white bg-white shadow-xl transition-all duration-500 group-hover:scale-105 group-hover:border-[#facc15] group-hover:shadow-[0_20px_40px_-15px_rgba(250,204,21,0.4)] sm:h-44 sm:w-36 md:h-52 md:w-40 lg:h-36 lg:w-28 xl:h-44 xl:w-36">
                  <img
                    src={item.image}
                    alt={`Foto ${item.name}`}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    onError={(event) => {
                      const target = event.currentTarget;

                      target.onerror = null;

                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        item.name,
                      )}&background=111c38&color=fff&size=256`;
                    }}
                  />
                </div>

                <h3 className="mb-2 text-[13px] font-extrabold uppercase tracking-wide text-white transition-colors group-hover:text-[#facc15] md:text-sm">
                  {item.name}
                </h3>

                <p className="mb-3 flex min-h-10 items-start justify-center text-[11px] font-medium text-blue-200 md:text-xs">
                  {item.role}
                </p>

                <p className="px-2 text-[11px] italic leading-relaxed text-slate-300 md:text-xs">
                  &quot;{item.quote}&quot;
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// === DESAIN BARU: FOOTER BANNER ===
function FooterBanner() {
  const footerQuery = useQuery({
    queryKey: ["public-footer"],
    queryFn: fetchPublicFooter,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const footer = footerQuery.data ?? defaultFooterContent;
  
  // Karena saat ini belum ada field building_image_url di database, kita siapkan variabelnya terlebih dahulu.
  // URL placeholder ini akan diganti dengan URL gambar aslinya jika sudah diupload via admin nanti.
  const buildingImage = (footer as any).building_image_url || "https://images.unsplash.com/photo-1613144883446-24e5a5ba7dc7?auto=format&fit=crop&q=80&w=800&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; 

  return (
    <footer className="w-full bg-[#f8fafc] pt-20 lg:pt-32">
      
      {/* Outer Container for Absolute Positioning */}
      <div className="relative w-full border-t border-slate-800 bg-[#111c38]">
        
        {/* Gambar Sketsa Gedung: Pop-Out Effect (Menonjol Keatas) */}
        <div className="pointer-events-none absolute bottom-0 right-0 z-0 w-full max-w-[280px] opacity-10 md:max-w-[400px] md:opacity-30 lg:z-10 lg:max-w-[500px] lg:opacity-100 xl:max-w-[650px] lg:translate-x-4">
          {footer.address?.enabled && (
            <img 
              src={buildingImage} 
              alt="Sketsa Gedung Salute Malang" 
              className="h-auto w-full object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
            />
          )}
        </div>

        {/* Inner Content Grid */}
        <div className="relative z-20 mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8 lg:px-12 lg:py-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-start">
            
            {/* Kolom Kiri: Kontak */}
            {footer.contact?.enabled && (
              <div className="flex w-full flex-col items-center text-center lg:w-1/3 lg:items-center">
                <a href={footer.contact.phone_href || "#"} className="mb-4 grid size-12 shrink-0 place-items-center rounded-full bg-[#34d399] text-white shadow-lg transition-transform hover:scale-110">
                  <Phone className="size-6" aria-hidden="true" />
                </a>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:text-xs">
                  {footer.contact.label}
                </p>
                <a href={footer.contact.phone_href || "#"} className="font-display text-3xl font-black tracking-widest text-white transition-colors hover:text-[#facc15] sm:text-4xl">
                  {footer.contact.phone}
                </a>
              </div>
            )}

            {/* Garis Pembatas Vertikal (Desktop) & Horizontal (Mobile) */}
            <div className="hidden h-24 w-px bg-slate-700/50 lg:block" />
            <div className="block h-px w-full bg-slate-700/50 lg:hidden" />

            {/* Kolom Tengah: Alamat Fisik */}
            {footer.address?.enabled && footer.address?.text && (
              <div className="flex w-full flex-col items-center text-center lg:w-1/3 lg:items-center">
                <div className="mb-4 grid size-12 shrink-0 place-items-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white">
                  <MapPin className="size-6" aria-hidden="true" />
                </div>
                <p className="max-w-[280px] text-xs font-medium leading-relaxed text-slate-300 sm:max-w-xs sm:text-sm">
                  {footer.address.text}
                </p>
              </div>
            )}

            {/* Kolom Kanan: Spacer kosong di Desktop untuk menampung gambar Sketsa */}
            <div className="hidden w-full lg:block lg:w-1/3"></div>
          </div>
          
          {/* Copyright Area */}
          <div className="mt-12 border-t border-slate-800/80 pt-6 text-center text-[10px] font-medium text-slate-500 sm:text-xs">
            <p>© {new Date().getFullYear()} Sentra Layanan Universitas Terbuka Arek Malang.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
