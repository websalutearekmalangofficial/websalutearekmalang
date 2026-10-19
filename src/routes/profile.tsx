import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Mail, MapPin, MessageCircle, Target, Eye, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/public-site-chrome";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profil - SALUT Arek Malang" },
      {
        name: "description",
        content:
          "Profil SALUT Arek Malang, mitra resmi Universitas Terbuka untuk wilayah Malang dan sekitarnya.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try { await video.play(); setIsPlaying(true); }
      catch { setIsPlaying(false); }
    } else { video.pause(); setIsPlaying(false); }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const changeVolume = (nextVolume: number) => {
    const video = videoRef.current;
    const safeVolume = Math.min(1, Math.max(0, nextVolume));
    setVolume(safeVolume);
    if (video) {
      video.volume = safeVolume;
      const nextMuted = safeVolume === 0;
      video.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const query = useQuery({
    queryKey: ["profile-sections"],
    queryFn: async () => {
      const { data: page, error: pageError } = await supabase
        .from("pages")
        .select("id")
        .eq("slug", "profile")
        .maybeSingle();
      if (pageError) throw pageError;
      if (!page) return [];
      const { data, error } = await supabase
        .from("sections")
        .select("*, items:section_items(*)")
        .eq("page_id", page.id)
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((section) => ({
        ...section,
        items: [...(section.items ?? [])]
          .filter((item) => item.is_published)
          .sort((a, b) => a.sort_order - b.sort_order),
      }));
    },
  });

  const sections = query.data ?? [];
  const get = (kind: string) => sections.find((section) => section.kind === kind);
  const hero = get("hero");
  const about = get("richtext");
  const vision = sections.find((section) => section.kind === "richtext" && section.title === "Visi & Misi");
  const services = get("benefits");
  const contact = get("contact_banner");
  const contactConfig = (contact?.config ?? {}) as Record<string, unknown>;
  const whatsapp = String(contactConfig.whatsapp ?? "0812-3002-4264");
  const email = String(contactConfig.email ?? "admin@salutarekmalang.com");
  const address = String(contactConfig.address ?? "Mal Pelayanan Publik Merdeka Malang Lt. 3, Jl. Mayjen Sungkono, Kota Malang.");
  const whatsappDigits = whatsapp.replace(/\\D/g, "");
  const whatsappUrl = `https://wa.me/${whatsappDigits.startsWith("0") ? `62${whatsappDigits.slice(1)}` : whatsappDigits}`;

  if (query.isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <PublicHeader />
        <div className="mx-auto max-w-7xl px-5 py-20 text-center text-slate-500">
          Memuat profil SALUT Arek Malang...
        </div>
        <PublicFooter />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white font-body text-[#101010]">
      <PublicHeader />

      <section
        aria-label="Video Profil SALUT Arek Malang"
        className="relative isolate aspect-video max-h-[80vh] w-full overflow-hidden bg-[#08266f]"
      >
        <video
          ref={videoRef}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="absolute inset-0 h-full w-full object-contain"
          src="https://yfhbokrybbcbxgafjdhi.supabase.co/storage/v1/object/sign/cms-media/1792399409261-Video-Profil.mp4?token=eyJraWQiOiI4MTNjMTY3Ny04ZTVmLTRiZmYtOTAyNS1lMTIxY2U2ZDZlNTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJjbXMtbWVkaWEvMTc5MjM5OTQwOTI2MS1WaWRlby1Qcm9maWwubXA0Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc5MjM5OTU1MywiZXhwIjoxOTUwMDc5NTUzfQ.AONOT88srWjt50Q34tq7xkT0mU2-WEg91JS4rBvMqusjfFZm_Ozqjd3BYZMt5v9Ry7NbtTScelplgxKgij2EPQ"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          controls={false}
          aria-label="Video Profil SALUT Arek Malang"
        />
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-4 pb-4 pt-12 sm:px-6 sm:pb-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 rounded-2xl border border-white/20 bg-black/45 p-3 text-white shadow-lg backdrop-blur-md sm:gap-4 sm:px-4">
            <button type="button" onClick={togglePlayback} className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-ut-yellow text-ut-navy transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label={isPlaying ? "Jeda video" : "Putar video"} title={isPlaying ? "Jeda video" : "Putar video"}>
              {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
            </button>
            <button type="button" onClick={toggleMute} className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ut-yellow" aria-label={isMuted ? "Aktifkan suara" : "Matikan suara"} title={isMuted ? "Aktifkan suara" : "Matikan suara"}>
              {isMuted || volume === 0 ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </button>
            <label className="flex min-w-[150px] flex-1 items-center gap-3 text-xs font-semibold sm:max-w-sm">
              <span className="whitespace-nowrap">Volume</span>
              <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => changeVolume(Number(event.target.value))} className="h-2 min-w-0 flex-1 cursor-pointer accent-[#facc15]" aria-label="Atur volume video" aria-valuetext={Math.round(volume * 100) + " persen"} />
              <span className="w-9 text-right tabular-nums">{Math.round(volume * 100)}%</span>
            </label>
            <span className="ml-auto hidden text-xs font-semibold text-white/80 sm:inline">Video Profil SALUT Arek Malang</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        {about && (
          <section className="mb-16 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#08266f]">
                Tentang Kami
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
                {about.title || "Apa itu SALUT Arek Malang?"}
              </h2>
            </div>
            <div className="rounded-3xl bg-slate-50 p-7 text-sm leading-7 text-slate-600 sm:p-9 sm:text-base">
              {about.body}
            </div>
          </section>
        )}

        {vision && (
          <section className="mb-16 rounded-[2rem] bg-[#f4f7ff] p-7 sm:p-10">
            <div className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-3xl bg-white p-7 shadow-sm">
                <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-[#08266f] text-white">
                  <Eye className="size-6" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#08266f]">Visi</p>
                <p className="mt-3 text-base font-bold leading-7 text-slate-700">
                  {vision.body?.split("\n\nMisi:")[0] || vision.body}
                </p>
              </article>
              <article className="rounded-3xl bg-[#08266f] p-7 text-white shadow-sm">
                <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-white text-[#08266f]">
                  <Target className="size-6" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">Misi</p>
                <div className="mt-3 space-y-3 text-sm leading-6 text-blue-50">
                  {(vision.body?.split("\n\nMisi:")[1] || "")
                    .split("\n")
                    .filter(Boolean)
                    .map((mission, index) => (
                      <p key={index} className="flex gap-3">
                        <CheckCircle2 className="mt-1 size-4 shrink-0" />
                        <span>{mission.replace(/^\d+\.\s*/, "")}</span>
                      </p>
                    ))}
                </div>
              </article>
            </div>
          </section>
        )}

        {services && (
          <section className="mb-16">
            <div className="mb-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#08266f]">
                Layanan Utama
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
                {services.title || "Layanan Utama"}
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.items.map((item) => (
                <article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-[#08266f] text-white">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.body || item.subtitle}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {contact && (
          <section className="overflow-hidden rounded-[2rem] bg-[#08266f] p-7 text-white sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
                  Kontak & Lokasi
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  {contact.title || "Mari Kunjungi Kami atau Hubungi Tim Layanan Kami."}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100">
                  {contact.body}
                </p>
              </div>
              <div className="grid w-full min-w-0 gap-3 text-sm lg:max-w-md">
                <a href="https://wa.me/6281230024264" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-4 font-bold hover:bg-white/15">
                  <MessageCircle className="size-5 text-ut-yellow" />
                  0812-3002-4264
                </a>
                <a href="mailto:admin@salutarekmalang.com" className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-4 font-bold hover:bg-white/15">
                  <Mail className="size-5 text-ut-yellow" />
                  admin@salutarekmalang.com
                </a>
                <div className="flex items-start gap-3 rounded-2xl bg-white/10 px-5 py-4 font-bold">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-ut-yellow" />
                  <span className="min-w-0 whitespace-pre-line break-words leading-6">{address}</span>
                </div>
                {contact.link_url ? (
                  <a href={contact.link_url} className="inline-flex items-center justify-center gap-2 rounded-xl bg-ut-yellow px-5 py-3 text-sm font-black text-ut-navy">
                    {contact.link_label || "Hubungi Kami"}
                    <ArrowRight className="size-4" />
                  </a>
                ) : null}
              </div>
            </div>
          </section>
        )}
      </div>

      <PublicFooter />
    </main>
  );
}
