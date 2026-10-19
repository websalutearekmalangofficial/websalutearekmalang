import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Play, Sparkles, Trophy, Users, Video } from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/public-site-chrome";
import { supabase } from "@/integrations/supabase/client";

type CmsItem = {
  id: string;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  media_url?: string | null;
  video_url?: string | null;
  link_url?: string | null;
  link_label?: string | null;
  config?: Record<string, unknown> | null;
  sort_order: number;
  is_published: boolean;
  created_at?: string | null;
};
type CmsSection = {
  id: string;
  kind: string;
  title?: string | null;
  eyebrow?: string | null;
  subtitle?: string | null;
  body?: string | null;
  media_url?: string | null;
  video_url?: string | null;
  link_url?: string | null;
  link_label?: string | null;
  config?: Record<string, unknown> | null;
  items: CmsItem[];
};

const galleryFallback = [
  { title: "Belajar Bersama", category: "Aktivitas Mahasiswa", image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=85" },
  { title: "Kolaborasi Kreatif", category: "Komunitas", image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85" },
  { title: "Berbagi untuk Sesama", category: "Pengabdian", image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=900&q=85" },
  { title: "Diskusi dan Inspirasi", category: "Pengembangan Diri", image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=85" },
  { title: "Ruang Ide Baru", category: "Kreativitas", image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=85" },
];
// Real Instagram posts will be rendered here once an authorized Meta API connection is configured.


function imageOf(item?: Partial<CmsItem | CmsSection> | null, fallback?: string) {
  return item?.media_url || fallback || "";
}
function safeExternal(url?: string | null) {
  return !!url && /^https?:\/\//i.test(url);
}
function videoEmbedUrl(url?: string | null) {
  if (!url || !safeExternal(url)) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? "https://www.youtube-nocookie.com/embed/" + id : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const id = parsed.searchParams.get("v") || parsed.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/)?.[1];
      return id ? "https://www.youtube-nocookie.com/embed/" + id : null;
    }
    if (host === "instagram.com" || host === "instagr.am") {
      const match = parsed.pathname.match(/\/(?:reel|reels|p|tv)\/([^/]+)/);
      return match ? "https://www.instagram.com/p/" + match[1] + "/embed" : null;
    }
  } catch {
    return null;
  }
  return null;
}
function isDirectVideoUrl(url?: string | null) {
  if (!url || !safeExternal(url)) return false;
  try {
    return /\.(?:mp4|webm|ogg|mov|m4v)$/i.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

export function KemahasiswaanEditorial() {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [playingVideo, setPlayingVideo] = useState(true);
  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["kemahasiswaan-editorial-sections"],
    queryFn: async () => {
      const { data: page, error: pageError } = await supabase.from("pages").select("id").eq("slug", "kemahasiswaan").eq("is_published", true).maybeSingle();
      if (pageError) throw pageError;
      if (!page) return [] as CmsSection[];
      const { data, error } = await supabase.from("sections").select("*, items:section_items(*)").eq("page_id", page.id).eq("is_published", true).order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((section: any) => ({
        ...section,
        items: [...(section.items ?? [])].filter((item: CmsItem) => item.is_published).sort((a: CmsItem, b: CmsItem) => a.sort_order - b.sort_order),
      })) as CmsSection[];
    },
  });
  const section = (kind: string) => sections.find((item) => item.kind === kind);
  const hero = section("hero");
  const intro = section("benefits");
  const activitySection = section("activities");
  const videoSection = section("leaderboard");
  const galleryItems = useMemo(() => {
    return [...(activitySection?.items ?? [])]
      .filter((item) => item.is_published && Boolean(item.media_url))
      .sort((a, b) => {
        const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bCreated - aCreated || a.sort_order - b.sort_order;
      })
      .slice(0, 4);
  }, [activitySection]);
  const videoItem = videoSection?.items.find((item) => item.video_url) || (videoSection?.video_url ? { title: videoSection.title || "Video profil SALUT Arek Malang", video_url: videoSection.video_url } as CmsItem : undefined);
  // Hero image is managed in CMS (sections.media_url); do not override it with a hard-coded stock image.
  const heroImage = imageOf(hero);
  // The spotlight and gallery use the same latest four published CMS activity photos.
  const spotlightItems = galleryItems;
  const visibleGallery = galleryItems.length
    ? Array.from({ length: Math.min(4, galleryItems.length) }, (_, i) => galleryItems[(galleryIndex + i) % galleryItems.length])
    : [];

  useEffect(() => {
    if (galleryItems.length < 2) return;
    const timer = window.setInterval(() => setGalleryIndex((current) => (current + 1) % galleryItems.length), 5000);
    return () => window.clearInterval(timer);
  }, [galleryItems.length]);

  if (isLoading) return <main className="min-h-screen bg-[#fffef6]"><PublicHeader /><div className="mx-auto max-w-7xl px-6 py-24 text-center text-slate-600">Menyiapkan cerita dan aktivitas mahasiswa…</div><PublicFooter /></main>;

  return (
    <main className="kem-yellow-page min-h-screen overflow-hidden bg-[#fffef8] text-[#17203b]">
      <style>{`
        @keyframes kem-fade-up { from { opacity: 0; transform: translateY(22px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes kem-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        .kem-reveal { animation: kem-fade-up .7s cubic-bezier(.2,.75,.25,1) both; }
        .kem-float { animation: kem-float 5s ease-in-out infinite; }
        .kem-card-image { transition: transform .65s cubic-bezier(.2,.75,.25,1), filter .4s ease; }
        .kem-gallery-card:hover .kem-card-image { transform: scale(1.055); filter: saturate(1.08); }
        .kem-yellow-page a:focus-visible, .kem-yellow-page button:focus-visible { outline: 3px solid #18254c; outline-offset: 4px; }
        @media (prefers-reduced-motion: reduce) { .kem-yellow-page *, .kem-yellow-page *::before, .kem-yellow-page *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: .01ms !important; } }
      `}</style>
      <PublicHeader />

      <section className="relative isolate min-h-[590px] overflow-hidden bg-[#f8e51c] sm:min-h-[650px] lg:min-h-[690px]">
        {heroImage ? <img src={heroImage} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" /> : null}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#f8e51c] via-[#f8e51c]/95 to-[#f8e51c]/35" />
        <div className="absolute -right-24 -top-28 -z-10 size-[28rem] rounded-full border-[70px] border-white/20 sm:size-[42rem]" />
        <div className="mx-auto grid min-h-[590px] max-w-7xl items-center gap-8 px-5 py-14 sm:min-h-[650px] sm:px-8 lg:min-h-[690px] lg:grid-cols-[1fr_.8fr] lg:px-12">
          <div className="kem-reveal relative z-10 max-w-3xl">
            
            <h1 className="max-w-3xl text-4xl font-black leading-[.99] tracking-[-.045em] text-[#17203b] sm:text-6xl lg:text-7xl">{hero?.title || ""} <span className="mt-2 block text-[#17203b] [text-shadow:2px_2px_0_#fff,3px_3px_0_#17203b]">{hero?.subtitle || ""}</span></h1>
            <p className="mt-6 max-w-lg text-base font-semibold leading-relaxed text-[#30364a] sm:text-lg">{hero?.body || ""}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#galeri" className="inline-flex items-center gap-2 rounded-full bg-[#17203b] px-5 py-3 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#26365f]">Jelajahi Galeri <ArrowDownRight className="size-4" /></a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-bold text-[#30364a] sm:text-sm"><span className="flex items-center gap-2"><Users className="size-4" /> Belajar bersama</span><span className="flex items-center gap-2"><Trophy className="size-4" /> Tumbuh dan berprestasi</span><span className="flex items-center gap-2"><Sparkles className="size-4" /> Berbagi inspirasi</span></div>
          </div>
          <div className="relative hidden min-h-[420px] lg:block">
            <div className="absolute right-0 top-1/2 w-[88%] -translate-y-1/2 rotate-2 overflow-hidden rounded-[2.5rem] border-[10px] border-white/70 shadow-2xl">
              {heroImage ? <img src={heroImage} alt="Mahasiswa dan komunitas SALUT Arek Malang" className="h-[430px] w-full object-cover object-center" /> : <div className="grid h-[430px] place-items-center bg-[#fff7a8] p-6 text-center text-sm font-bold text-[#17203b]">Tambahkan gambar melalui Admin → Halaman → Kemahasiswaan → Hero Banner Kemahasiswaan.</div>}
            </div>
            <div className="kem-float absolute bottom-7 left-0 max-w-[220px] rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl backdrop-blur"><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Ruang bertumbuh</p><p className="mt-1 text-lg font-black">Ide, aksi, cerita.</p><p className="mt-1 text-sm text-slate-600">Semua punya tempat untuk berkembang.</p></div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-5 rounded-t-[50%] bg-[#fffef8]" />
      </section>

      <section className="mx-auto grid max-w-7xl gap-7 px-5 py-12 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:px-12 lg:py-16">
        <div className="kem-reveal flex flex-col justify-center">
          <p className="text-xs font-black uppercase tracking-[.22em] text-[#8b7c00]">{intro?.eyebrow || ""}</p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{intro?.title || ""}</h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-600 sm:text-base">{intro?.body || ""}</p>
          {intro?.link_url && <a href={intro.link_url} className="mt-5 inline-flex w-fit items-center gap-2 font-extrabold text-[#17203b] underline decoration-[#e4cf00] decoration-4 underline-offset-4">{intro.link_label || "Kenali layanan kami"} <ArrowRight className="size-4" /></a>}
        </div>
        <div className="rounded-[2rem] border border-[#eee7a0] bg-white p-4 shadow-[0_18px_50px_-35px_rgba(35,35,10,.45)] sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-black uppercase tracking-[.2em] text-[#8b7c00]">Aktivitas SALUT Arek Malang</p><h3 className="mt-1 text-xl font-black sm:text-2xl">Terbaru di Kemahasiswaan</h3></div><span className="rounded-full bg-[#fff7a8] px-3 py-1.5 text-xs font-extrabold">Maks. 4 foto</span></div>
          {intro?.media_url ? <div className="mb-4 overflow-hidden rounded-2xl bg-[#f8e51c]"><img src={intro.media_url} alt={intro.title || "Sorotan Aktivitas SALUT Arek Malang"} loading="lazy" className="max-h-[420px] w-full object-cover object-center" /></div> : null}<div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">{spotlightItems.map((item: any) => <a href="#galeri" key={item.id || item.title} className="group min-w-0"><div className="overflow-hidden rounded-2xl bg-[#f8e51c]"><img src={item.media_url} alt={item.title || "Aktivitas SALUT Arek Malang"} loading="lazy" className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" /></div><p className="mt-2 line-clamp-2 text-xs font-bold leading-snug sm:text-sm">{item.title}</p>{item.subtitle ? <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">{item.subtitle}</p> : null}</a>)}</div>{spotlightItems.length === 0 ? <p className="mt-4 text-sm text-slate-500">Belum ada foto aktivitas yang dipublikasikan. Tambahkan foto melalui Admin → Halaman → Kemahasiswaan.</p> : null}
        </div>
      </section>

      <section className="bg-[#fff7a8] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#776900]">{videoSection?.eyebrow || ""}</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">{videoSection?.title || ""}</h2></div><span className="hidden rounded-full border border-[#17203b]/20 bg-white/60 px-4 py-2 text-xs font-bold sm:inline-flex"><Video className="mr-2 size-4" /> Video pilihan</span></div>
          <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <div className="relative overflow-hidden rounded-[1.75rem] bg-[#17203b] shadow-xl">
              {playingVideo && videoItem?.video_url ? (
                isDirectVideoUrl(videoItem.video_url) || String(videoSection?.config?.video_source_type ?? "") === "upload" ? (
                  <video src={videoItem.video_url} poster={imageOf(videoSection)} controls playsInline autoPlay className="aspect-video w-full bg-black" />
                ) : videoEmbedUrl(videoItem.video_url) ? (
                  <iframe src={videoEmbedUrl(videoItem.video_url)!} title={videoItem.title || "Video profil SALUT Arek Malang"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="aspect-video w-full" />
                ) : (
                  <div className="grid aspect-video place-items-center bg-[#17203b] p-6 text-center text-white">
                    <div><Play className="mx-auto size-10 text-[#f8e51c]" /><p className="mt-3 font-bold">Video ini dibuka di platform asalnya.</p><a href={videoItem.video_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full bg-[#f8e51c] px-5 py-3 text-sm font-black text-[#17203b]">Tonton video <ArrowUpRight className="ml-2 size-4" /></a></div>
                  </div>
                )
              ) : <button type="button" onClick={() => videoItem?.video_url ? setPlayingVideo(true) : document.getElementById("galeri")?.scrollIntoView({ behavior: "smooth" })} className="group relative block w-full text-left"><img src={imageOf(videoSection, "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1400&q=85")} alt={videoItem?.title || "Video profil SALUT Arek Malang"} className="aspect-video w-full object-cover opacity-85 transition duration-500 group-hover:scale-[1.02]" /><span className="absolute inset-0 grid place-items-center"><span className="grid size-16 place-items-center rounded-full bg-[#f8e51c] text-[#17203b] shadow-xl transition group-hover:scale-110"><Play className="ml-1 size-7 fill-current" /></span></span><span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent p-5 pt-14 text-lg font-black text-white">{videoItem?.title || videoSection?.title || "Cerita dan perjalanan komunitas"}</span></button>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {visibleGallery.slice(1, 3).map((item: any) => <a key={item.id || item.title} href="#galeri" className="group relative overflow-hidden rounded-[1.5rem] bg-[#17203b]"><img src={item.image || imageOf(item)} alt={item.title} loading="lazy" className="h-full min-h-[160px] w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-10 text-xs font-extrabold text-white sm:p-4 sm:pt-12">{item.title}</span></a>)}
            </div>
          </div>
        </div>
      </section>

      <section id="galeri" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-black uppercase tracking-[.22em] text-[#8b7c00]">{activitySection?.eyebrow || ""}</p><h2 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{activitySection?.title || ""}<span className="text-[#d6c400]">.</span></h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">{activitySection?.body || activitySection?.subtitle || ""}</p></div>{galleryItems.length > 1 ? <div className="flex gap-2"><button type="button" aria-label="Foto sebelumnya" onClick={() => setGalleryIndex((galleryIndex - 1 + galleryItems.length) % galleryItems.length)} className="grid size-11 place-items-center rounded-full border border-slate-300 bg-white transition hover:border-[#17203b] hover:bg-[#f8e51c]"><ArrowLeft className="size-4" /></button><button type="button" aria-label="Foto berikutnya" onClick={() => setGalleryIndex((galleryIndex + 1) % galleryItems.length)} className="grid size-11 place-items-center rounded-full bg-[#f8e51c] transition hover:-translate-y-0.5 hover:shadow-md"><ArrowRight className="size-4" /></button></div> : null}</div>
        <div className="grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[190px] sm:grid-cols-3 sm:gap-4 lg:auto-rows-[210px] lg:grid-cols-4">
          {visibleGallery.map((item: any, i) => <article key={(item.id || item.title) + "-" + galleryIndex} className={`kem-gallery-card group relative overflow-hidden rounded-2xl bg-[#f8e51c] ${i === 0 ? "row-span-2 sm:col-span-2" : i === 3 ? "sm:row-span-2" : ""}`}><img src={item.image || imageOf(item)} alt={item.title} loading="lazy" className="kem-card-image h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#101629]/85 via-[#101629]/5 to-transparent opacity-90 transition group-hover:opacity-100" /><div className="absolute inset-x-0 bottom-0 p-4 sm:p-5"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#f8e51c]">{item.category || item.subtitle || ""}</p><h3 className="mt-1 text-base font-black text-white sm:text-lg">{item.title}</h3></div></article>)}
        </div>
        {galleryItems.length === 0 && <p className="mt-4 text-sm text-slate-500">Belum ada foto aktivitas yang dipublikasikan. Tambahkan foto aktivitas melalui Admin → Halaman → Kemahasiswaan.</p>}
      </section>

      <section className="bg-[#f8e51c] px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-7 rounded-[2rem] border border-[#17203b]/10 bg-white/55 p-6 backdrop-blur sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[.22em] text-[#776900]">Agenda & partisipasi</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Mari bertumbuh bersama.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700 sm:text-base">Punya pertanyaan atau ingin tahu aktivitas berikutnya? Hubungi tim SALUT Arek Malang untuk mendapatkan informasi yang sesuai kebutuhan Anda.</p></div><div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><a href="/#kontak" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#17203b] px-6 py-3.5 text-sm font-black text-white transition hover:-translate-y-1 hover:shadow-lg">Konsultasi via WhatsApp <ArrowUpRight className="size-4" /></a><a href="/daftar" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#17203b] px-6 py-3.5 text-sm font-black text-[#17203b] transition hover:bg-white/70">Mulai Pendaftaran <ArrowRight className="size-4" /></a></div></div>
      </section>
      <PublicFooter />
    </main>
  );
}
