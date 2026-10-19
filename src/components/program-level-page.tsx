import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, BookOpen, BriefcaseBusiness, CheckCircle2, Clock3, GraduationCap, Layers3, Mail, MapPin, MessagesSquare, Phone } from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/public-site-chrome";
import { supabase } from "@/integrations/supabase/client";

type Program = "Diploma" | "Magister" | "Doktoral" | "Profesi Guru";
type Props = { program: Program; credential: string; slug: string };
type Item = { id: string; title: string | null; subtitle: string | null; body: string | null; icon: string | null; link_url?: string | null; link_label?: string | null; is_published: boolean };
type Section = { id: string; kind: string; eyebrow: string | null; title: string | null; subtitle: string | null; body: string | null; media_url: string | null; link_url: string | null; link_label: string | null; items: Item[] };

const defaults: Record<Program, { intro: string; facts: string[]; description: string }> = {
  Diploma: { intro: "Bangun keterampilan praktis dan kompetensi profesional untuk siap memasuki dunia kerja.", facts: ["D3 Perpajakan","D3 Teknologi Informasi","D3 Penyiaran","D4 Kearsipan","D4 Pengelolaan Arsip dan Rekaman Informasi","D4 Akuntansi Bisnis Digital","D4 Manajemen Logistik"], description: "Program Diploma Universitas Terbuka dirancang untuk membangun kompetensi terapan yang relevan dengan kebutuhan profesional dan dunia kerja." },
  Magister: { intro: "Kembangkan keahlian, kepemimpinan, dan wawasan profesional melalui pendidikan pascasarjana.", facts: ["Administrasi Publik (S2)","Manajemen (S2)","Ilmu Kelautan (S2)","Pendidikan Matematika (S2)","Pendidikan Dasar (S2)","Hukum (S2)"], description: "Program Magister memberikan ruang untuk memperdalam keilmuan, riset, dan kemampuan profesional dengan pola belajar fleksibel." },
  Doktoral: { intro: "Perluas kontribusi keilmuan melalui riset dan pengembangan pengetahuan tingkat doktoral.", facts: ["Doktor Administrasi Publik (S3)","Doktor Ilmu Manajemen (S3)"], description: "Program Doktoral ditujukan bagi pengembangan keahlian tingkat lanjut, riset, dan kontribusi akademik maupun profesional." },
  "Profesi Guru": { intro: "Perkuat kompetensi profesional pendidik melalui Program Pendidikan Profesi Guru.", facts: ["Pendidikan Profesi Guru (PPG)"], description: "Program Profesi Guru mendukung pengembangan kompetensi profesional dan pedagogik untuk menjalankan peran sebagai pendidik." },
};

async function fetchCms(slug: string): Promise<Section[]> {
  const { data: page, error } = await supabase.from("pages").select("id").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (error) throw error;
  if (!page) return [];
  const { data: sections, error: se } = await supabase.from("sections").select("id,kind,eyebrow,title,subtitle,body,media_url,link_url,link_label,sort_order").eq("page_id", page.id).eq("is_published", true).order("sort_order");
  if (se) throw se;
  const ids = (sections ?? []).map(s => s.id);
  if (!ids.length) return [];
  const { data: items, error: ie } = await supabase.from("section_items").select("id,section_id,title,subtitle,body,icon,link_url,link_label,is_published,sort_order").in("section_id", ids).eq("is_published", true).order("sort_order");
  if (ie) throw ie;
  return (sections ?? []).map(s => ({ ...s, items: (items ?? []).filter(i => i.section_id === s.id) }));
}

const diplomaPrograms: Item[] = [
  {
    id: "d3-perpajakan",
    title: "D3 Perpajakan",
    subtitle: "Visi: Menjadi Program Studi vokasi yang berkualitas di bidang perpajakan melalui penyelenggaraan Pendidikan Tinggi Terbuka dan Jarak Jauh (PTTJJ).",
    body: "Misi:\n• Menyelenggarakan pendidikan vokasi dalam bidang perpajakan bagi masyarakat melalui PTTJJ.\n• Menyelenggarakan penelitian dan mendiseminasikan hasil penelitian di bidang perpajakan.\n• Menghasilkan lulusan yang mempunyai keahlian di bidang perpajakan dan mempunyai daya saing di masyarakat.\n• Menjalin kemitraan dengan institusi baik di dalam maupun luar negeri untuk pengembangan bidang perpajakan.\n\nTujuan:\n• Menghasilkan lulusan yang mampu menggunakan konsep dan teori di bidang perpajakan.\n• Menghasilkan dan mendiseminasikan penelitian yang mendukung pengembangan perpajakan.\n• Menghasilkan program pengabdian kepada masyarakat yang sesuai dengan bidang perpajakan.\n• Menghasilkan kerja sama dengan berbagai pihak yang dapat mendukung peningkatan kuantitas dan kualitas program studi perpajakan.",
    icon: "graduation-cap",
    is_published: true,
  },
  {
    id: "d4-kearsipan",
    title: "D4 Kearsipan",
    subtitle: "Visi: Menjadi program studi D4-Kearsipan yang berkualitas di bidang kearsipan yang mudah diakses melalui pendidikan tinggi terbuka dan jarak jauh (PTTJJ).",
    body: "Misi:\n• Menghasilkan lulusan program sarjana terapan bidang arsip yang mampu bersaing di dunia kerja.\n• Menghasilkan lulusan program sarjana terapan bidang arsip sesuai dengan standar kompetensi nasional.\n• Menghasilkan lulusan bidang arsip yang menguasai TIK serta menguasai manajemen arsip statis dan arsip dinamis.\n• Menghasilkan lulusan yang mampu melakukan penelitian dan pengembangan ilmu kearsipan yang bermanfaat bagi dunia kerja.\n• Menghasilkan lulusan yang mampu menjalin kerja sama dengan institusi terkait dalam rangka mengembangkan inovasi bidang kearsipan.\n\nTujuan Program Studi:\n1. Menghasilkan lulusan program sarjana terapan bidang arsip yang mampu bersaing di dunia kerja.\n2. Menghasilkan lulusan program sarjana terapan bidang arsip sesuai dengan standar kompetensi nasional.\n3. Menghasilkan lulusan bidang arsip yang menguasai TIK serta menguasai manajemen arsip statis dan arsip dinamis.\n4. Menghasilkan lulusan yang mampu melakukan penelitian dan pengembangan ilmu kearsipan yang bermanfaat bagi dunia kerja.\n5. Menghasilkan lulusan yang mampu menjalin kerja sama dengan institusi terkait dalam rangka mengembangkan inovasi bidang kearsipan.\\n\\nInformasi Akademik:\\n• Profil Lulusan: Gambaran kompetensi, keterampilan, dan karakter lulusan sesuai visi, misi, dan kebutuhan dunia kerja.\\n• Capaian Pembelajaran Lulusan: Kompetensi pengetahuan, keterampilan, dan sikap yang harus dimiliki mahasiswa setelah menyelesaikan studi.\\n• Kurikulum: Struktur mata kuliah, beban studi, dan capaian pembelajaran yang diharapkan.\\n• Capaian Pembelajaran Mata Kuliah (CPMK): Informasi capaian pembelajaran pada setiap mata kuliah.\\n• Rencana Pembelajaran Semester (RPS): Informasi rencana pembelajaran semester yang digunakan dalam proses pembelajaran.",
    icon: "graduation-cap",
    is_published: true,
  },
];

function parseDiplomaSubsections(item: Item) {
  const normalize = (value: string) => value
    .replace(/\\\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r/g, "")
    .trim();
  const raw = normalize(item.body || "");
  const parts: { title: string; content: string }[] = [];
  const headingPattern = /(?:^|\n)\s*(Misi|Tujuan(?: Program Studi)?|Informasi Akademik)\s*:\s*/gi;
  const matches = [...raw.matchAll(headingPattern)];
  if (matches.length) {
    const first = matches[0];
    if (first.index !== undefined && first.index > 0) {
      const preface = raw.slice(0, first.index).trim();
      if (preface) parts.push({ title: "Informasi", content: preface });
    }
    matches.forEach((match, index) => {
      const start = (match.index ?? 0) + match[0].length;
      const end = index + 1 < matches.length ? (matches[index + 1].index ?? raw.length) : raw.length;
      const title = match[1].toLowerCase().startsWith("tujuan") ? "Tujuan" : match[1];
      const content = raw.slice(start, end).trim();
      if (content) parts.push({ title, content });
    });
  } else if (raw) {
    parts.push({ title: "Informasi Program", content: raw });
  }
  const vision = normalize(item.subtitle || "").replace(/^Visi\s*:\s*/i, "");
  return [{ title: "Visi", content: vision }, ...parts].filter(part => part.content);
}

function renderDiplomaContent(content: string) {
  const lines = content.split("\n").map(line => line.trim()).filter(Boolean);
  const bullets = lines.filter(line => /^[•●▪*-]\s*/.test(line) || /^\d+[.)]\s*/.test(line));
  if (bullets.length && bullets.length === lines.length) {
    return <ul className="space-y-3">{bullets.map((line, index) => <li key={index} className="flex items-start gap-3"><span className="mt-[0.6rem] size-2 shrink-0 rounded-full bg-[#c6b400]" /><span>{line.replace(/^[•●▪*-]\s*/, "").replace(/^\d+[.)]\s*/, "")}</span></li>)}</ul>;
  }
  return <div className="space-y-3">{lines.map((line, index) => <p key={index}>{line.replace(/^[•●▪*-]\s*/, "").replace(/^\d+[.)]\s*/, "")}</p>)}</div>;
}

function iconFor(name: string | null) {
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

export function ProgramLevelPage({ program, credential, slug }: Props) {
  const fallback = defaults[program];
  const query = useQuery({ queryKey: ["program-level", slug], queryFn: () => fetchCms(slug), staleTime: 0, refetchOnMount: "always", refetchOnWindowFocus: true });
  const cms = query.data ?? [];
  const hero = cms.find(s => s.kind.includes("hero"));
  const intro = cms.find(s => s.kind.includes("intro"));
  const facts = cms.find(s => s.kind.includes("facts"));
  const application = cms.find(s => s.kind.includes("application"));
  const cta = cms.find(s => s.kind.includes("cta"));
  const heroImage = hero?.media_url || "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=85";
  const factsItems = facts?.items.length ? facts.items : (program === "Diploma" ? diplomaPrograms : fallback.facts.map((title, i) => ({ id: String(i), title, subtitle: credential, body: "Pilihan program pendidikan yang dapat disesuaikan dengan tujuan akademik dan profesional Anda.", icon: "graduation-cap", is_published: true })));
  const contactItems = cta?.items.length ? cta.items : [
    { id:"loc", title:"SALUT Arek Malang", subtitle:"Mal Pelayanan Publik Merdeka Malang Lt. 3", body:"Jl. Mayjen Sungkono, Kota Malang", icon:"map-pin", is_published:true },
    { id:"wa", title:"WhatsApp", subtitle:"0812-3002-4264", body:"Konsultasi dan informasi pendaftaran", icon:"phone", is_published:true },
    { id:"mail", title:"E-mail", subtitle:"admin@salutarekmalang.com", body:"Kirim pertanyaan melalui email", icon:"mail", is_published:true },
  ];

  if (program === "Diploma") {
    return <main className="min-h-screen bg-[#fffef7] font-body text-[#17203b]">
      <PublicHeader />
      <section className="relative overflow-hidden bg-[#f8e51c] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="absolute -right-20 -top-24 size-80 rounded-full border-[50px] border-white/30" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[.22em] text-[#776900]">{hero?.eyebrow || "Program Pendidikan Vokasi"}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{hero?.title || "Pilihan Program Diploma yang Tersedia"}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700 sm:text-lg">{hero?.body || "Pilih program Diploma Universitas Terbuka yang sesuai dengan minat dan rencana profesional Anda."}</p>
          <div className="mt-7 flex flex-wrap gap-3"><a href="#pilihan-program" className="rounded-full bg-[#17203b] px-6 py-3 text-sm font-black text-white">Lihat Pilihan Program</a><a href="/daftar" className="rounded-full border-2 border-[#17203b] px-6 py-3 text-sm font-black text-[#17203b]">Mulai Pendaftaran</a></div>
        </div>
      </section>
      <section id="pilihan-program" className="scroll-mt-24 px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 max-w-3xl"><p className="text-xs font-black uppercase tracking-[.2em] text-[#8b7c00]">{facts?.eyebrow || "Program Diploma Universitas Terbuka"}</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">{facts?.title || "Pilihan Program Diploma yang Tersedia"}</h2><p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{facts?.subtitle || "Saat ini tersedia dua pilihan program Diploma berikut."}</p></div>
          <div className="grid items-start gap-6 lg:grid-cols-2">
            {factsItems.map((item, index) => <article key={item.id} className="overflow-hidden rounded-[1.75rem] border border-[#eee6a1] bg-white shadow-[0_18px_55px_-35px_rgba(23,32,59,.5)]">
              <div className="bg-[#17203b] px-6 py-6 text-white sm:px-8"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#f8e51c]">Program Diploma {index + 1}</p><h3 className="mt-2 text-2xl font-black sm:text-3xl">{item.title}</h3></div>
              <div className="grid grid-cols-1 gap-4 p-5 sm:p-7 sm:grid-cols-2 sm:gap-5">
                {parseDiplomaSubsections(item).map((part, partIndex) => <section key={part.title} className={`min-w-0 rounded-2xl border border-[#eee7b0] bg-[#fffef8] p-5 shadow-sm sm:p-6 ${part.title === "Visi" ? "sm:col-span-2 bg-[#fffbea]" : ""}`}>
                  <div className="mb-3 flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#f8e51c] text-sm font-black text-[#17203b]">{String(partIndex + 1).padStart(2, "0")}</span><h4 className="text-sm font-black uppercase tracking-wide text-[#17203b] sm:text-base">{part.title}</h4></div>
                  <div className="break-words text-sm leading-7 text-slate-700 [&_ul]:list-none">{renderDiplomaContent(part.content)}</div>
                </section>)}
                {item.link_url ? <div className="sm:col-span-2"><a href={item.link_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#f8e51c] px-5 py-3 text-sm font-black text-[#17203b]">{item.link_label || "Informasi Selengkapnya"} <ArrowRight className="size-4" /></a></div> : null}
              </div>
            </article>)}
          </div>
        </div>
      </section>
      <section className="bg-[#17203b] px-5 py-12 text-white sm:px-8 sm:py-16 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#f8e51c]">SALUT Arek Malang</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">Butuh informasi program Diploma?</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">Tim SALUT Arek Malang siap membantu Anda memahami pilihan program dan proses pendaftaran.</p></div><a href="/daftar" className="inline-flex items-center gap-2 rounded-full bg-[#f8e51c] px-6 py-3.5 text-sm font-black text-[#17203b]">Mulai Pendaftaran <ArrowRight className="size-4" /></a></div></section>
      <PublicFooter />
    </main>;
  }

  return <main className="min-h-screen bg-[#fafaf5] font-body text-[#101010]">
    <PublicHeader />
    <section className="px-3 pt-3 sm:px-5 lg:px-7">
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[2rem] bg-white shadow-sm">
        <div className="relative h-[330px] overflow-hidden sm:h-[430px] lg:h-[560px]"><img src={heroImage} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" /></div>
        <div className="rounded-b-[2rem] bg-[#f5f4ee] px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-11">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#08266f]">{hero?.eyebrow || "Program Pendidikan"}</p>
          <h1 className="mt-2 max-w-5xl font-display text-3xl font-black leading-tight text-[#08266f] sm:text-4xl lg:text-5xl">{hero?.title || `Program Studi Unggulan: Program ${program}`}</h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-600 sm:text-base">{hero?.body || fallback.intro}</p>
        </div>
      </div>
    </section>
    <section className="relative mx-3 -mt-1 overflow-hidden rounded-b-[2rem] bg-[#08266f] px-5 pb-5 pt-10 text-white sm:mx-5 sm:px-8 lg:mx-7 lg:px-10 lg:pb-8">
      <div className="mx-auto max-w-7xl"><div className="mb-7 grid gap-4 lg:grid-cols-[1fr_2fr] lg:items-center"><p className="text-xs font-bold text-white/80">+ Pilih berdasarkan tujuan dan rencana masa depan Anda</p><p className="max-w-2xl text-sm font-bold leading-6 text-white/90">{hero?.subtitle || credential}</p></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{(hero?.items.length ? hero.items : [
        {id:"1",title:"Kurikulum Relevan",subtitle:"Kompetensi",body:"Materi pembelajaran mendukung pengembangan kompetensi.",icon:"book-open"},
        {id:"2",title:"Prospek Profesional",subtitle:"Karier",body:"Bekali diri untuk perjalanan profesional.",icon:"graduation-cap"},
        {id:"3",title:"Dukungan Beasiswa",subtitle:"Peluang pembiayaan",body:"Dapatkan informasi dukungan pembiayaan yang tersedia.",icon:"badge-check"},
        {id:"4",title:"Belajar Fleksibel",subtitle:"Layanan pembelajaran",body:"Manfaatkan layanan pendukung proses studi.",icon:"briefcase-business"}
      ] as Item[]).slice(0,4).map(item => { const Icon=iconFor(item.icon); return <article key={item.id} className="min-h-[170px] rounded-[1.35rem] bg-[#faf8e9] p-5 text-slate-950 shadow-sm sm:min-h-[190px] sm:p-6"><div className="mb-5 grid size-11 place-items-center rounded-full border-4 border-[#facc15] bg-[#08266f] text-[#facc15]"><Icon className="size-5"/></div><h2 className="text-base font-black leading-tight sm:text-lg">{item.title}</h2><p className="mt-2 text-[11px] font-extrabold text-slate-700">{item.subtitle}</p><p className="mt-2 text-[11px] leading-5 text-slate-600">{item.body}</p></article> })}</div></div>
    </section>
    <section className="px-5 py-14 sm:px-8 md:py-20 lg:px-12"><div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.35fr_0.85fr] lg:items-start"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#08266f]">{intro?.eyebrow || `Mengenal Program ${program}`}</p><h2 className="mt-2 max-w-2xl font-display text-3xl font-black leading-tight sm:text-4xl">{intro?.title || "Membangun Kompetensi, Membuka Peluang Masa Depan"}</h2><p className="mt-3 text-sm font-semibold text-slate-500">{intro?.subtitle || fallback.intro}</p><p className="mt-6 max-w-2xl text-sm leading-7 text-slate-700">{intro?.body || fallback.description}</p><div className="mt-8 space-y-4">{[{title:"Fleksibilitas Belajar",text:"Belajar menyesuaikan aktivitas",icon:Clock3},{title:"Pilihan Program",text:"Pilih bidang sesuai tujuan",icon:Layers3},{title:"Layanan SALUT Arek Malang",text:"Pendampingan informasi",icon:MessagesSquare}].map(x=><div key={x.title} className="flex items-start gap-3"><div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-[#facc15] text-[#08266f]"><x.icon className="size-4"/></div><div><p className="text-sm font-black">{x.title}</p><p className="text-xs leading-5 text-slate-600">{x.text}</p></div></div>)}</div></div>
      <aside className="rounded-[1.8rem] bg-[#08266f] p-6 text-white shadow-xl sm:p-7"><div className="mb-6 text-center"><p className="text-lg font-black leading-6">Konsultasi Program {program}<br/>dengan Tim SALUT</p></div><a href={`https://wa.me/6281230024264?text=${encodeURIComponent(`Halo Tim SALUT Arek Malang, saya ingin berkonsultasi mengenai Program ${program}.`)}`} target="_blank" rel="noreferrer" className="block w-full rounded-full bg-[#facc15] px-5 py-4 text-center text-sm font-black text-[#08266f]">Jadwalkan Konsultasi Sekarang</a></aside>
    </div></section>
    <section className="bg-white px-5 py-14 sm:px-8 md:py-20 lg:px-12"><div className="mx-auto max-w-6xl"><div className="text-center"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#08266f]">{facts?.eyebrow || "Informasi Program"}</p><h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">{facts?.title || `Pilihan Program ${program}`}</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">{facts?.subtitle || "Kenali pilihan bidang yang tersedia."}</p></div><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{factsItems.map(item=><article key={item.id} className="rounded-[1.5rem] bg-[#08266f] p-5 text-white shadow-sm sm:p-6"><div className="mb-5 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#facc15] text-[#08266f]"><GraduationCap className="size-5"/></div><div><p className="text-xs font-bold text-white/60">• {credential}</p><h3 className="text-base font-black">{item.title}</h3></div></div><p className="text-xs font-bold text-[#facc15]">{item.subtitle}</p><p className="mt-2 text-xs leading-5 text-blue-100/80">{item.body}</p></article>)}</div></div></section>
    <section className="px-5 py-14 sm:px-8 md:py-20 lg:px-12"><div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#08266f]">{application?.eyebrow || "University Application"}</p><h2 className="mt-2 font-display text-3xl font-black leading-tight sm:text-4xl">{application?.title || "Siap Memulai Perkuliahan?"}<br/><span className="text-[#08266f]">{application?.subtitle || "Butuh Informasi Lebih Lanjut?"}</span></h2><p className="mt-5 text-sm leading-7 text-slate-700">{application?.body || `Dapatkan informasi lebih lengkap mengenai Program ${program}, persyaratan, dan tahapan pendaftaran melalui tim SALUT Arek Malang.`}</p><a href={application?.link_url || "/daftar"} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#08266f] px-6 py-3 text-sm font-black text-white">{application?.link_label || "Tanya & Daftar"} <ArrowRight className="size-4 text-[#facc15]"/></a></div><div className="overflow-hidden rounded-[2rem] bg-white shadow-xl"><img src={application?.media_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85"} alt="" className="aspect-[4/3] h-full w-full object-cover" loading="lazy"/></div></div></section>
    <section className="bg-[#f5f4ee] px-5 py-14 sm:px-8 md:py-20 lg:px-12"><div className="mx-auto max-w-6xl text-center"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#08266f]">{cta?.eyebrow || "SALUT Arek Malang"}</p><h2 className="mt-2 font-display text-3xl font-black text-[#08266f] sm:text-4xl">{cta?.title || `Siap Memulai Program ${program}?`}</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">{cta?.body || `Hubungi SALUT Arek Malang untuk mendapatkan informasi dan pendampingan pendaftaran Program ${program}.`}</p><div className="mt-9 grid gap-4 md:grid-cols-3">{contactItems.map(item=>{const Icon=iconFor(item.icon);const href=item.title==="WhatsApp"?"https://wa.me/6281230024264":item.title==="E-mail"?"mailto:admin@salutarekmalang.com":"#";return <a key={item.id} href={href} className="group rounded-[1.5rem] bg-[#08266f] p-6 text-left text-white shadow-sm transition-transform hover:-translate-y-1"><div className="mb-5 flex items-center justify-between gap-4"><h3 className="text-base font-black">{item.title}</h3><span className="grid size-11 place-items-center rounded-full bg-[#facc15] text-[#08266f]"><Icon className="size-5"/></span></div><p className="text-sm font-black">{item.subtitle}</p><p className="mt-2 text-xs leading-5 text-blue-100/75">{item.body}</p></a>})}</div></div></section>
    <PublicFooter />
  </main>;
}
