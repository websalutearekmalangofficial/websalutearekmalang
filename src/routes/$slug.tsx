import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Check, Quote } from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/public-site-chrome";
import { Index } from "@/routes/index";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/$slug")({
  loader: {
    handler: async ({ params }) => {
      const data = await fetchPublishedPage(params.slug);
      if (!data) throw notFound();
      return data;
    },
    staleReloadMode: "background",
  },
  head: ({ loaderData }) => {
    const isHomepageTemplate =
      (loaderData?.page.content as { template?: string } | null)?.template ===
      "homepage";

    if (isHomepageTemplate) {
      return {
        meta: [
          { title: "Sentra Layanan UT Arek Malang" },
          {
            name: "description",
            content:
              "Landing page resmi Sentra Layanan UT Arek Malang untuk pendaftaran, alur layanan, kelebihan, testimoni, dan informasi kontak.",
          },
          {
            property: "og:title",
            content: "Sentra Layanan UT Arek Malang",
          },
          {
            property: "og:description",
            content:
              "Daftar dan dapatkan informasi pendaftaran Universitas Terbuka melalui Sentra Layanan UT Arek Malang.",
          },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary_large_image" },
        ],
      };
    }

    return {
      meta: [
        { title: "Halaman - Sentra Layanan UT Arek Malang" },
        {
          name: "description",
          content: "Informasi Sentra Layanan UT Arek Malang.",
        },
      ],
    };
  },
  component: PublicCmsPage,
});

type Item = {
  id: string;
  sort_order: number;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  icon: string | null;
  media_url: string | null;
  link_url: string | null;
  link_label: string | null;
  is_published: boolean;
};

type Section = {
  id: string;
  kind: string;
  sort_order: number;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  media_url: string | null;
  media_kind: string | null;
  link_url: string | null;
  link_label: string | null;
  is_published: boolean;
  items: Item[];
};

async function fetchPublishedPage(slug: string) {
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id, slug, title, meta_title, meta_description, content, is_published")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (pageError) throw pageError;
  if (!page) return null;

  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select("id, kind, sort_order, eyebrow, title, subtitle, body, media_url, media_kind, link_url, link_label, is_published")
    .eq("page_id", page.id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (sectionsError) throw sectionsError;

  const ids = (sections ?? []).map((section) => section.id);
  let items: Item[] = [];

  if (ids.length) {
    const { data, error } = await supabase
      .from("section_items")
      .select("id, section_id, sort_order, title, subtitle, body, icon, media_url, link_url, link_label, is_published")
      .in("section_id", ids)
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    items = (data ?? []) as Item[];
  }

  return {
    page,
    sections: (sections ?? []).map((section) => ({
      ...(section as Section),
      items: items.filter((item) => (item as Item & { section_id?: string }).section_id === section.id),
    })),
  };
}

function PublicCmsPage() {
  const { page, sections } = Route.useLoaderData();

  if ((page.content as { template?: string } | null)?.template === "homepage") {
    return <Index />;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fafc] font-body text-slate-900">
      <PublicHeader />
      <div>
        {sections.map((section) => <CmsSection key={section.id} section={section} />)}
      </div>
      <PublicFooter />
    </main>
  );
}

function CmsSection({ section }: { section: Section }) {
  const title = section.title?.trim();
  const body = section.body?.trim();

  if (section.kind === "hero") {
    return (
      <section className="relative overflow-hidden bg-hero-deep text-white">
        {section.media_url ? <img src={section.media_url} alt={title || "Banner"} className="max-h-[560px] w-full object-contain" /> : null}
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:px-8 md:py-24 lg:px-12">
          {section.eyebrow ? <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-ut-yellow">{section.eyebrow}</p> : null}
          {title ? <h1 className="mt-3 max-w-4xl font-display text-4xl font-black sm:text-5xl">{title}</h1> : null}
          {body ? <p className="mt-5 max-w-3xl text-base leading-7 text-blue-100 sm:text-lg">{body}</p> : null}
          {section.link_url ? <CmsLink href={section.link_url} label={section.link_label || "Selengkapnya"} /> : null}
        </div>
      </section>
    );
  }

  if (section.kind === "testimonials") {
    return (
      <section className="bg-hero-nav px-4 py-14 text-white sm:px-6 md:px-8 md:py-20 lg:px-12">
        <SectionHeading section={section} light />
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {section.items.map((item) => (
            <article key={item.id} className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <Quote className="mb-5 size-8 text-ut-yellow" />
              {item.media_url ? <img src={item.media_url} alt={item.title || "Testimoni"} className="mb-4 size-16 rounded-full object-cover" /> : null}
              <p className="text-sm leading-6 text-blue-50">{item.body}</p>
              <h3 className="mt-5 font-black text-white">{item.title}</h3>
              {item.subtitle ? <p className="mt-1 text-xs font-bold text-blue-200">{item.subtitle}</p> : null}
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (section.kind === "process" || section.kind === "benefits") {
    return (
      <section className="bg-white px-4 py-14 sm:px-6 md:px-8 md:py-20 lg:px-12">
        <SectionHeading section={section} />
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {section.items.map((item, index) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {section.kind === "process" ? <div className="mb-4 grid size-10 place-items-center rounded-full bg-ut-yellow font-black text-ut-navy">{index + 1}</div> : null}
              <h3 className="font-black text-[#111c38]">{item.title}</h3>
              {item.subtitle ? <p className="mt-1 text-xs font-bold text-yellow-700">{item.subtitle}</p> : null}
              {item.body ? <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p> : null}
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (section.kind === "form") {
    return (
      <section className="bg-white px-4 py-14 sm:px-6 md:px-8 md:py-20 lg:px-12">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-[#111c38] p-8 text-white shadow-xl md:p-12">
          <SectionHeading section={section} light />
          {body ? <p className="mt-4 max-w-2xl text-blue-100">{body}</p> : null}
          <CmsLink href="/daftar" label={section.link_label || "Mulai Pendaftaran"} />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white px-4 py-14 sm:px-6 md:px-8 md:py-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <SectionHeading section={section} />
        {section.media_url ? <img src={section.media_url} alt={title || "Konten"} className="mb-8 max-h-[520px] w-full rounded-3xl object-contain" /> : null}
        {body ? <div className="max-w-4xl whitespace-pre-line text-base leading-8 text-slate-600">{body}</div> : null}
        {section.items.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-6"><h3 className="font-black">{item.title}</h3>{item.body ? <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p> : null}</article>)}
          </div>
        ) : null}
        {section.link_url ? <CmsLink href={section.link_url} label={section.link_label || "Selengkapnya"} /> : null}
      </div>
    </section>
  );
}

function SectionHeading({ section, light = false }: { section: Section; light?: boolean }) {
  return (
    <div className="mx-auto mb-10 max-w-7xl">
      {section.eyebrow ? <p className={light ? "text-xs font-extrabold uppercase tracking-[0.2em] text-ut-yellow" : "text-xs font-extrabold uppercase tracking-[0.2em] text-yellow-600"}>{section.eyebrow}</p> : null}
      {section.title ? <h2 className={light ? "mt-2 font-display text-3xl font-black text-white sm:text-4xl" : "mt-2 font-display text-3xl font-black text-[#111c38] sm:text-4xl"}>{section.title}</h2> : null}
      {section.subtitle ? <p className={light ? "mt-3 max-w-3xl text-blue-100" : "mt-3 max-w-3xl text-slate-600"}>{section.subtitle}</p> : null}
    </div>
  );
}

function CmsLink({ href, label }: { href: string; label: string }) {
  if (href.startsWith("http")) return <a href={href} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-ut-yellow px-6 py-3 text-sm font-black text-ut-navy">{label}<ArrowRight className="size-4" /></a>;
  return <Link to={href as never} className="mt-7 inline-flex items-center gap-2 rounded-full bg-ut-yellow px-6 py-3 text-sm font-black text-ut-navy">{label}<ArrowRight className="size-4" /></Link>;
}
