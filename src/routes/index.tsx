import { createFileRoute, Link } from "@tanstack/react-router";
import consultantImage from "@/assets/consultant.webp";
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
  LayoutDashboard,
  MessageCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { fetchPublicHeroBanners } from "@/lib/hero-banners";
import { defaultFooterContent, fetchPublicFooter } from "@/lib/footer";
import { supabase } from "@/integrations/supabase/client";
import { SiteLogo } from "@/components/site-logo";
import { PublicHeader, PublicFooter } from "@/components/public-site-chrome";
import { resolveIcon } from "@/lib/cms";
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

async function fetchHomepageCms() {
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", "beranda")
    .eq("is_published", true)
    .maybeSingle();

  if (pageError) throw pageError;
  if (!page?.id) return { sections: [], items: [] };

  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select("id, kind, title, subtitle, body, media_url, link_url, link_label, config, is_published, sort_order")
    .eq("page_id", page.id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (sectionsError) throw sectionsError;

  const sectionIds = (sections ?? []).map((section) => section.id);
  if (!sectionIds.length) return { sections: sections ?? [], items: [] };

  const { data: items, error: itemsError } = await supabase
    .from("section_items")
    .select("id, section_id, sort_order, title, subtitle, body, icon, badges, media_url, video_url, document_url, link_url, link_label, config, is_published")
    .in("section_id", sectionIds)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (itemsError) throw itemsError;

  return { sections: sections ?? [], items: items ?? [] };
}

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

export function Index() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fafc] font-body text-foreground">
      <PublicHeader />
      <HeroBanner />
      <KeunggulanBannerSection />
      <div className="bg-white">
        <CombinedCTAProcessSection />
      </div>
      <BenefitsSection />
      <TestimonialsSection />
      <PublicFooter />
    </main>
  );
}



function HeroBanner() {
  const [activeSlide, setActiveSlide] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("public-hero-banners-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hero_banners" },
        () => {
          void queryClient.invalidateQueries({
            queryKey: ["public-hero-banners"],
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

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
  const homepageCmsQuery = useQuery({
    queryKey: ["homepage-cms", "beranda"],
    queryFn: fetchHomepageCms,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const cmsSections = homepageCmsQuery.data?.sections ?? [];
  const cmsItems = homepageCmsQuery.data?.items ?? [];
  const processSection = cmsSections.find((section) => section.kind === "process");
  const contactSection = cmsSections.find((section) => section.kind === "contact_banner");
  const cmsProcessItems = cmsItems
    .filter((item) => item.section_id === processSection?.id)
    .sort((a, b) => a.sort_order - b.sort_order);
  const cmsProcessSteps = cmsProcessItems.length
    ? cmsProcessItems.map((item, index) => ({
        number: String(index + 1),
        icon: resolveIcon(item.icon) ?? processSteps[index]?.icon ?? ClipboardPenLine,
        title: item.title?.trim() || processSteps[index]?.title || "Langkah",
        description: item.body?.trim() || processSteps[index]?.description || "",
        badges: item.badges?.length ? item.badges : processSteps[index]?.badges,
        details: typeof item.config?.details === "string" && item.config.details.trim()
          ? item.config.details.split("\\n").map((detail) => detail.trim()).filter(Boolean)
          : [item.body?.trim() || processSteps[index]?.description || ""],
      }))
    : processSteps;
  const cmsProcessTitle = processSection?.title?.trim() || "Kuliah Fleksibel, Raih Masa Depan Bersama SALUT Arek Malang";
  const cmsContactTitle = contactSection?.title?.trim() || "Konsultasi Gratis dengan Tim SALUT";
  const cmsContactLink = contactSection?.link_url?.trim() || "https://wa.me/6281230024264?text=Halo%20Tim%20SALUT%20Arek%20Malang,%20saya%20ingin%20konsultasi%20pendaftaran";
  const cmsContactButton = contactSection?.link_label?.trim() || "Konsultasi Via Whatsapp";
  const [selectedStep, setSelectedStep] =
    useState<(typeof processSteps)[0] | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(4);

  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1280) {
        setCardsPerView(2);
      } else {
        setCardsPerView(4);
      }
    };

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  useEffect(() => {
    const maxStartIndex = Math.max(0, cmsProcessSteps.length - cardsPerView);
    setStartIndex((current) => Math.min(current, maxStartIndex));
  }, [cardsPerView]);

  const maxStartIndex = Math.max(0, cmsProcessSteps.length - cardsPerView);
  const visibleSteps = cmsProcessSteps.slice(
    startIndex,
    startIndex + cardsPerView,
  );

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
      className="relative z-10 mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8"
    >
      {selectedStep && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedStep(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="process-step-dialog-title"
            className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative flex items-center justify-between gap-4 overflow-hidden bg-[#0B1E48] p-5 text-white sm:p-6">
              <div className="relative z-10 flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#FACC15] text-[#0B1E48] sm:size-12">
                  <selectedStep.icon className="size-5 sm:size-6" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#FACC15] sm:text-xs">
                    Langkah {selectedStep.number}
                  </p>
                  <h3
                    id="process-step-dialog-title"
                    className="truncate text-lg font-extrabold sm:text-xl"
                  >
                    {selectedStep.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStep(null)}
                className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Tutup detail langkah"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
              <p className="mb-4 text-sm font-medium leading-6 text-slate-600 sm:text-base">
                {selectedStep.description}
              </p>
              <ul className="space-y-2.5">
                {selectedStep.details.map((detail, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm leading-6 text-slate-700"
                  >
                    <div className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
                      <Check className="size-3.5" strokeWidth={3} />
                    </div>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end border-t border-slate-100 bg-slate-50 p-4">
              <button
                type="button"
                onClick={() => setSelectedStep(null)}
                className="rounded-full bg-slate-200 px-6 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-300"
              >
                Tutup Pemandu
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-[2rem] border border-amber-100/70 bg-[#FAF8EE] p-4 shadow-sm sm:rounded-[2.25rem] sm:p-6 md:p-8 lg:rounded-[2.5rem] lg:p-10 xl:p-12">
        <div className="grid grid-cols-1 items-stretch gap-7 lg:grid-cols-12 lg:gap-8">
          <div className="flex min-w-0 flex-col justify-between lg:col-span-8">
            <div>
              <h2 className="mb-6 text-[1.85rem] font-extrabold leading-[1.13] tracking-tight text-[#0B1E48] sm:text-3xl md:text-4xl lg:mb-7 lg:text-[2.65rem]">
                Kuliah Fleksibel, Raih Masa
                <br className="hidden sm:block" />
                Depan Bersama{" "}
                <span className="text-[#FACC15]">SALUT</span>
                <br className="hidden sm:block" />
                <span className="text-[#FBBF24]">Arek Malang</span>
              </h2>

              <div className="relative px-4 sm:px-5">

                <div
                  className={`grid gap-3 ${
                    cardsPerView === 1
                      ? "grid-cols-1"
                      : cardsPerView === 2
                        ? "grid-cols-2"
                        : "grid-cols-4"
                  }`}
                >
                  {visibleSteps.map((step) => {
                    const Icon = step.icon;

                    return (
                      <button
                        key={step.number}
                        type="button"
                        onClick={() => setSelectedStep(step)}
                        className="group relative flex min-h-[175px] w-full min-w-0 cursor-pointer flex-col justify-between rounded-2xl border border-slate-100 bg-white p-3.5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FACC15]/70 sm:min-h-[185px] sm:p-4"
                      >
                        <div className="absolute left-2 top-2 flex size-6 items-center justify-center rounded-full bg-[#FACC15] text-[11px] font-black text-[#0B1E48] sm:left-3 sm:top-3 sm:size-7 sm:text-xs">
                          {step.number}
                        </div>

                        <div className="mx-auto mb-2 mt-2 grid size-10 place-items-center rounded-full bg-blue-50 text-blue-600 transition-colors group-hover:bg-[#FACC15] group-hover:text-[#0B1E48] sm:size-11">
                          <Icon className="size-4.5 sm:size-5" strokeWidth={2.2} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="mb-1 text-[11px] font-extrabold leading-tight text-[#0B1E48] sm:text-xs">
                            {step.title}
                          </h3>
                          <p className="mx-auto line-clamp-3 max-w-[12rem] text-[10px] leading-tight text-slate-500 sm:text-[11px]">
                            {step.description}
                          </p>
                        </div>

                        <div className="mt-2 flex min-h-5 items-center justify-center">
                          {step.badges ? (
                            <div className="flex max-w-full flex-wrap justify-center gap-1">
                              {step.badges.map((badge) => (
                                <span
                                  key={badge}
                                  className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[8px] font-bold text-slate-600 sm:text-[9px]"
                                >
                                  {badge}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-blue-600 group-hover:underline sm:text-[11px]">
                              Lihat detail →
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>

              <div className="mt-4 flex justify-center sm:mt-5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0B1E48] px-3 py-1.5 shadow-sm">
                  {Array.from({ length: maxStartIndex + 1 }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setStartIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === startIndex
                          ? "w-5 bg-[#FACC15]"
                          : "w-2 bg-slate-400 hover:bg-white"
                      }`}
                      aria-label={`Ke slide ${index + 1}`}
                      aria-current={index === startIndex ? "true" : undefined}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5 lg:mt-7">
              <Link
                to="/daftar"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#FACC15] px-6 text-sm font-extrabold text-[#0B1E48] shadow-md transition-all hover:-translate-y-0.5 hover:bg-yellow-400 hover:shadow-lg sm:h-12 sm:px-7"
              >
                Mulai Pendaftaran
                <ArrowRight className="size-4" strokeWidth={2.5} />
              </Link>

              <a
                href="/kemahasiswaan#informasi-pendidikan"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#0B1E48] px-6 text-sm font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#11275b] hover:shadow-lg sm:h-12 sm:px-7"
              >
                Lihat Jurusan Kuliah di UT
              </a>
            </div>
          </div>

          <div className="min-w-0 lg:col-span-4">
            <div className="relative flex min-h-[320px] h-full flex-col justify-between overflow-hidden rounded-[1.75rem] bg-[#0B1E48] p-6 text-white shadow-xl sm:min-h-[350px] sm:rounded-[2rem] sm:p-7 lg:min-h-[380px]">
              <div className="relative z-10 max-w-[58%] sm:max-w-[55%]">
                <h3 className="text-[1.65rem] font-black leading-[1.04] tracking-tight text-white sm:text-2xl lg:text-3xl">
                  {cmsContactTitle}
                </h3>
              </div>

              <div className="pointer-events-none absolute inset-y-0 right-0 w-[66%] overflow-hidden">
                <img
                  src={contactSection?.media_url?.trim() || consultantImage}
                  alt="Tim SALUT Arek Malang"
                  className="h-full w-full object-cover object-top opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B1E48] via-[#0B1E48]/55 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0B1E48]/70 to-transparent" />
              </div>

              <div className="relative z-20 mt-auto pt-24 sm:pt-28">
                <a
                  href={cmsContactLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-12 w-full items-center justify-between gap-2 rounded-full bg-[#FACC15] px-4 py-2.5 text-[11px] font-extrabold text-[#0B1E48] shadow-lg transition-all hover:scale-[1.02] hover:bg-yellow-400 sm:text-xs"
                >
                  <span className="min-w-0 truncate">{cmsContactButton}</span>
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#25D366] text-white shadow-sm">
                    <MessageCircle className="size-4 fill-current" />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function KeunggulanBannerSection() {
  return (
    <section className="relative z-10 mx-auto mt-8 max-w-7xl px-4 pb-14 sm:mt-10 sm:px-6 md:mt-12 md:px-8">
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
  const homepageCmsQuery = useQuery({
    queryKey: ["homepage-cms", "benefits"],
    queryFn: fetchHomepageCms,
    staleTime: 0,
    refetchOnMount: "always",
  });
  const cmsSections = homepageCmsQuery.data?.sections ?? [];
  const cmsItems = homepageCmsQuery.data?.items ?? [];
  const benefitsSection = cmsSections.find((section) => section.kind === "benefits");
  const cmsBenefits = cmsItems
    .filter((item) => item.section_id === benefitsSection?.id)
    .sort((a, b) => a.sort_order - b.sort_order);
  const visibleBenefits = cmsBenefits.length
    ? cmsBenefits.map((item, index) => ({
        icon: resolveIcon(item.icon) ?? benefits[index]?.icon ?? Gift,
        title: item.title?.trim() || benefits[index]?.title || "Keunggulan",
        description: item.body?.trim() || benefits[index]?.description || "",
      }))
    : benefits;

  return (
    <section
      id="informasi"
      className="scroll-mt-20 border-t border-slate-100 bg-white px-4 py-12 sm:px-6 md:px-8 md:py-20 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-extrabold leading-tight text-[#111c38] sm:text-4xl">
            {benefitsSection?.title?.trim() || "Kenapa Memilih Salute Arek Malang?"}
          </h2>

          <div
            className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-[#facc15]"
            aria-hidden="true"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visibleBenefits.map((benefit) => {
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
