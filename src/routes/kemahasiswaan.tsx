import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Star, Trophy } from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/public-site-chrome";

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
  { rank: 2, name: "Rina Aryanti", points: 1042 },
  { rank: 3, name: "Dwi Maryanto", points: 1243 },
  { rank: 4, name: "Achmad Dani", points: 1023 },
  { rank: 5, name: "Yumna Azmi", points: 832 },
];

const jurusanData = [
  { name: "Jurusan Manajemen", price: "Rp. 1.000.000 / Semester" },
  { name: "Jurusan Manajemen", price: "Rp. 1.000.000 / Semester" },
  { name: "Jurusan Akuntansi", price: "Rp. 1.000.000 / Semester" },
  { name: "Jurusan Akuntansi", price: "Rp. 1.000.000 / Semester" },
];

const beasiswaData = [
  "Beasiswa PPA",
  "Beasiswa BBM",
  "Beasiswa Kementerian",
  "Beasiswa Prestasi",
];

function KemahasiswaanPage() {
  const [activeTab, setActiveTab] = useState("Sarjana");

  return (
    <main className="min-h-screen bg-white font-body text-[#101010]">
      <PublicHeader />

      <section className="relative w-full">
        <div className="h-[250px] w-full overflow-hidden bg-gray-200 sm:h-[400px]">
          <img
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=2000&q=80"
            alt="Kemahasiswaan SALUT Arek Malang"
            className="h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-10 max-w-7xl px-5 pb-10 sm:-mt-20 sm:px-8 lg:px-10">
        <h1 className="mb-10 inline-block rounded-xl bg-white/80 px-4 py-2 text-2xl font-bold text-[#08266f] backdrop-blur-sm sm:text-4xl">
          Kemahasiswaan
        </h1>

        <section className="mb-16 flex flex-col items-center gap-8 rounded-[2rem] bg-[#08266f] p-6 text-white shadow-xl sm:p-10 lg:flex-row">
          <div className="flex-1">
            <h2 className="mb-4 text-3xl font-bold leading-tight">
              Bergabung dengan
              <br />
              SALUT Arek Malang
            </h2>
            <p className="mb-8 max-w-md text-sm leading-relaxed text-blue-100">
              Bangun pengalaman perkuliahan yang aktif, terhubung, dan
              berkembang bersama komunitas mahasiswa SALUT Arek Malang.
            </p>
            <a
              href="/daftar"
              className="inline-flex rounded-xl bg-white px-6 py-3 text-sm font-black text-[#08266f] transition hover:bg-blue-50"
            >
              Mulai Pendaftaran
            </a>
          </div>

          <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-xl">
            {[
              ["Kegiatan", "Aktif"],
              ["Komunitas", "Mahasiswa"],
              ["Prestasi", "Terbaik"],
              ["Beasiswa", "Tersedia"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur"
              >
                <p className="text-xs text-blue-100">{label}</p>
                <p className="mt-1 text-sm font-black">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#08266f]">
                Aktivitas Mahasiswa
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">
                Kegiatan Member
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                Ruang untuk mengikuti kegiatan, membangun relasi, dan
                mengembangkan pengalaman di luar perkuliahan.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Kegiatan Akademik",
                text: "Diskusi dan kegiatan pendukung untuk memperkuat pengalaman belajar mahasiswa.",
              },
              {
                title: "Komunitas Mahasiswa",
                text: "Berjejaring dan berkolaborasi dengan mahasiswa SALUT Arek Malang.",
              },
              {
                title: "Pengembangan Diri",
                text: "Aktivitas yang mendorong keterampilan, kepemimpinan, dan kreativitas.",
              },
            ].map((item, index) => (
              <article
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-[#08266f] text-xl font-black text-white">
                  0{index + 1}
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-16 rounded-[2rem] bg-slate-50 p-6 sm:p-10">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[#08266f]">
                <Trophy className="size-5" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">
                  Apresiasi
                </span>
              </div>
              <h2 className="text-3xl font-black text-slate-900">
                Leaderboard
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Papan apresiasi mahasiswa berdasarkan poin kegiatan.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {leaderboardData.map((item) => (
              <div
                key={item.rank}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center gap-4">
                  <span className="flex size-10 items-center justify-center rounded-full bg-[#08266f] text-sm font-black text-white">
                    {item.rank}
                  </span>
                  <span className="font-bold text-slate-800">{item.name}</span>
                </div>
                <span className="font-black text-[#08266f]">
                  {item.points.toLocaleString("id-ID")} poin
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#08266f]">
              Informasi Pendidikan
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Biaya Pendidikan
            </h2>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {["Sarjana", "Diploma", "Program Lainnya"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-5 py-2.5 text-sm font-black transition ${
                  activeTab === tab
                    ? "bg-[#08266f] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {jurusanData.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-5"
              >
                <div>
                  <h3 className="font-black text-slate-900">{item.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{activeTab}</p>
                </div>
                <span className="shrink-0 text-sm font-black text-[#08266f]">
                  {item.price}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <ChevronDown className="size-4" />
            Informasi biaya dapat diperbarui sesuai ketentuan program.
          </div>
        </section>

        <section className="mb-16 rounded-[2rem] bg-[#08266f] p-6 text-white sm:p-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-[#08266f]">
              <Star className="size-5 fill-current" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
                Dukungan Pendidikan
              </p>
              <h2 className="text-3xl font-black">Beasiswa</h2>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {beasiswaData.map((item) => (
              <button
                key={item}
                type="button"
                className="flex items-center justify-between rounded-2xl bg-white/10 p-5 text-left transition hover:bg-white/15"
              >
                <span className="font-bold">{item}</span>
                <ChevronRight className="size-5" />
              </button>
            ))}
          </div>
        </section>
      </div>

      <PublicFooter />
    </main>
  );
}
