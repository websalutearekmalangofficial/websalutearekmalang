import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, BookOpen, BriefcaseBusiness, ChevronDown, GraduationCap, Menu, X } from "lucide-react";
import { SiteLogo } from "@/components/site-logo";

export const Route = createFileRoute("/program-studi")({
  head: () => ({
    meta: [
      { title: "Program Studi - Sentra Layanan UT Arek Malang" },
      { name: "description", content: "Informasi program pendidikan, fakultas, dan program studi Universitas Terbuka melalui Sentra Layanan UT Arek Malang." },
    ],
  }),
  component: ProgramStudiPage,
});

type Faculty = { code: string; name: string; programs: string[] };
type Program = { name: string; level: string; description: string; faculties: Faculty[] };

const programs: Program[] = [
  { name: "Diploma", level: "D3 & D4", description: "Pilihan program vokasi untuk membangun kompetensi praktis yang relevan dengan kebutuhan dunia kerja.", faculties: [{ code: "DIPLOMA", name: "Program Diploma", programs: ["D4 Pengelolaan Arsip dan Rekaman Informasi", "D3 Perpajakan", "D4 Kearsipan", "D3 Teknologi Informasi", "D4 Akuntansi Bisnis Digital", "D4 Manajemen Logistik", "D3 Penyiaran"] }] },
  { name: "Sarjana", level: "S1", description: "Pilihan program sarjana dari berbagai bidang untuk mendukung pengembangan akademik dan karier Anda.", faculties: [
    { code: "FEB", name: "Fakultas Ekonomi dan Bisnis (FEB)", programs: ["Manajemen", "Ekonomi Pembangunan", "Ekonomi Syariah", "Akuntansi", "Akuntansi Keuangan Publik", "Pariwisata", "Kewirausahaan"] },
    { code: "FKIP", name: "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)", programs: ["Pendidikan Bahasa dan Sastra Indonesia", "Pendidikan Bahasa Inggris", "Pendidikan Biologi", "Pendidikan Matematika", "Pendidikan Guru Sekolah Dasar (PGSD)", "Pendidikan Agama Islam"] },
    { code: "FST", name: "Fakultas Sains dan Teknologi (FST)", programs: ["Statistika", "Matematika", "Biologi", "Teknologi Pangan", "Agribisnis", "Sistem Informasi", "Sains Data"] },
    { code: "FHISIP", name: "Fakultas Hukum, Ilmu Sosial, dan Ilmu Politik (FHISIP)", programs: ["Ilmu Administrasi Publik", "Administrasi Bisnis", "Hukum", "Ilmu Pemerintahan", "Ilmu Komunikasi", "Sosiologi", "Sastra Inggris"] },
  ] },
  { name: "Magister", level: "S2", description: "Program magister untuk memperdalam keahlian profesional dan pengembangan kompetensi akademik.", faculties: [{ code: "MAGISTER", name: "Program Magister", programs: ["Administrasi Publik (S2)", "Manajemen (S2)", "Ilmu Kelautan (S2)", "Pendidikan Matematika (S2)", "Pendidikan Dasar (S2)", "Hukum (S2)"] }] },
  { name: "Doktoral", level: "S3", description: "Program doktoral untuk pengembangan keilmuan, penelitian, dan kepemimpinan akademik.", faculties: [{ code: "DOKTOR", name: "Program Doktoral", programs: ["Doktor Administrasi Publik (S3)", "Doktor Ilmu Manajemen (S3)"] }] },
  { name: "Pendidikan Profesi Guru", level: "PPG", description: "Program pendidikan profesi untuk mendukung pengembangan kompetensi dan profesionalisme guru.", faculties: [{ code: "PROFESI", name: "Program Profesi", programs: ["Pendidikan Profesi Guru (PPG)"] }] },
];

const tips = [
  { title: "Pilih berdasarkan tujuan", description: "Pertimbangkan bidang yang ingin Anda tekuni dan arah karier yang ingin dibangun.", icon: BriefcaseBusiness },
  { title: "Perhatikan jenjang", description: "Sesuaikan jenjang dengan latar belakang pendidikan dan rencana studi Anda.", icon: GraduationCap },
  { title: "Konsultasikan pilihan", description: "Jika masih ragu, tim SALUT Arek Malang siap membantu memahami pilihan program.", icon: BookOpen },
];

function ProgramStudiPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("Sarjana");
  const selected = programs.find((p) => p.name === active) ?? programs[1];

  return (
    <main className="min-h-screen bg-[#f8fafc] font-body text-slate-900">
      <header className="sticky top-0 z-40 border-b border-ut-sky/25 bg-hero-nav text-hero-foreground shadow-header">
        <div className="mx-auto grid min-h-16 max-w-7xl grid-cols-[1fr_auto] items-center gap-2 px-3 py-2.5 sm:px-4 lg:min-h-20 lg:grid-cols-[auto_1fr_auto] lg:px-8 xl:px-12">
          <Link to="/" className="flex min-w-0 items-center"><SiteLogo className="max-w-[145px] sm:max-w-[175px] md:max-w-[200px] lg:max-w-[220px]" imageClassName="max-h-12 sm:max-h-14" /></Link>
          <nav className="hidden items-center justify-center gap-2 lg:flex xl:gap-4">
            <Link to="/" className="rounded-full px-3 py-2 text-sm font-bold text-hero-foreground/95 hover:text-ut-yellow">Beranda</Link>
            <Link to="/program-studi" className="inline-flex items-center gap-2 rounded-full bg-ut-yellow px-4 py-2.5 text-sm font-black text-ut-navy shadow-yellow"><GraduationCap className="size-4" />Program Studi</Link>
            <a href="/#informasi" className="rounded-full px-3 py-2 text-sm font-bold text-hero-foreground/95 hover:text-ut-yellow">Informasi</a>
            <a href="/#panduan" className="rounded-full px-3 py-2 text-sm font-bold text-hero-foreground/95 hover:text-ut-yellow">Panduan</a>
            <a href="/#kontak" className="rounded-full px-3 py-2 text-sm font-bold text-hero-foreground/95 hover:text-ut-yellow">Kontak</a>
          </nav>
          <div className="flex items-center justify-end gap-2">
            <Link to="/daftar" className="inline-flex items-center gap-1.5 rounded-full bg-ut-yellow px-3 py-2 text-xs font-black text-ut-navy shadow-yellow sm:px-4 sm:text-sm">Daftar <ArrowRight className="size-4" /></Link>
            <button type="button" onClick={() => setMenuOpen((v) => !v)} className="grid size-10 place-items-center rounded-full border border-hero-foreground/60 bg-hero-foreground/10 lg:hidden" aria-label="Menu">
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {menuOpen && <nav className="grid gap-2 border-t border-hero-foreground/20 px-4 pb-4 pt-3 lg:hidden">
          <Link to="/" onClick={() => setMenuOpen(false)} className="rounded-xl bg-hero-foreground/10 px-4 py-3 text-sm font-bold">Beranda</Link>
          <Link to="/program-studi" onClick={() => setMenuOpen(false)} className="rounded-xl bg-ut-yellow px-4 py-3 text-sm font-black text-ut-navy">Program Studi</Link>
          <a href="/#informasi" className="rounded-xl bg-hero-foreground/10 px-4 py-3 text-sm font-bold">Informasi</a>
          <a href="/#panduan" className="rounded-xl bg-hero-foreground/10 px-4 py-3 text-sm font-bold">Panduan</a>
          <a href="/#kontak" className="rounded-xl bg-hero-foreground/10 px-4 py-3 text-sm font-bold">Kontak</a>
        </nav>}
      </header>

      <section className="relative overflow-hidden bg-hero-deep px-4 py-16 text-white sm:px-6 md:px-8 md:py-24 lg:px-12">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-blue-700/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ut-yellow sm:text-sm">Informasi Akademik</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">Program Studi</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">Kenali pilihan program pendidikan, fakultas, dan program studi Universitas Terbuka sebelum menentukan pilihan Anda.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#pilihan-program" className="inline-flex items-center gap-2 rounded-full bg-ut-yellow px-6 py-3 text-sm font-black text-ut-navy shadow-yellow">Lihat Program <ArrowRight className="size-4" /></a>
            <Link to="/daftar" className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white">Mulai Pendaftaran</Link>
          </div>
        </div>
      </section>

      <section id="pilihan-program" className="scroll-mt-24 px-4 py-14 sm:px-6 md:px-8 md:py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-yellow-600">Pilihan Pendidikan</p>
            <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">Temukan Program yang Sesuai</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">Pilih jenjang pendidikan untuk melihat fakultas dan program studi yang tersedia pada pilihan pendaftaran saat ini.</p>
          </div>
          <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {programs.map((program) => <button key={program.name} type="button" onClick={() => setActive(program.name)} className={active === program.name ? "rounded-2xl border-2 border-ut-yellow bg-ut-yellow px-3 py-4 text-center shadow-lg" : "rounded-2xl border border-slate-200 bg-white px-3 py-4 text-center shadow-sm hover:border-yellow-300"} aria-pressed={active === program.name}><span className="block text-sm font-black">{program.name}</span><span className="mt-1 block text-xs font-semibold text-slate-500">{program.level}</span></button>)}
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] sm:p-7 md:p-9">
            <div className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-yellow-600">{selected.level}</p><h3 className="mt-2 font-display text-2xl font-black sm:text-3xl">Program {selected.name}</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{selected.description}</p></div>
              <Link to="/daftar" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-black text-white">Daftar <ArrowRight className="size-4" /></Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2">{selected.faculties.map((faculty) => <FacultyCard key={faculty.code} faculty={faculty} />)}</div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 md:px-8 md:py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-yellow-600">Panduan Memilih</p>
          <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">Belum Yakin Memilih Program?</h2>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {tips.map((tip) => { const Icon = tip.icon; return <article key={tip.title} className="rounded-3xl border border-slate-200 bg-[#f8fafc] p-6 shadow-sm"><div className="mb-5 grid size-12 place-items-center rounded-2xl bg-ut-yellow text-ut-navy"><Icon className="size-6" /></div><h3 className="text-lg font-black">{tip.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{tip.description}</p></article>; })}
          </div>
        </div>
      </section>

      <section className="bg-hero-nav px-4 py-14 text-white sm:px-6 md:px-8 md:py-20 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-7 text-center md:flex-row md:text-left">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-ut-yellow">Siap Melanjutkan Studi?</p><h2 className="mt-2 font-display text-2xl font-black sm:text-3xl">Tentukan pilihan Anda dan mulai proses pendaftaran.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/80">Jika masih membutuhkan informasi, tim SALUT Arek Malang siap membantu Anda memahami pilihan program dan tahapan pendaftaran.</p></div>
          <Link to="/daftar" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ut-yellow px-7 py-3.5 text-sm font-black text-ut-navy shadow-yellow">Daftar Sekarang <ArrowRight className="size-4" /></Link>
        </div>
      </section>

      <footer className="bg-hero-nav px-4 pb-8 pt-6 text-center text-xs text-white/60">
        <Link to="/" className="mx-auto mb-4 inline-flex"><SiteLogo imageClassName="max-h-14 max-w-[190px]" /></Link>
        <p>© {new Date().getFullYear()} Sentra Layanan Universitas Terbuka Arek Malang.</p>
      </footer>
    </main>
  );
}

function FacultyCard({ faculty }: { faculty: Faculty }) {
  const [open, setOpen] = useState(true);
  return <article className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
    <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6" aria-expanded={open}>
      <div className="min-w-0"><p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-700">{faculty.code}</p><h4 className="text-base font-black leading-6 sm:text-lg">{faculty.name}</h4></div>
      <ChevronDown className={`size-5 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div className="border-t border-slate-200 bg-white p-4 sm:p-5"><ul className="grid gap-2 sm:grid-cols-2">{faculty.programs.map((program) => <li key={program}>{program === "Manajemen" ? (
  <Link to="/program-studi/manajemen" className="group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 hover:border-yellow-300 hover:bg-yellow-50">
    <span>{program}</span><ArrowRight className="size-4 shrink-0 text-yellow-600" />
  </Link>
) : (
  <Link to="/daftar" className="group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 hover:border-yellow-300 hover:bg-yellow-50">
    <span>{program}</span><ArrowRight className="size-4 shrink-0 text-yellow-600" />
  </Link>
)}</li>)}</ul></div>}
  </article>;
}
