import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronDown, ChevronRight, Star, Trophy } from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/public-site-chrome";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/kemahasiswaan")({
  head: () => ({
    meta: [
      { title: "Kemahasiswaan - SALUT Arek Malang" },
      {
        name: "description",
        content:
          "Pusat informasi kemahasiswaan SALUT Arek Malang: kegiatan, prestasi, biaya pendidikan, dan beasiswa.",
      },
    ],
  }),
  component: KemahasiswaanPage,
});

const leaderboardData = [
  { rank: 1, name: "Andi Pratama", points: 1520 },
  { rank: 2, name: "Rina Aryanti", points: 1042 },
  { rank: 3, name: "Dwi Maryanto", points: 1243 },
  { rank: 4, name: "Achmad Dani", points: 1023 },
  { rank: 5, name: "Yumna Azmi", points: 832 },
];

const educationData = [
  {
    program: "Sarjana (S1)",
    faculties: [
      {
        name: "FEB",
        label: "Fakultas Ekonomi dan Bisnis",
        majors: ["Manajemen", "Ekonomi Pembangunan", "Ekonomi Syariah", "Akuntansi", "Akuntansi Keuangan Publik", "Pariwisata", "Kewirausahaan"],
      },
      {
        name: "FKIP",
        label: "Fakultas Keguruan dan Ilmu Pendidikan",
        majors: ["Pendidikan Bahasa dan Sastra Indonesia", "Pendidikan Bahasa Inggris", "Pendidikan Biologi", "Pendidikan Matematika", "Pendidikan Guru Sekolah Dasar (PGSD)", "Pendidikan Agama Islam"],
      },
      {
        name: "FST",
        label: "Fakultas Sains dan Teknologi",
        majors: ["Statistika", "Matematika", "Biologi", "Teknologi Pangan", "Agribisnis", "Sistem Informasi", "Sains Data"],
      },
      {
        name: "FHISIP",
        label: "Fakultas Hukum, Ilmu Sosial dan Ilmu Politik",
        majors: ["Ilmu Administrasi Publik", "Administrasi Bisnis", "Hukum", "Ilmu Pemerintahan", "Ilmu Komunikasi", "Sosiologi", "Sastra Inggris"],
      },
    ],
  },
  {
    program: "Diploma",
    majors: ["D4 Pengelolaan Arsip dan Rekaman Informasi", "D3 Perpajakan", "D4 Kearsipan", "D3 Teknologi Informasi", "D4 Akuntansi Bisnis Digital", "D4 Manajemen Logistik", "D3 Penyiaran"],
  },
  {
    program: "Magister (S2)",
    majors: ["Administrasi Publik (S2)", "Manajemen (S2)", "Ilmu Kelautan (S2)", "Pendidikan Matematika (S2)", "Pendidikan Dasar (S2)", "Hukum (S2)"],
  },
  {
    program: "Doktoral (S3)",
    majors: ["Doktor Administrasi Publik (S3)", "Doktor Ilmu Manajemen (S3)"],
  },
  {
    program: "Profesi",
    majors: ["Pendidikan Profesi Guru (PPG)"],
  },
  {
    program: "Sertifikat",
    majors: ["Program Sertifikat (MOOCs, BIPA, PMKM)"],
  },
] as const;

const educationPrograms = educationData.map((item) => item.program);


function KemahasiswaanPage() {
  const [activeBeasiswa, setActiveBeasiswa] = useState<string | null>(null);
  const sectionsQuery = useQuery({
    queryKey: ["kemahasiswaan-sections"],
    queryFn: async () => {
      const { data: page, error: pageError } = await supabase.from("pages").select("id").eq("slug", "kemahasiswaan").maybeSingle();
      if (pageError) throw pageError;
      if (!page) return [];
      const { data, error } = await supabase.from("sections").select("*, items:section_items(*)").eq("page_id", page.id).order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((section) => ({ ...section, items: [...(section.items ?? [])].filter((item) => item.is_published).sort((a,b) => a.sort_order-b.sort_order) }));
    },
  });
  const sections = sectionsQuery.data ?? [];
  const get = (kind: string) => sections.find((section) => section.kind === kind);
  const hero = get("hero");
  const join = get("benefits");
  const activities = get("activities");
  const leaderboard = get("leaderboard");
  const education = get("education");
  const scholarships = get("scholarships");
  const educationItems = education?.items ?? [];
  const educationPrograms = Array.from(new Set(educationItems.map((item) => item.subtitle || "Program Pendidikan")));
  const [activeProgram, setActiveProgram] = useState("");
  const selectedProgram = activeProgram || educationPrograms[0] || "";

  if (sectionsQuery.isLoading) return <main className="min-h-screen bg-white"><PublicHeader /><div className="mx-auto max-w-7xl p-10 text-center text-slate-500">Memuat informasi kemahasiswaan...</div><PublicFooter /></main>;

  return (
    <main className="min-h-screen bg-white font-body text-[#101010]">
      <PublicHeader />
      <section className="relative w-full">
        <div className="h-[250px] w-full overflow-hidden bg-gray-200 sm:h-[400px]">
          <img src={hero?.media_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=2000&q=80"} alt={hero?.title || "Kemahasiswaan SALUT Arek Malang"} className="h-full w-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
        </div>
      </section>
      <div className="relative z-10 mx-auto -mt-10 max-w-7xl px-5 pb-10 sm:-mt-20 sm:px-8 lg:px-10">
        <h1 className="mb-10 inline-block rounded-xl bg-white/80 px-4 py-2 text-2xl font-bold text-[#08266f] backdrop-blur-sm sm:text-4xl">{hero?.title || "Kemahasiswaan"}</h1>

        {join && <section className="mb-16 flex flex-col items-center gap-8 rounded-[2rem] bg-[#08266f] p-6 text-white shadow-xl sm:p-10 lg:flex-row">
          <div className="flex-1"><h2 className="mb-4 text-3xl font-bold leading-tight">{join.title}</h2><p className="mb-8 max-w-md text-sm leading-relaxed text-blue-100">{join.body}</p>{join.link_url && <a href={join.link_url} className="inline-flex rounded-xl bg-white px-6 py-3 text-sm font-black text-[#08266f]">{join.link_label || "Mulai Pendaftaran"}</a>}</div>
          <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-xl">{join.items.map((item) => <div key={item.id} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur"><p className="text-xs text-blue-100">{item.title}</p><p className="mt-1 text-sm font-black">{item.subtitle || item.body}</p></div>)}</div>
        </section>}

        {activities && <section className="mb-16"><div className="mb-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#08266f]">{activities.eyebrow || "Aktivitas Mahasiswa"}</p><h2 className="mt-2 text-3xl font-black text-slate-900">{activities.title || "Kegiatan Member"}</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{activities.subtitle || activities.body}</p></div><div className="grid gap-5 md:grid-cols-3">{activities.items.map((item,index)=><article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-[#08266f] text-xl font-black text-white">0{index+1}</div><h3 className="text-lg font-black text-slate-900">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-500">{item.body}</p></article>)}</div></section>}

        {leaderboard && <section className="mb-16 rounded-[2rem] bg-slate-50 p-6 sm:p-10"><div className="mb-8"><div className="mb-2 flex items-center gap-2 text-[#08266f]"><Trophy className="size-5"/><span className="text-xs font-black uppercase tracking-[0.2em]">{leaderboard.eyebrow || "Apresiasi"}</span></div><h2 className="text-3xl font-black text-slate-900">{leaderboard.title}</h2><p className="mt-2 text-sm text-slate-500">{leaderboard.body}</p></div><div className="grid gap-6 lg:grid-cols-[30%_70%]"><div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><h3 className="font-black text-slate-900">Peringkat</h3><Trophy className="size-5 text-[#08266f]"/></div><div className="grid gap-3">{leaderboard.items.filter(i=>!i.video_url).map((item,index)=><div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3"><div className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#08266f] text-xs font-black text-white">{index+1}</span><span className="truncate text-sm font-bold text-slate-800">{item.title}</span></div><span className="ml-2 shrink-0 text-xs font-black text-[#08266f]">{item.subtitle || item.body}</span></div>)}</div></div><div className="overflow-hidden rounded-3xl border border-slate-200 bg-white"><div className="aspect-video w-full bg-slate-900">{leaderboard.items.find(i=>i.video_url)?.video_url ? <iframe className="h-full w-full" src={leaderboard.items.find(i=>i.video_url)?.video_url || ""} title="Video kegiatan mahasiswa" allowFullScreen/> : null}</div><div className="p-5"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#08266f]">Video Kegiatan</p><h3 className="mt-1 text-lg font-black text-slate-900">{leaderboard.items.find(i=>i.video_url)?.title || "Aktivitas Mahasiswa"}</h3></div></div></div></section>}

        {education && <section className="mb-16"><div className="mb-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#08266f]">{education.eyebrow || "Informasi Pendidikan"}</p><h2 className="mt-2 text-3xl font-black text-slate-900">{education.title || "Biaya Pendidikan"}</h2></div><div className="mb-6 flex flex-wrap gap-2">{educationPrograms.map((program)=><button key={program} type="button" onClick={()=>setActiveProgram(program)} className={`rounded-full px-4 py-2.5 text-sm font-black ${selectedProgram===program?"bg-[#08266f] text-white":"bg-slate-100 text-slate-600"}`}>{program}</button>)}</div><div className="grid gap-4 md:grid-cols-2">{educationItems.filter(i=>(i.subtitle || "Program Pendidikan")===selectedProgram).map((item)=><div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-[11px] font-black uppercase tracking-wider text-[#08266f]">{item.subtitle}</p><h3 className="text-base font-black text-slate-900">{item.title}</h3><p className="mt-1 text-sm text-slate-500">{item.body}</p></div>)}</div></section>}

        {scholarships && <section className="mb-16 rounded-[2rem] bg-[#08266f] p-6 text-white sm:p-10"><div className="mb-8 flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-2xl bg-white text-[#08266f]"><Star className="size-5 fill-current"/></div><div><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">{scholarships.eyebrow || "Dukungan Pendidikan"}</p><h2 className="text-3xl font-black">{scholarships.title || "Beasiswa"}</h2></div></div><div className="grid gap-3">{scholarships.items.map((item)=><div key={item.id} className="rounded-2xl bg-white/10"><button type="button" onClick={()=>setActiveBeasiswa(activeBeasiswa===item.id?null:item.id)} className="flex w-full items-center justify-between rounded-2xl p-5 text-left"><span className="font-bold">{item.title}</span><ChevronRight className={`size-5 transition-transform ${activeBeasiswa===item.id?"rotate-90":""}`}/></button>{activeBeasiswa===item.id&&<div className="border-t border-white/10 px-5 pb-5 pt-4"><p className="text-sm leading-relaxed text-blue-100">{item.body}</p>{item.config?.requirements&&<div className="mt-5"><h3 className="text-sm font-black">Persyaratan</h3><p className="mt-2 whitespace-pre-line text-sm text-blue-100">{String(item.config.requirements)}</p></div>}{item.config?.benefits&&<div className="mt-5"><h3 className="text-sm font-black">Benefit</h3><p className="mt-2 whitespace-pre-line text-sm text-blue-100">{String(item.config.benefits)}</p></div>}<a href={item.link_url||"/daftar"} className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-black text-[#08266f]">{item.link_label||"Mendaftar Beasiswa"}</a></div>}</div>)}</div></section>}
      </div>
      <PublicFooter />
    </main>
  );
}

