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
  Mail,
  Menu,
  MapPin,
  MonitorCheck,
  Phone,
  Quote,
  School,
  ShieldCheck,
  User,
  X,
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
    <main className="min-h-screen overflow-hidden bg-background font-body text-foreground">
      <Header />
      <HeroBanner />
      <CombinedCTAProcessSection />
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
    }, 5_500);
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
// === KOMPONEN BARU: GABUNGAN CTA & ALUR PENDAFTARAN ===
function CombinedCTAProcessSection() {
  return (
    <section id="panduan" className="bg-white px-4 py-12 sm:px-6 md:px-8 md:py-16 lg:px-12 relative z-10 border-b border-slate-100">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 md:gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        
        {/* Kolom Kiri: Teks & Tombol (Sticky saat di-scroll di desktop) */}
        <div className="flex min-w-0 flex-col items-start gap-5 md:gap-6 lg:pt-2">
          <h2 className="text-[2.25rem] font-sans font-medium tracking-tight leading-[1.08] text-slate-900 md:text-5xl lg:text-[3.4rem] xl:text-5xl">
            Kuliah Fleksibel,
            <br />
            Raih
            <br />
            Masa Depan
            <br />
            Bersama
            <br />
            SALUT Arek Malang
          </h2>
          <Link
            to="/daftar"
            className="inline-flex h-11 md:h-12 items-center justify-center rounded-full bg-[#fbd043] px-7 text-sm md:text-base font-bold text-slate-900 shadow-md transition hover:bg-yellow-400 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-yellow"
          >
            Mulai Pendaftaran
          </Link>
        </div>

        {/* Kolom Kanan: Kartu Alur Pendaftaran */}
        <div className="min-w-0 w-full pt-0 lg:pt-2">
          <div className="mb-5 md:mb-6">
            <h2 className="font-display text-xl font-black leading-tight text-ut-navy sm:text-2xl md:text-3xl">
              Alur Pendaftaran Sentra Layanan UT
            </h2>
            <div className="mt-2 h-1 w-48 max-w-full rounded-full bg-ut-yellow" aria-hidden="true" />
          </div>

          {/* Grid responsif: 1 kolom di HP, 2 kolom di tablet, 3 kolom di desktop */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  <article className="relative h-full min-h-[150px] rounded-xl border border-ut-sky/40 bg-white px-3 pb-3 pt-8 text-center shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:min-h-[160px] sm:pt-9">
                    {/* Nomor Step */}
                    <span className="absolute -top-3 left-1/2 grid size-7 -translate-x-1/2 place-items-center rounded-full bg-ut-yellow text-xs font-black text-ut-navy shadow-md lg:-left-1.5 lg:translate-x-0">
                      {step.number}
                    </span>
                    
                    {/* Ikon */}
                    <Icon className="mx-auto mb-2 size-7 text-ut-blue" strokeWidth={1.8} aria-hidden="true" />
                    
                    {/* Badges (jika ada) */}
                    {/* Teks */}
                    <h3 className="mb-1 text-xs font-black leading-tight text-ut-navy sm:text-sm">{step.title}</h3>

                    {/* Badges di bawah judul */}
                    {step.badges ? (
                      <div className="mb-2 flex flex-wrap justify-center gap-1">
                        {step.badges.map((badge) => (
                          <span key={badge} className="inline-flex items-center gap-1 rounded-full border border-ut-sky/40 bg-slate-50 px-1.5 py-0.5 text-[0.6rem] font-bold text-ut-blue">
                            <CheckCircle2 className="size-2 text-ut-yellow" aria-hidden="true" />
                            {badge}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                  
                  {/* Chevron Penunjuk Arah (Hanya muncul di desktop, bukan di kartu paling kanan) */}
                  {index % 3 !== 2 && index < processSteps.length - 1 ? (
                    <ChevronRight className="absolute -right-2 top-1/2 z-10 hidden size-4 -translate-y-1/2 text-ut-blue/50 lg:block" aria-hidden="true" />
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

function SmallLogo({ label, wide = false }: { label: string; wide?: boolean }) {
  return (
    <span className={`inline-flex h-9 items-center justify-center rounded-full border border-hero-foreground/70 bg-hero-foreground/15 px-2.5 text-center text-[0.6rem] font-black leading-tight sm:h-11 sm:px-3 sm:text-xs ${wide ? "min-w-24 sm:min-w-32" : "min-w-9 sm:min-w-11"}`}>
      {label}
    </span>
  );
}

function BenefitsSection() {
  return (
    <section id="informasi" className="scroll-mt-20 bg-section-blue px-4 py-12 sm:px-6 md:px-8 md:py-16 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center font-display text-2xl font-black leading-tight text-ut-navy sm:text-3xl md:text-4xl">
          Kenapa Memilih Salute Arek Malang?
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4 md:mt-10">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article key={benefit.title} className="rounded-2xl bg-card p-5 text-center shadow-benefit sm:p-6 transition duration-300 hover:-translate-y-1 hover:shadow-form">
                <div className="mx-auto mb-4 grid size-14 place-items-center sm:mb-5 sm:size-16 rounded-full bg-ut-yellow text-ut-navy shadow-yellow">
                  <Icon className="size-7 sm:size-8" aria-hidden="true" />
                </div>
                <h3 className="text-base font-black leading-tight text-ut-navy sm:text-lg">{benefit.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:mt-3">{benefit.description}</p>
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
    <section id="kontak" className="scroll-mt-20 bg-background px-4 py-12 sm:px-6 md:px-8 md:py-16 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center font-display text-2xl font-black text-ut-navy sm:text-3xl md:text-4xl">Apa Kata Mereka?</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 md:mt-10 md:gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-testimonial transition duration-300 hover:-translate-y-1 hover:shadow-form sm:p-6">
              <Quote className="mb-3 size-8 fill-current text-ut-yellow sm:mb-4 sm:size-10" aria-hidden="true" />
              <p className="flex-1 text-sm italic leading-relaxed text-testimonial">“{item.quote}”</p>
              <div className="mt-5 flex items-center gap-3 sm:mt-6">
                <div className="grid size-12 shrink-0 place-items-center rounded-full bg-avatar text-sm font-black text-ut-navy">
                  {item.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-black text-ut-navy sm:text-base">{item.name}</h3>
                  <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-black ${item.status === "Alumni" ? "bg-ut-yellow text-ut-navy" : "bg-status-blue text-ut-blue"}`}>
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
    <footer className="bg-footer-blue px-4 py-6 text-hero-foreground sm:px-6 md:px-8 md:py-7 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-8">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:justify-start">
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lg sm:size-14">
            <Phone className="size-6 sm:size-8" aria-hidden="true" />
          </div>
          <p className="text-lg font-black leading-tight sm:text-xl">
            Informasi
            <span className="block">Pendaftaran</span>
          </p>
          <span className="hidden h-12 w-px bg-hero-foreground/70 sm:block" aria-hidden="true" />
          <a href="tel:081230024264" className="rounded-full border-4 border-ut-sky bg-footer-pill px-4 py-2 text-lg font-black tracking-normal text-hero-foreground shadow-inner transition hover:bg-ut-sky/30 sm:px-6 sm:text-2xl md:text-3xl">
            0812-3002-4264
          </a>
        </div>
        <p className="text-center font-script text-2xl font-bold italic leading-tight text-hero-foreground sm:text-3xl md:text-right md:text-4xl">
          Kuliah Fleksibel
          <span className="block">Raih Masa Depan</span>
        </p>
      </div>
    </footer>
  );
}
