import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpenCheck,
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
  MapPin,
  UserRound,
  Instagram,
  Globe,
  Mail,
  LogOut,
  LayoutDashboard
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { fetchPublicHeroBanners } from "@/lib/hero-banners";
import { defaultFooterContent, fetchPublicFooter } from "@/lib/footer";
import { supabase } from "@/integrations/supabase/client";
import { SiteLogo } from "@/components/site-logo";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

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
      <KeunggulanBannerSection />
      <div className="bg-white">
        <CombinedCTAProcessSection />
      </div>
      <BenefitsSection />
      <PaymentMethodsSection />
      <TestimonialsSection />
      <FooterBanner />
    </main>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;

      const user = data.user;
      if (!user) {
        setCurrentUser(null);
        return;
      }

      const metadata = user.user_metadata ?? {};
      const name =
        (typeof metadata.full_name === "string" && metadata.full_name.trim()) ||
        (typeof metadata.name === "string" && metadata.name.trim()) ||
        user.email?.split("@")[0] ||
        "Pengguna";

      setCurrentUser({ name, email: user.email ?? "" });
    };

    void loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (!user) {
        setCurrentUser(null);
        return;
      }

      const metadata = user.user_metadata ?? {};
      const name =
        (typeof metadata.full_name === "string" && metadata.full_name.trim()) ||
        (typeof metadata.name === "string" && metadata.name.trim()) ||
        user.email?.split("@")[0] ||
        "Pengguna";

      setCurrentUser({ name, email: user.email ?? "" });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ut-sky/25 bg-hero-nav text-hero-foreground shadow-header">
      <div className="mx-auto grid min-h-16 w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 lg:min-h-20 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:px-8 xl:px-12">
        <a href="#home" className="flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label="Sentra Layanan UT Beranda">
          <SiteLogo
            className="max-w-[145px] sm:max-w-[175px] md:max-w-[200px] lg:max-w-[220px]"
            imageClassName="max-h-12 sm:max-h-14"
          />
        </a>

        <nav
          className="hidden min-w-0 items-center justify-center gap-1 lg:flex xl:gap-5"
          aria-label="Navigasi utama"
        >
          <a
            href="#home"
            className="inline-flex items-center gap-2 rounded-full bg-ut-yellow px-3 py-2 text-xs font-black text-ut-navy shadow-yellow xl:px-4 xl:py-2.5 xl:text-sm"
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

        <div className="flex items-center justify-end gap-1.5 sm:gap-2 lg:min-w-0">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                to="/admin"
                aria-label="Akses Dashboard"
                title="Akses Dashboard"
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-ut-yellow px-2.5 py-2 text-[0.65rem] font-black text-ut-navy shadow-yellow transition hover:bg-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-yellow lg:px-3 xl:px-4 xl:text-sm"
              >
                <LayoutDashboard className="size-3.5 sm:size-4" aria-hidden="true" />
                <span className="hidden lg:inline">Dashboard</span>
              </Link>
              <div className="hidden items-center gap-2 rounded-full border border-hero-foreground/40 bg-hero-foreground/10 px-3 py-1.5 text-hero-foreground xl:flex">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-ut-yellow text-ut-navy">
                  <UserRound className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 max-w-[180px] text-left leading-tight">
                  <p className="truncate text-xs font-black">{currentUser.name}</p>
                  <p className="truncate text-[10px] text-hero-foreground/70">{currentUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Keluar"
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-hero-foreground/60 bg-transparent px-2.5 py-2 text-[0.65rem] font-bold text-hero-foreground transition hover:bg-hero-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-yellow lg:px-3 xl:px-4 xl:text-sm"
              >
                <LogOut className="size-3.5 sm:size-4" aria-hidden="true" />
                <span className="hidden lg:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth" aria-label="Masuk" className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-hero-foreground/60 bg-transparent px-2.5 py-2 text-[0.65rem] font-bold text-hero-foreground transition hover:bg-hero-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-yellow sm:px-4 sm:text-xs md:text-sm">
                <CircleUserRound className="size-3.5 sm:size-4" aria-hidden="true" />
                <span>Masuk</span>
              </Link>
              <Link to="/daftar" aria-label="Daftar" className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-ut-yellow px-2.5 py-2 text-[0.65rem] font-black text-ut-navy shadow-yellow transition hover:bg-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-yellow sm:px-4 sm:text-xs md:text-sm">
                <ClipboardPenLine className="size-3.5 sm:size-4" aria-hidden="true" />
                <span>Daftar</span>
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-hero-foreground/60 bg-hero-foreground/10 transition hover:bg-hero-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-yellow lg:hidden"
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
          className="border-t border-hero-foreground/20 px-4 pb-4 pt-3 lg:hidden"
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
      className="relative scroll-mt-20 aspect-[1920/700] w-full overflow-hidden bg-hero-deep"
    >
      {activeBanner?.url ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-hero-deep">
          <img
            key={activeBanner.id}
            src={activeBanner.url}
            alt={activeBanner.alt_text ?? "Hero Banner Salute Arek Malang"}
            className="block h-full w-full object-contain object-center"
          />
        </div>
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
    if (!selectedStep) {
      document.body.style.overflow = "unset";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedStep(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedStep]);

  return (
    <section
      id="panduan"
      className="relative z-10 px-4 pb-10 pt-12 sm:px-6 md:px-8 md:pb-14 md:pt-20 lg:px-12"
    >
      {selectedStep && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedStep(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="process-step-dialog-title"
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
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
                  <h3 id="process-step-dialog-title" className="text-xl font-extrabold">
                    {selectedStep.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStep(null)}
                aria-label="Tutup detail langkah"
                className="relative z-10 grid size-8 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 md:p-8">
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
                type="button"
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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {processSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="group relative mt-2"
                >
                  <button
                    onClick={() => setSelectedStep(step)}
                    className="relative flex h-full min-h-[170px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-2 hover:border-transparent hover:bg-[#111c38] hover:shadow-[0_16px_32px_-15px_rgba(17,28,56,0.4)] focus:outline-none focus:ring-4 focus:ring-yellow-400/50"
                  >
                    <div className="absolute -left-3 -top-4 flex size-10 items-center justify-center rounded-full border-4 border-white bg-[#facc15] text-xl font-black text-[#111c38] shadow-lg transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 group-hover:border-[#111c38]">
                      {step.number}
                    </div>

                    <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm transition-all duration-500 group-hover:-rotate-3 group-hover:scale-110 group-hover:bg-[#facc15] group-hover:text-[#111c38]">
                      <Icon
                        className="size-6"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="mb-1.5 text-base font-extrabold leading-tight text-[#111c38] transition-colors duration-500 group-hover:text-white">
                      {step.title}
                    </h3>

                    <p className="mb-3 max-w-[15rem] text-xs leading-relaxed text-slate-500 transition-colors duration-500 group-hover:text-slate-200">
                      {step.description}
                    </p>

                    {step.badges ? (
                      <div className="mt-auto flex flex-wrap justify-center gap-2">
                        {step.badges.map((badge) => (
                          <span
                            key={badge}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 transition-colors duration-500 group-hover:border-slate-700 group-hover:bg-slate-800 group-hover:text-slate-200"
                          >
                            <CheckCircle2
                              className="size-3 text-[#facc15]"
                              aria-hidden="true"
                            />
                            {badge}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-auto text-xs font-bold text-blue-600 transition-colors duration-500 group-hover:text-[#facc15]">
                        Lihat detail →
                      </div>
                    )}
                  </button>

                  {index % 4 !== 3 &&
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
    <section className="relative z-20 mx-auto -mt-12 max-w-7xl px-4 pb-14 sm:-mt-16 sm:px-6 md:-mt-20 md:px-8">
      <div className="flex flex-col items-start justify-between gap-10 rounded-3xl bg-hero-nav p-6 shadow-[0_20px_40px_-15px_rgba(17,28,56,0.3)] md:flex-row md:items-center md:p-10 lg:p-12">
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
                className="rounded-3xl border border-slate-100 bg-[#f8fafc] p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8"
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

// === SECTION PEMBAYARAN MELALUI ===
const PAYMENT_GUIDE_IMAGE =
  "https://yfhbokrybbcbxgafjdhi.supabase.co/storage/v1/object/public/cms-media/1791119550835-Cara-pembayaran-.png";

function PaymentMethodsSection() {
  const paymentSectionQuery = useQuery({
    queryKey: ["public-payment-methods", "beranda"],
    queryFn: async () => {
      const { data: page, error: pageError } = await supabase
        .from("pages")
        .select("id")
        .eq("slug", "beranda")
        .eq("is_published", true)
        .maybeSingle();

      if (pageError) throw pageError;
      if (!page?.id) return null;

      const { data: section, error: sectionError } = await supabase
        .from("sections")
        .select("id, media_url, title, is_published")
        .eq("page_id", page.id)
        .eq("kind", "payment_methods")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (sectionError) throw sectionError;
      return section;
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const paymentImage =
    paymentSectionQuery.data?.media_url?.trim() || PAYMENT_GUIDE_IMAGE;

  return (
    <section
      id="pembayaran"
      aria-label="Pembayaran melalui"
      className="relative overflow-hidden bg-white px-4 py-14 sm:px-6 md:px-8 md:py-20 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center sm:mb-10">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-[#111c38]">
            Informasi Pembayaran
          </p>
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide text-[#111c38] sm:text-3xl lg:text-4xl">
            PEMBAYARAN MELALUI
          </h2>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_-28px_rgba(0,0,0,0.65)]">
            <img
              src={paymentImage}
              alt="Cara pembayaran melalui layanan SALUT Arek Malang"
              className="block h-auto w-full object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
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

async function fetchPublicTestimonials(): Promise<PublicTestimonial[]> {
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
        item.title?.trim() || "Mahasiswa SALUT Arek Malang";

      const role =
        item.subtitle?.trim() ||
        (typeof config.role === "string" ? config.role.trim() : "") ||
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
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;

    const updateActiveSlide = () => {
      setActiveSlide(carouselApi.selectedScrollSnap());
    };

    updateActiveSlide();
    carouselApi.on("select", updateActiveSlide);
    carouselApi.on("reInit", updateActiveSlide);

    return () => {
      carouselApi.off("select", updateActiveSlide);
      carouselApi.off("reInit", updateActiveSlide);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi || testimonials.length <= 4) return;

    const timer = window.setInterval(() => {
      carouselApi.scrollNext();
    }, 3_000);

    return () => window.clearInterval(timer);
  }, [carouselApi, testimonials.length]);

  return (
    <section
      id="testimoni"
      className="relative scroll-mt-20 overflow-hidden bg-[#111c38] px-4 py-16 sm:px-6 md:px-8 md:py-24 lg:px-12"
    >
      <div
        className="absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-blue-900/30 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-yellow-400/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-10 text-center md:mb-12">
          <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
            Apa Kata Mereka?
          </h2>

          <div
            className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-[#facc15]"
            aria-hidden="true"
          />

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-blue-100/80 sm:text-base">
            Pengalaman mahasiswa dan alumni selama mendapatkan layanan dari
            Sentra Layanan UT Arek Malang.
          </p>
        </div>

        {testimonialsQuery.isPending ? (
          <div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Memuat testimoni"
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex animate-pulse flex-col items-center rounded-3xl border border-white/10 bg-white/5 p-6 text-center"
                aria-hidden="true"
              >
                <div className="mb-5 size-24 rounded-full bg-white/10" />
                <div className="mb-3 h-3 w-28 rounded bg-white/10" />
                <div className="mb-4 h-3 w-20 rounded bg-white/10" />
                <div className="h-16 w-full rounded bg-white/10" />
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
          <div className="relative px-1 sm:px-4 lg:px-10">
            <Carousel
              opts={{
                align: "start",
                loop: testimonials.length > 4,
                slidesToScroll: 1,
              }}
              setApi={setCarouselApi}
              className="w-full"
              aria-label="Carousel testimoni mahasiswa dan alumni"
            >
              <CarouselContent className="-ml-4">
                {testimonials.map((item) => (
                  <CarouselItem
                    key={item.id}
                    className="basis-full pl-4 sm:basis-1/2 lg:basis-1/4"
                  >
                    <article className="group flex h-full min-h-[430px] flex-col rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#facc15]/50 hover:bg-white/[0.09] sm:p-6">
                      <div className="mb-5 flex justify-center">
                        <div className="relative size-24 overflow-hidden rounded-full border-4 border-white/90 bg-white shadow-xl transition-transform duration-300 group-hover:scale-105 group-hover:border-[#facc15]">
                          <img
                            src={item.image}
                            alt={`Foto ${item.name}`}
                            loading="lazy"
                            className="h-full w-full object-cover object-top"
                            onError={(event) => {
                              const target = event.currentTarget;
                              target.onerror = null;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                item.name,
                              )}&background=111c38&color=fff&size=256`;
                            }}
                          />
                        </div>
                      </div>

                      <div className="mb-4 flex-1">
                        <div
                          className="mx-auto mb-3 grid size-8 place-items-center rounded-full bg-[#facc15] text-[#111c38]"
                          aria-hidden="true"
                        >
                          <span className="font-serif text-xl font-black leading-none">
                            “
                          </span>
                        </div>

                        <p className="text-sm italic leading-7 text-slate-200">
                          “{item.quote}”
                        </p>
                      </div>

                      <div className="border-t border-white/10 pt-4">
                        <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">
                          {item.name}
                        </h3>

                        <p className="mt-1 min-h-10 text-xs font-medium leading-relaxed text-blue-200">
                          {item.role}
                        </p>
                      </div>
                    </article>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {testimonials.length > 4 ? (
                <>
                  <CarouselPrevious
                    aria-label="Testimoni sebelumnya"
                    className="-left-2 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white sm:-left-4 lg:-left-8"
                  />
                  <CarouselNext
                    aria-label="Testimoni berikutnya"
                    className="-right-2 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white sm:-right-4 lg:-right-8"
                  />
                </>
              ) : null}
            </Carousel>

            {testimonials.length > 4 ? (
              <div
                className="mt-7 flex justify-center gap-1.5"
                aria-label="Posisi carousel testimoni"
              >
                {Array.from({
                  length: Math.max(1, testimonials.length - 3),
                }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => carouselApi?.scrollTo(index)}
                    aria-label={`Tampilkan testimoni mulai dari posisi ${index + 1}`}
                    aria-current={activeSlide === index ? "true" : undefined}
                    className={`h-2 rounded-full transition-all ${
                      activeSlide === index
                        ? "w-7 bg-[#facc15]"
                        : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            ) : null}

            {testimonials.length > 4 ? (
              <p className="mt-3 text-center text-[11px] font-semibold text-slate-400">
                Bergeser otomatis setiap 3 detik • Gunakan panah untuk melihat
                testimoni lainnya
              </p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

// === FOOTER RESPONSIF: INFORMASI UTAMA DAN MEDIA SOSIAL ===
function FooterBanner() {
  const footerQuery = useQuery({
    queryKey: ["public-footer"],
    queryFn: fetchPublicFooter,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const footer = footerQuery.data ?? defaultFooterContent;
  const footerBackground = footer.layout?.background_color || "#a7c8e1";
  const footerLayout = footer.layout;
  const getColumnLayout = (key: "contact" | "address") => {
    const settings =
      footerLayout?.columns?.[key] ?? { height: 300, alignment: "start" as const };
    const height = Math.min(800, Math.max(160, settings.height ?? 300));
    const alignmentClass =
      settings.alignment === "center"
        ? "justify-center"
        : settings.alignment === "end"
          ? "justify-end"
          : "justify-start";
    return { height, alignmentClass };
  };

  const contactLayout = getColumnLayout("contact");
  const addressLayout = getColumnLayout("address");

  const socialLinks = [
    {
      label: "TikTok",
      value: "@salute.arek.malang",
      href: "https://tiktok.com/@salute.arek.malang",
      icon: (
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="currentColor">
          <path d="M19.59 7.69a4.83 4.83 0 0 1-3.77-3.77V3h-3.4v11.34a2.89 2.89 0 1 1-2-2.73v-3.5a6.4 6.4 0 1 0 5.4 6.32V8.75a8.2 8.2 0 0 0 3.77.91V6.28Z" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      value: "@salutearekmalang_ut",
      href: "https://www.instagram.com/salutearekmalang_ut/",
      icon: <Instagram className="size-5" aria-hidden="true" />,
    },
    {
      label: "Website",
      value: "salutearekmalang.com",
      href: "https://salutearekmalang.com/",
      icon: <Globe className="size-5" aria-hidden="true" />,
    },
    {
      label: "Email",
      value: "admin@salurtearekmalang.com",
      href: "mailto:admin@salurtearekmalang.com",
      icon: <Mail className="size-5" aria-hidden="true" />,
    },
  ];

  return (
    <div id="kontak" className="relative w-full scroll-mt-20" style={{ backgroundColor: footerBackground }}>
      <footer className="w-full text-[#0f1523]" style={{ backgroundColor: footerBackground }}>
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-8 md:py-12 lg:px-12 lg:py-14">
          <div className="grid grid-cols-1 gap-10 lg:gap-12">
            <div className="grid grid-cols-1 items-stretch gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-8">
              {footer.contact?.enabled && (
                <div
                  className={`flex w-full flex-col items-center ${contactLayout.alignmentClass} text-center`}
                  style={{ minHeight: `${contactLayout.height}px` }}
                >
                  <a
                    href={footer.contact.phone_href || "#"}
                    aria-label={`Hubungi ${footer.contact.label}`}
                    className="mb-4 grid size-12 shrink-0 place-items-center rounded-full bg-[#0f1523] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f1523]"
                  >
                    <Phone className="size-6" fill="currentColor" aria-hidden="true" />
                  </a>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 sm:text-xs">
                    {footer.contact.label}
                  </p>
                  <a
                    href={footer.contact.phone_href || "#"}
                    className="font-display text-2xl font-black tracking-[0.12em] text-[#0f1523] transition-colors hover:text-slate-600 sm:text-3xl lg:text-[2rem]"
                  >
                    {footer.contact.phone}
                  </a>
                </div>
              )}

              {footer.address?.enabled && footer.address?.text && (
                <div
                  className={`flex w-full flex-col items-center ${addressLayout.alignmentClass} text-center`}
                  style={{ minHeight: `${addressLayout.height}px` }}
                >
                  <div className="mb-4 grid size-12 shrink-0 place-items-center rounded-full bg-[#0f1523] text-white">
                    <MapPin className="size-6" aria-hidden="true" />
                  </div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 sm:text-xs">
                    Alamat Kantor
                  </p>
                  <p className="max-w-[320px] text-sm font-medium leading-[1.6] text-slate-800 sm:max-w-[380px] sm:text-base lg:max-w-[390px] lg:text-[15px]">
                    {footer.address.text}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-[#0f1523]/10 pt-8 sm:pt-10">
              <div className="mx-auto max-w-5xl">
                <div className="mb-5 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 sm:text-xs">
                    Media Sosial & Kontak
                  </p>
                </div>

                <ul
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4"
                  aria-label="Akun media sosial dan kontak SALUT Arek Malang"
                >
                  {socialLinks.map((item) => (
                    <li key={item.label} className="min-w-0">
                      <a
                        href={item.href}
                        target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                        rel={item.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                        className="group flex min-h-14 w-full items-center gap-3 rounded-xl border border-[#0f1523]/10 bg-white/35 px-3.5 py-3 text-left transition-all hover:-translate-y-0.5 hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f1523]"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#0f1523] text-white transition-colors group-hover:bg-slate-700">
                          {item.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                            {item.label}
                          </span>
                          <span className="block truncate text-xs font-extrabold text-[#0f1523] sm:text-sm">
                            {item.value}
                          </span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div className="w-full border-t border-[#0f1523]/10 py-2.5" style={{ backgroundColor: footerBackground }}>
        <div className="mx-auto max-w-7xl px-4 text-center text-[10px] font-bold leading-normal text-[#0f1523] sm:px-6 sm:text-xs md:px-8 lg:px-12 lg:text-left">
          <p>© {new Date().getFullYear()} Sentra Layanan Universitas Terbuka Arek Malang.</p>
        </div>
      </div>
    </div>
  );
}