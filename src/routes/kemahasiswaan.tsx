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
  const [activeTab, setActiveTab] = useState("Sarjana (S1)");
  const [activeBeasiswa, setActiveBeasiswa] = useState<string | null>(null);

  const scholarshipsQuery = useQuery({
    queryKey: ["kemahasiswaan-scholarships"],
    queryFn: async () => {
      const { data: page, error: pageError } = await supabase
        .from("pages")
        .select("id")
        .eq("slug", "kemahasiswaan")
        .maybeSingle();
      if (pageError) throw pageError;
      if (!page) return [];
      const { data: section, error: sectionError } = await supabase
        .from("sections")
        .select("id")
        .eq("page_id", page.id)
        .eq("kind", "scholarships")
        .eq("is_published", true)
        .maybeSingle();
      if (sectionError) throw sectionError;
      if (!section) return [];
      const { data: items, error: itemsError } = await supabase
        .from("section_items")
        .select("id, sort_order, title, body, link_url, link_label, config, is_published")
        .eq("section_id", section.id)
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (itemsError) throw itemsError;
      return (items ?? []).map((item) => ({
        ...item,
        requirements: String(item.config?.requirements ?? "").split("\\n").map((value) => value.trim()).filter(Boolean),
        benefits: String(item.config?.benefits ?? "").split("\\n").map((value) => value.trim()).filter(Boolean),
      }));
    },
  });
  const beasiswaData = scholarshipsQuery.data ?? [];
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
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2 text-[#08266f]">
              <Trophy className="size-5" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">
                Apresiasi
              </span>
            </div>
            <h2 className="text-3xl font-black text-slate-900">Leaderboard</h2>
            <p className="mt-2 text-sm text-slate-500">
              Papan apresiasi mahasiswa berdasarkan poin kegiatan.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[30%_70%] lg:items-stretch">
            <div className="order-2 rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 lg:order-1">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-black text-slate-900">Peringkat</h3>
                <Trophy className="size-5 text-[#08266f]" />
              </div>
              <div className="grid gap-3">
                {leaderboardData.map((item) => (
                  <div key={item.rank} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#08266f] text-xs font-black text-white">
                        {item.rank}
                      </span>
                      <span className="truncate text-sm font-bold text-slate-800">{item.name}</span>
                    </div>
                    <span className="ml-2 shrink-0 text-xs font-black text-[#08266f]">
                      {item.points.toLocaleString("id-ID")} poin
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 overflow-hidden rounded-3xl border border-slate-200 bg-white lg:order-2">
              <div className="aspect-video w-full bg-slate-900">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Video kegiatan mahasiswa SALUT Arek Malang"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#08266f]">Video Kegiatan</p>
                <h3 className="mt-1 text-lg font-black text-slate-900">Aktivitas Mahasiswa SALUT Arek Malang</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Area ini siap digunakan untuk embed YouTube atau video yang diunggah melalui sistem website.
                </p>
              </div>
            </div>
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
            {educationPrograms.map((program) => (
              <button
                key={program}
                type="button"
                onClick={() => setActiveTab(program)}
                className={`rounded-full px-4 py-2.5 text-sm font-black transition ${
                  activeTab === program
                    ? "bg-[#08266f] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {program}
              </button>
            ))}
          </div>

          {(() => {
            const selected = educationData.find((item) => item.program === activeTab) ?? educationData[0];
            const groups = "faculties" in selected ? selected.faculties.flatMap((faculty) =>
              faculty.majors.map((major) => ({ faculty: faculty.name, facultyLabel: faculty.label, major }))
            ) : selected.majors.map((major) => ({ faculty: null, facultyLabel: null, major }));

            return (
              <div className="grid gap-4 md:grid-cols-2">
                {groups.map((item, index) => (
                  <div
                    key={`${selected.program}-${item.major}`}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        {item.faculty && (
                          <p className="mb-1 text-[11px] font-black uppercase tracking-wider text-[#08266f]">
                            {item.faculty} · {item.facultyLabel}
                          </p>
                        )}
                        <h3 className="text-base font-black text-slate-900">{item.major}</h3>
                        <p className="mt-1 text-xs text-slate-500">{selected.program}</p>
                      </div>
                      <span className="shrink-0 rounded-xl bg-yellow-50 px-3 py-2 text-right text-xs font-black text-slate-800">
                        Rp. {(900000 + (index % 5) * 150000).toLocaleString("id-ID")}<br />
                        <span className="font-bold text-slate-500">/ Semester</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <ChevronDown className="size-4" />
            Nominal di atas adalah data dummy untuk kebutuhan tampilan dan dapat diganti sesuai ketentuan biaya resmi masing-masing program.
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

          <div className="grid gap-3">
            {beasiswaData.map((item) => {
              const isOpen = activeBeasiswa === item.name;
              return (
                <div key={item.name} className="rounded-2xl bg-white/10">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setActiveBeasiswa(isOpen ? null : item.name)}
                    className="flex w-full items-center justify-between rounded-2xl p-5 text-left transition hover:bg-white/15"
                  >
                    <span className="font-bold">{item.name}</span>
                    <ChevronRight className={`size-5 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="border-t border-white/10 px-5 pb-5 pt-4">
                      <p className="text-sm leading-relaxed text-blue-100">{item.body}</p>

                      <div className="mt-5 grid gap-5 md:grid-cols-2">
                        <div>
                          <h3 className="text-sm font-black">Persyaratan</h3>
                          <ul className="mt-2 space-y-2 text-sm text-blue-100">
                            {item.requirements.map((requirement) => (
                              <li key={requirement} className="flex gap-2">
                                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-yellow-300" />
                                <span>{requirement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-sm font-black">Benefit</h3>
                          <ul className="mt-2 space-y-2 text-sm text-blue-100">
                            {item.benefits.map((benefit) => (
                              <li key={benefit} className="flex gap-2">
                                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-yellow-300" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <a
                        href={item.link_url || "/daftar"}
                        className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-black text-[#08266f] transition hover:bg-blue-50"
                      >
                        {item.link_label || "Mendaftar Beasiswa"}
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <PublicFooter />
    </main>
  );
}
