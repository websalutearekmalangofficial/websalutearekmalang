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
  Quote,
  ShieldCheck,
  X,
  Gift,
  Users,
  Clock,
  ArrowRight
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { fetchPublicHeroBanners } from "@/lib/hero-banners";

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
  },
  {
    number: "2",
    icon: CheckCircle2,
    title: "Pilih Jalur",
    badges: ["SIPAS", "Non SIPAS"],
  },
  {
    number: "3",
    icon: GraduationCap,
    title: "Pilih Jurusan",
  },
  {
    number: "4",
    icon: CloudUpload,
    title: "Unggah Dokumen",
  },
  {
    number: "5",
    icon: MonitorCheck,
    title: "Verifikasi Admin",
  },
  {
    number: "6",
    icon: IdCard,
    title: "Dapat Nomor Akun",
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

const testimonials = [
  {
    quote:
      "Proses daftar jadi lebih mudah karena semua dokumen dicek satu per satu. Saya tidak bingung memilih jalur kuliah yang sesuai.",
    name: "Rizky Pratama",
    status: "Mahasiswa Aktif",
    initials: "RP",
  },
  {
    quote:
      "Salute Arek Malang membantu saya memahami sistem kuliah UT yang fleksibel. Informasinya cepat dan sangat jelas.",
    name: "Dinda Maharani",
    status: "Alumni",
    initials: "DM",
  },
  {
    quote:
      "Adminnya responsif, ramah, dan sabar menjelaskan pilihan jurusan. Pendaftaran saya selesai tanpa kendala berarti.",
    name: "Bagus Firmansyah",
    status: "Mahasiswa Aktif",
    initials: "BF",
  },
];

function Index() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fafc] font-body text-foreground">
      <Header />
      <HeroBanner />
      {/* Wrapper Putih untuk CTA & Alur Pendaftaran */}
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
    <section id="home" aria-label="Hero Banner" className="relative scroll-mt-20 overflow-hidden bg-hero-deep">
      {activeBanner?.url ? (
        <img
          key={activeBanner.id}
          src={activeBanner.url}
          alt={activeBanner.alt_text ?? "Hero Banner Salute Arek Malang"}
          className="relative z-10 block h-auto max-h-[80vh] w-full object-contain"
        />
      ) : (
        <div className="h-[240px] w-full bg-hero-deep sm:h-[340px] md:h-[440px] lg:h-[520px]" aria-hidden="true" />
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

// === REDESAIN: GABUNGAN CTA & ALUR PENDAFTARAN ===
function CombinedCTAProcessSection() {
  return (
    <section id="panduan" className="px-4 pt-16 pb-12 sm:px-6 md:px-8 md:pt-24 md:pb-16 lg:px-12 relative z-10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-[45%_55%] xl:gap-16">
        
        {/* Kolom Kiri: Teks & Tombol */}
        <div className="flex flex-col items-start gap-6">
          <h2 className="text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-[#111c38] leading-[1.15] tracking-tight">
            Kuliah Fleksibel, <br className="hidden md:block"/>
            Raih Masa Depan <br className="hidden md:block"/>
            Bersama <span className="text-[#facc15]">SALUT Arek Malang</span>
          </h2>
          <p className="text-slate-500 text-lg md:text-xl max-w-md leading-relaxed">
            Wujudkan impianmu meraih gelar sarjana dengan sistem belajar jarak jauh yang inovatif dan terjangkau.
          </p>
          <Link
            to="/daftar"
            className="mt-2 inline-flex h-12 md:h-14 items-center justify-center gap-2 rounded-full bg-[#facc15] px-8 text-base font-bold text-[#111c38] shadow-[0_8px_20px_-6px_rgba(250,204,21,0.6)] transition-all hover:bg-yellow-400 hover:-translate-y-1"
          >
            Mulai Pendaftaran <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Kolom Kanan: Kartu Alur Pendaftaran (Desain Estetik Putih) */}
        <div className="w-full">
          <div className="mb-8 border-b-2 border-slate-100 pb-4">
            <h2 className="font-display text-2xl font-extrabold text-[#111c38] md:text-3xl">
              Alur Pendaftaran Sentra Layanan UT
            </h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-[#facc15]" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative mt-3">
                  <article className="relative flex h-full min-h-[160px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
                    {/* Nomor Step Melayang */}
                    <div className="absolute -left-3 -top-3 flex size-8 items-center justify-center rounded-full border-4 border-white bg-[#facc15] text-sm font-black text-[#111c38] shadow-sm">
                      {step.number}
                    </div>
                    
                    {/* Ikon */}
                    <Icon className="mb-4 size-9 text-[#111c38]" strokeWidth={1.8} aria-hidden="true" />
                    
                    {/* Teks */}
                    <h3 className="mb-2 text-sm font-extrabold leading-tight text-[#111c38]">{step.title}</h3>

                    {/* Badges */}
                    {step.badges ? (
                      <div className="flex flex-wrap justify-center gap-1.5 mt-auto">
                        {step.badges.map((badge) => (
                          <span key={badge} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[0.65rem] font-bold text-slate-600">
                            <CheckCircle2 className="size-3 text-[#facc15]" aria-hidden="true" />
                            {badge}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                  
                  {/* Chevron Penunjuk Arah (Desktop) */}
                  {index % 3 !== 2 && index < processSteps.length - 1 ? (
                    <ChevronRight className="absolute -right-4 top-1/2 z-10 hidden size-5 -translate-y-1/2 text-slate-300 lg:block" aria-hidden="true" />
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

// === REDESAIN: BANNER KEUNGGULAN LAYANAN ===
function KeunggulanBannerSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 pb-16 relative z-20">
      {/* Floating Banner Effect */}
      <div className="bg-[#111c38] rounded-3xl p-6 md:p-10 lg:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-10 shadow-[0_20px_40px_-15px_rgba(17,28,56,0.3)]">
        
        {/* Item 1 */}
        <div className="flex items-center gap-5 flex-1 w-full">
          <div className="bg-[#facc15] text-[#111c38] p-4 rounded-full shrink-0 shadow-inner">
            <Gift className="w-8 h-8" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-lg md:text-xl mb-1.5 tracking-wide">Layanan Gratis</h3>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Seluruh proses pendampingan diurus tanpa biaya tambahan.
            </p>
          </div>
        </div>

        {/* Pemisah Vertikal */}
        <div className="hidden md:block w-px h-20 bg-slate-700/60 rounded-full"></div>

        {/* Item 2 */}
        <div className="flex items-center gap-5 flex-1 w-full">
          <div className="bg-[#facc15] text-[#111c38] p-4 rounded-full shrink-0 shadow-inner">
            <Users className="w-8 h-8" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-lg md:text-xl mb-1.5 tracking-wide">Pendampingan</h3>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Tim akademik siap membantu selama masa perkuliahan.
            </p>
          </div>
        </div>

        {/* Pemisah Vertikal */}
        <div className="hidden md:block w-px h-20 bg-slate-700/60 rounded-full"></div>

        {/* Item 3 */}
        <div className="flex items-center gap-5 flex-1 w-full">
          <div className="bg-[#facc15] text-[#111c38] p-4 rounded-full shrink-0 shadow-inner">
            <Clock className="w-8 h-8" strokeWidth={2} />
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

function TestimonialsSection() {
  return (
    <section id="kontak" className="scroll-mt-20 bg-[#111c38] px-4 py-16 sm:px-6 md:px-8 md:py-24 lg:px-12 relative overflow-hidden">
      {/* Elemen Dekorasi Background */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-900/30 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-yellow-400/10 blur-3xl"></div>

      <div className="mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">Apa Kata Mereka?</h2>
          <div className="mt-4 mx-auto h-1.5 w-24 rounded-full bg-[#facc15]" aria-hidden="true" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="flex h-full flex-col rounded-3xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm p-6 shadow-xl transition duration-300 hover:-translate-y-2 hover:border-slate-500 sm:p-8">
              <Quote className="mb-4 size-10 fill-current text-[#facc15]/80" aria-hidden="true" />
              <p className="flex-1 text-base italic leading-relaxed text-slate-300">"{item.quote}"</p>
              <div className="mt-8 flex items-center gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[#facc15] text-sm font-black text-[#111c38] shadow-md">
                  {item.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-extrabold text-white">{item.name}</h3>
                  <span className="text-sm font-medium text-slate-400">
                    {item.status}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
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
