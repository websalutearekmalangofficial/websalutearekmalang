import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, BriefcaseBusiness, CheckCircle2, GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";
import { SiteLogo } from "@/components/site-logo";

export const Route = createFileRoute("/program-studi/manajemen")({
  head: () => ({
    meta: [
      { title: "S1 Manajemen - Fakultas Ekonomi dan Bisnis | SALUT Arek Malang" },
      { name: "description", content: "Profil Program Studi S1 Manajemen Fakultas Ekonomi dan Bisnis Universitas Terbuka melalui SALUT Arek Malang." },
    ],
  }),
  component: ManajemenPage,
});

function ManajemenPage() {
  const [menuOpen, setMenuOpen] = useState(false);

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
            <button type="button" onClick={() => setMenuOpen((v) => !v)} className="grid size-10 place-items-center rounded-full border border-hero-foreground/60 bg-hero-foreground/10 lg:hidden" aria-label="Menu">{menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
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
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-blue-700/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <Link to="/program-studi" className="inline-flex items-center gap-2 text-sm font-bold text-blue-100 hover:text-ut-yellow"><ArrowLeft className="size-4" />Kembali ke Program Studi</Link>
          <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.22em] text-ut-yellow">Program Sarjana · Fakultas Ekonomi dan Bisnis</p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">S1 Manajemen</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-blue-100 sm:text-lg">Pelajari profil program studi, fokus pembelajaran, dan gambaran kompetensi yang dapat Anda kembangkan melalui Program Studi Manajemen.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/daftar" className="inline-flex items-center gap-2 rounded-full bg-ut-yellow px-6 py-3 text-sm font-black text-ut-navy shadow-yellow">Daftar Program Studi <ArrowRight className="size-4" /></Link>
            <a href="#profil" className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white">Lihat Profil</a>
          </div>
        </div>
      </section>

      <section id="profil" className="scroll-mt-24 px-4 py-14 sm:px-6 md:px-8 md:py-20 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[1.3fr_.7fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] sm:p-8 md:p-10">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-yellow-600">Profil Program Studi</p>
            <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">Manajemen</h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Program Studi Manajemen mempelajari konsep dan praktik pengelolaan organisasi, sumber daya, proses bisnis, serta pengambilan keputusan. Pembelajaran diarahkan agar mahasiswa memiliki dasar pengetahuan manajemen yang dapat diterapkan dalam lingkungan organisasi dan dunia kerja.
            </p>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Halaman ini menjadi gambaran awal bagi calon mahasiswa. Informasi kurikulum, struktur mata kuliah, persyaratan akademik, dan ketentuan penerimaan dapat mengikuti informasi resmi Universitas Terbuka dan periode pendaftaran yang sedang berlaku.
            </p>
          </article>

          <aside className="rounded-[2rem] bg-ut-navy p-6 text-white shadow-xl sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-ut-yellow">Identitas Program</p>
            <dl className="mt-6 space-y-5">
              <div><dt className="text-xs text-blue-200">Jenjang</dt><dd className="mt-1 text-lg font-black">Sarjana (S1)</dd></div>
              <div><dt className="text-xs text-blue-200">Fakultas</dt><dd className="mt-1 text-lg font-black">Ekonomi dan Bisnis</dd></div>
              <div><dt className="text-xs text-blue-200">Program Studi</dt><dd className="mt-1 text-lg font-black">Manajemen</dd></div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 md:px-8 md:py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-yellow-600">Yang Dipelajari</p>
            <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">Area Kompetensi Manajemen</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">Beberapa area kompetensi yang relevan untuk dikenali calon mahasiswa antara lain:</p>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["Manajemen organisasi", "Perencanaan dan pengambilan keputusan", "Pengelolaan sumber daya", "Proses dan strategi bisnis"].map((item) => (
              <article key={item} className="rounded-3xl border border-slate-200 bg-[#f8fafc] p-6">
                <CheckCircle2 className="size-6 text-yellow-600" />
                <h3 className="mt-4 font-black">{item}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 md:px-8 md:py-20 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="grid size-12 place-items-center rounded-2xl bg-ut-yellow text-ut-navy"><BriefcaseBusiness className="size-6" /></div>
            <h2 className="mt-5 font-display text-2xl font-black">Gambaran Prospek</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Kompetensi manajemen dapat mendukung berbagai peran di lingkungan organisasi, administrasi, operasional, bisnis, maupun pengembangan usaha. Prospek aktual bergantung pada kompetensi, pengalaman, dan kebutuhan organisasi.</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="grid size-12 place-items-center rounded-2xl bg-ut-yellow text-ut-navy"><BookOpen className="size-6" /></div>
            <h2 className="mt-5 font-display text-2xl font-black">Pertimbangan Sebelum Memilih</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Pastikan bidang manajemen sesuai dengan minat Anda terhadap organisasi, pengelolaan sumber daya, proses bisnis, dan pengambilan keputusan. Untuk detail akademik, gunakan informasi resmi yang berlaku saat pendaftaran.</p>
          </article>
        </div>
      </section>

      <section className="bg-hero-nav px-4 py-14 text-white sm:px-6 md:px-8 md:py-20 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-7 text-center md:flex-row md:text-left">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-ut-yellow">S1 Manajemen · FEB</p>
            <h2 className="mt-2 font-display text-2xl font-black sm:text-3xl">Tertarik dengan Program Studi Manajemen?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/80">Lanjutkan ke halaman pendaftaran jika Anda sudah siap memilih program studi.</p>
          </div>
          <Link to="/daftar" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ut-yellow px-7 py-3.5 text-sm font-black text-ut-navy shadow-yellow">Mulai Pendaftaran <ArrowRight className="size-4" /></Link>
        </div>
      </section>

      <footer className="bg-hero-nav px-4 pb-8 pt-6 text-center text-xs text-white/60">
        <Link to="/" className="mx-auto mb-4 inline-flex"><SiteLogo imageClassName="max-h-14 max-w-[190px]" /></Link>
        <p>© {new Date().getFullYear()} Sentra Layanan Universitas Terbuka Arek Malang.</p>
      </footer>
    </main>
  );
}
