import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Layers3,
  Mail,
  MapPin,
  Menu,
  MessagesSquare,
  Phone,
  X,
} from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/public-site-chrome";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/program-sarjana")({
  head: () => ({
    meta: [
      { title: "Program Sarjana - SALUT Arek Malang" },
      {
        name: "description",
        content:
          "Informasi detail Program Sarjana Universitas Terbuka melalui SALUT Arek Malang.",
      },
    ],
  }),
  component: ProgramSarjanaPage,
});

type CmsItem = {
  id: string;
  sort_order: number;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  icon: string | null;
  is_published: boolean;
};

type CmsSection = {
  id: string;
  kind: string;
  sort_order: number;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  media_url: string | null;
  link_url: string | null;
  link_label: string | null;
  items: CmsItem[];
};

const fallbackSections: CmsSection[] = [
  {
    id: "hero",
    kind: "program_sarjana_hero",
    sort_order: 1,
    eyebrow: "Program Pendidikan",
    title: "Program Studi Unggulan: Program Sarjana",
    subtitle: "S1",
    body:
      "Pilih program sarjana yang sesuai dengan minat, kemampuan, dan rencana masa depan Anda.",
    media_url:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=85",
    link_url: "/daftar",
    link_label: "Mulai Pendaftaran",
    items: [
      {
        id: "h1",
        sort_order: 1,
        title: "Kurikulum Unggulan",
        subtitle: "Kurikulum relevan",
        body: "Materi pembelajaran dirancang untuk membangun kompetensi akademik dan profesional.",
        icon: "book-open",
        is_published: true,
      },
      {
        id: "h2",
        sort_order: 2,
        title: "Prospek Karier Alumni",
        subtitle: "Karier dan kompetensi",
        body: "Bekali diri dengan pengetahuan dan keterampilan yang dapat mendukung perjalanan karier.",
        icon: "graduation-cap",
        is_published: true,
      },
      {
        id: "h3",
        sort_order: 3,
        title: "Dukungan Beasiswa",
        subtitle: "Peluang pembiayaan",
        body: "Dapatkan informasi mengenai dukungan pembiayaan dan kesempatan beasiswa yang tersedia.",
        icon: "badge-check",
        is_published: true,
      },
      {
        id: "h4",
        sort_order: 4,
        title: "Fasilitas Pembelajaran",
        subtitle: "Belajar fleksibel",
        body: "Manfaatkan dukungan layanan pembelajaran untuk menunjang proses studi Anda.",
        icon: "briefcase-business",
        is_published: true,
      },
    ],
  },
  {
    id: "intro",
    kind: "program_sarjana_intro",
    sort_order: 2,
    eyebrow: "Mengenal Program Sarjana",
    title: "Membangun Kompetensi, Membuka Peluang Masa Depan",
    subtitle: "Belajar fleksibel untuk mahasiswa yang ingin berkembang",
    body:
      "Program Sarjana Universitas Terbuka memberikan kesempatan bagi calon mahasiswa untuk mengembangkan kompetensi akademik dan profesional. Pilih bidang studi yang sesuai dengan tujuan Anda dan rencanakan perjalanan pendidikan bersama SALUT Arek Malang.",
    media_url: null,
    link_url: null,
    link_label: null,
    items: [],
  },
  {
    id: "facts",
    kind: "program_sarjana_facts",
    sort_order: 3,
    eyebrow: "Informasi Program",
    title: "Fakta Program Sarjana",
    subtitle: "Kenali pilihan bidang yang tersedia",
    body:
      "Pilih bidang yang paling sesuai dengan minat dan rencana pengembangan diri Anda.",
    media_url: null,
    link_url: null,
    link_label: null,
    items: [],
  },
  {
    id: "application",
    kind: "program_sarjana_application",
    sort_order: 4,
    eyebrow: "University Application",
    title: "Siap Memulai Perkuliahan?",
    subtitle: "Butuh Informasi Lebih Lanjut?",
    body:
      "Dapatkan informasi lebih lengkap mengenai pilihan program sarjana, persyaratan, dan tahapan pendaftaran melalui tim SALUT Arek Malang.",
    media_url:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85",
    link_url: "/daftar",
    link_label: "Tanya & Daftar",
    items: [],
  },
  {
    id: "cta",
    kind: "program_sarjana_cta",
    sort_order: 5,
    eyebrow: "SALUT Arek Malang",
    title: "Siap Mulai Perkuliahan?",
    subtitle: "Butuh Informasi Lebih Lanjut?",
    body:
      "Hubungi SALUT Arek Malang untuk mendapatkan informasi dan pendampingan pendaftaran Program Sarjana.",
    media_url: null,
    link_url: "/daftar",
    link_label: "Daftar Sekarang",
    items: [
      {
        id: "c1",
        sort_order: 1,
        title: "SALUT Arek Malang",
        subtitle: "Mal Pelayanan Publik Merdeka Malang Lt. 3",
        body: "Jl. Mayjen Sungkono, Kota Malang",
        icon: "map-pin",
        is_published: true,
      },
      {
        id: "c2",
        sort_order: 2,
        title: "WhatsApp",
        subtitle: "0812-3002-4264",
        body: "Konsultasi dan informasi pendaftaran",
        icon: "phone",
        is_published: true,
      },
      {
        id: "c3",
        sort_order: 3,
        title: "E-mail",
        subtitle: "admin@salutarekmalang.com",
        body: "Kirim pertanyaan melalui email",
        icon: "mail",
        is_published: true,
      },
    ],
  },
];

async function fetchProgramSarjanaCms(): Promise<CmsSection[]> {
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", "program-sarjana")
    .eq("is_published", true)
    .maybeSingle();

  if (pageError) throw pageError;
  if (!page?.id) return [];

  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select(
      "id, kind, sort_order, eyebrow, title, subtitle, body, media_url, link_url, link_label",
    )
    .eq("page_id", page.id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (sectionsError) throw sectionsError;
  if (!sections?.length) return [];

  const ids = sections.map((section) => section.id);
  const { data: items, error: itemsError } = await supabase
    .from("section_items")
    .select(
      "id, section_id, sort_order, title, subtitle, body, icon, is_published",
    )
    .in("section_id", ids)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (itemsError) throw itemsError;

  return sections.map((section) => ({
    ...section,
    items: (items ?? []).filter((item) => item.section_id === section.id),
  }));
}

function iconFor(name: string | null | undefined) {
  const key = name?.toLowerCase();
  if (key === "graduation-cap") return GraduationCap;
  if (key === "badge-check") return BadgeCheck;
  if (key === "briefcase-business") return BriefcaseBusiness;
  if (key === "clock-3") return Clock3;
  if (key === "layers-3") return Layers3;
  if (key === "messages-square") return MessagesSquare;
  if (key === "map-pin") return MapPin;
  if (key === "phone") return Phone;
  if (key === "mail") return Mail;
  return BookOpen;
}

function ProgramSarjanaPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const cmsQuery = useQuery({
    queryKey: ["public-program-sarjana"],
    queryFn: fetchProgramSarjanaCms,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const sections = cmsQuery.data?.length ? cmsQuery.data : fallbackSections;
  const hero = sections.find((item) => item.kind === "program_sarjana_hero") ?? fallbackSections[0];
  const intro = sections.find((item) => item.kind === "program_sarjana_intro") ?? fallbackSections[1];
  const facts = sections.find((item) => item.kind === "program_sarjana_facts") ?? fallbackSections[2];
  const application = sections.find((item) => item.kind === "program_sarjana_application") ?? fallbackSections[3];
  const cta = sections.find((item) => item.kind === "program_sarjana_cta") ?? fallbackSections[4];

  const consultationHref = `https://wa.me/6281230024264?text=${encodeURIComponent(
    `Halo Tim SALUT Arek Malang, saya ${name || "[Nama]"}. Saya ingin berkonsultasi mengenai Program Sarjana. Nomor WhatsApp saya: ${whatsapp || "[Nomor WhatsApp]"}.`,
  )}`;

  return (
    <main className="min-h-screen bg-[#fafaf5] font-body text-[#101010]">
      <PublicHeader />

      <section className="px-3 pt-3 sm:px-5 lg:px-7">
        <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[2rem] bg-white shadow-sm">
          <div className="relative h-[330px] overflow-hidden sm:h-[430px] lg:h-[560px]">
            <img src={hero.media_url || fallbackSections[0].media_url || ""} alt="" className="h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/10" />
          </div>
          <div className="relative -mt-1 rounded-b-[2rem] bg-[#f5f4ee] px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-11">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#08266f]">{hero.eyebrow}</p>
            <h1 className="mt-2 max-w-5xl font-display text-3xl font-black leading-tight text-[#08266f] sm:text-4xl lg:text-5xl">{hero.title}</h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-600 sm:text-base">{hero.body}</p>
          </div>
        </div>
      </section>

      <section className="relative mx-3 -mt-1 overflow-hidden rounded-b-[2rem] bg-[#08266f] px-5 pb-5 pt-10 text-white sm:mx-5 sm:px-8 lg:mx-7 lg:px-10 lg:pb-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 grid gap-4 lg:grid-cols-[1fr_2fr] lg:items-center">
            <p className="text-xs font-bold text-white/80">+ Pilih berdasarkan tujuan dan rencana masa depan Anda</p>
            <p className="max-w-2xl text-sm font-bold leading-6 text-white/90">{hero.subtitle || "Program Sarjana Universitas Terbuka"}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {hero.items.slice(0, 4).map((item) => {
              const Icon = iconFor(item.icon);
              return (
                <article key={item.id} className="min-h-[170px] rounded-[1.35rem] bg-[#faf8e9] p-5 text-slate-950 shadow-sm sm:min-h-[190px] sm:p-6">
                  <div className="mb-5 grid size-11 place-items-center rounded-full border-4 border-[#facc15] bg-[#08266f] text-[#facc15]">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="text-base font-black leading-tight sm:text-lg">{item.title}</h2>
                  <p className="mt-2 text-[11px] font-extrabold text-slate-700">{item.subtitle}</p>
                  <p className="mt-2 text-[11px] leading-5 text-slate-600">{item.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 md:py-20 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.35fr_0.85fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#08266f]">{intro.eyebrow}</p>
            <h2 className="mt-2 max-w-2xl font-display text-3xl font-black leading-tight sm:text-4xl">{intro.title}</h2>
            <p className="mt-3 text-sm font-semibold text-slate-500">{intro.subtitle}</p>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-700">{intro.body}</p>

            <div className="mt-8 space-y-4">
              {[
                { title: "Fleksibilitas Belajar", text: "Belajar menyesuaikan aktivitas", icon: Clock3 },
                { title: "Pilihan Program Studi", text: "Beragam bidang keilmuan", icon: Layers3 },
                { title: "Layanan SALUT Arek Malang", text: "Pendampingan informasi", icon: MessagesSquare },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-[#facc15] text-[#08266f]"><item.icon className="size-4" /></div>
                  <div><p className="text-sm font-black">{item.title}</p><p className="text-xs leading-5 text-slate-600">{item.text}</p></div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[1.8rem] bg-[#08266f] p-6 text-white shadow-xl sm:p-7">
            <div className="mb-6 text-center">
              <p className="text-lg font-black leading-6">Pendaftaran Konsultasi Gratis<br />dengan Tim SALUT</p>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); window.open(consultationHref, "_blank", "noopener,noreferrer"); }} className="space-y-4">
              <label className="block">
                <span className="sr-only">Nama Lengkap</span>
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama Lengkap" required className="w-full rounded-full border-0 bg-[#e8e8e8] px-5 py-3 text-sm font-semibold text-slate-800 outline-none ring-0 placeholder:text-slate-500" />
              </label>
              <label className="block">
                <span className="sr-only">Nomor WhatsApp</span>
                <input value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="Nomor WhatsApp (Aktif)" required inputMode="tel" className="w-full rounded-full border-0 bg-[#e8e8e8] px-5 py-3 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-500" />
              </label>
              <div className="rounded-2xl bg-white/10 p-4 text-xs leading-5 text-blue-100">
                Silakan isi data singkat. Tim SALUT akan membantu memberikan informasi Program Sarjana dan pilihan program studi.
              </div>
              <button type="submit" className="w-full rounded-full bg-[#facc15] px-5 py-4 text-sm font-black text-[#08266f] shadow-lg transition-transform hover:scale-[1.01]">Jadwalkan Konsultasi Sekarang</button>
            </form>
          </aside>
        </div>
      </section>

      <section className="bg-white px-5 py-14 sm:px-8 md:py-20 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#08266f]">{facts.eyebrow}</p>
            <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">{facts.title}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">{facts.subtitle}</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {facts.items.map((item) => (
              <article key={item.id} className="rounded-[1.5rem] bg-[#08266f] p-5 text-white shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-[#facc15] text-[#08266f]"><GraduationCap className="size-5" /></div>
                  <div><p className="text-xs font-bold text-white/60">• Education</p><h3 className="text-base font-black">{item.title}</h3></div>
                </div>
                <p className="text-xs font-bold text-[#facc15]">{item.subtitle}</p>
                <p className="mt-2 text-xs leading-5 text-blue-100/80">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 md:py-20 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#08266f]">{application.eyebrow}</p>
            <h2 className="mt-2 font-display text-3xl font-black leading-tight sm:text-4xl">{application.title}<br /><span className="text-[#08266f]">{application.subtitle}</span></h2>
            <p className="mt-5 text-sm leading-7 text-slate-700">{application.body}</p>
            <ul className="mt-6 space-y-3 text-xs font-semibold text-slate-700">
              {application.items.slice(0, 3).map((item) => <li key={item.id} className="flex gap-3"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#08266f]" />{item.title}: {item.body}</li>)}
            </ul>
            <Link to={application.link_url || "/daftar"} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#08266f] px-6 py-3 text-sm font-black text-white">Tanya & Daftar <ArrowRight className="size-4 text-[#facc15]" /></Link>
          </div>
          <div className="order-1 overflow-hidden rounded-[2rem] bg-white shadow-xl lg:order-2">
            <img src={application.media_url || ""} alt="Informasi pendaftaran Program Sarjana" className="aspect-[4/3] h-full w-full object-cover" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="bg-[#f5f4ee] px-5 py-14 sm:px-8 md:py-20 lg:px-12">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#08266f]">{cta.eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl font-black text-[#08266f] sm:text-4xl">{cta.title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">{cta.body}</p>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {cta.items.map((item) => {
              const Icon = iconFor(item.icon);
              const href = item.title === "WhatsApp" ? "https://wa.me/6281230024264" : item.title === "E-mail" ? "mailto:admin@salutarekmalang.com" : "#";
              return (
                <a key={item.id} href={href} className="group rounded-[1.5rem] bg-[#08266f] p-6 text-left text-white shadow-sm transition-transform hover:-translate-y-1">
                  <div className="mb-5 flex items-center justify-between gap-4"><h3 className="text-base font-black">{item.title}</h3><span className="grid size-11 place-items-center rounded-full bg-[#facc15] text-[#08266f]"><Icon className="size-5" /></span></div>
                  <p className="text-sm font-black">{item.subtitle}</p>
                  <p className="mt-2 text-xs leading-5 text-blue-100/75">{item.body}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
