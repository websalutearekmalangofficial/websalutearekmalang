import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CircleUserRound, ClipboardPenLine, Globe, Home, LayoutDashboard, LogOut, Mail, MapPin, Menu, Phone, UserRound, X, Instagram } from "lucide-react";
import { SiteLogo } from "@/components/site-logo";
import { defaultFooterContent, fetchPublicFooter } from "@/lib/footer";
import { supabase } from "@/integrations/supabase/client";
import type { NavItem } from "@/lib/cms";

const fallbackNavLinks = [{ label: "Informasi", href: "/#informasi" }, { label: "Panduan", href: "/#panduan" }, { label: "Kontak", href: "/#kontak" }];

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  useEffect(() => {
    let mounted = true;
    void supabase.from("nav_items").select("*").eq("is_active", true).order("sort_order", { ascending: true }).then(({ data }) => {
      if (mounted) setNavItems((data ?? []) as NavItem[]);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const resolveUser = (user: { email?: string | null; user_metadata?: Record<string, unknown> } | null) => {
      if (!user) { setCurrentUser(null); return; }
      const metadata = user.user_metadata ?? {};
      const name =
        (typeof metadata.full_name === "string" && metadata.full_name.trim()) ||
        (typeof metadata.name === "string" && metadata.name.trim()) ||
        user.email?.split("@")[0] ||
        "Pengguna";
      setCurrentUser({ name, email: user.email ?? "" });
    };
    void supabase.auth.getUser().then(({ data }) => { if (mounted) resolveUser(data.user); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) resolveUser(session?.user ?? null);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const publicNav = navItems.length ? navItems : [{ id: "fallback", label: "Beranda", href: "/" } as NavItem, ...fallbackNavLinks.map((item, index) => ({ id: `fallback-${index}`, label: item.label, href: item.href, badge: null, icon: null, sort_order: index + 2, is_active: true }))];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ut-sky/25 bg-hero-nav text-hero-foreground shadow-header">
      <div className="mx-auto grid min-h-16 w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 lg:min-h-20 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:px-8 xl:px-12">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label="Sentra Layanan UT Beranda">
          <SiteLogo className="max-w-[145px] sm:max-w-[175px] md:max-w-[200px] lg:max-w-[220px]" imageClassName="max-h-12 sm:max-h-14" />
        </Link>
        <nav className="hidden min-w-0 items-center justify-center gap-1 lg:flex xl:gap-5" aria-label="Navigasi utama">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-ut-yellow px-3 py-2 text-xs font-black text-ut-navy shadow-yellow xl:px-4 xl:py-2.5 xl:text-sm">
            <Home className="size-4" aria-hidden="true" />Beranda
          </Link>
          {publicNav.filter((link) => link.href !== "/").map((link) => (
            <Link key={link.id} to={link.href} className="rounded-full px-2 py-1 text-sm font-bold text-hero-foreground/95 transition hover:text-ut-yellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-yellow">{link.label}</Link>
          ))}        </nav>
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 lg:min-w-0">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link to="/admin" aria-label="Akses Dashboard" title="Akses Dashboard" className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-ut-yellow px-2.5 py-2 text-[0.65rem] font-black text-ut-navy shadow-yellow lg:px-3 xl:px-4 xl:text-sm">
                <LayoutDashboard className="size-3.5 sm:size-4" /><span className="hidden lg:inline">Dashboard</span>
              </Link>
              <div className="hidden items-center gap-2 rounded-full border border-hero-foreground/40 bg-hero-foreground/10 px-3 py-1.5 text-hero-foreground xl:flex">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-ut-yellow text-ut-navy"><UserRound className="size-4" /></div>
                <div className="min-w-0 max-w-[180px] text-left leading-tight"><p className="truncate text-xs font-black">{currentUser.name}</p><p className="truncate text-[10px] text-hero-foreground/70">{currentUser.email}</p></div>
              </div>
              <button type="button" onClick={handleLogout} aria-label="Keluar" className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-hero-foreground/60 bg-transparent px-2.5 py-2 text-[0.65rem] font-bold text-hero-foreground lg:px-3 xl:px-4 xl:text-sm">
                <LogOut className="size-3.5 sm:size-4" /><span className="hidden lg:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth" aria-label="Masuk" className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-hero-foreground/60 bg-transparent px-2.5 py-2 text-[0.65rem] font-bold text-hero-foreground sm:px-4 sm:text-xs md:text-sm"><CircleUserRound className="size-3.5 sm:size-4" /><span>Masuk</span></Link>
              <Link to="/daftar" aria-label="Daftar" className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-ut-yellow px-2.5 py-2 text-[0.65rem] font-black text-ut-navy shadow-yellow sm:px-4 sm:text-xs md:text-sm"><ClipboardPenLine className="size-3.5 sm:size-4" /><span>Daftar</span></Link>
            </div>
          )}
          <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="public-mobile-nav" aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"} className="grid size-10 shrink-0 place-items-center rounded-full border border-hero-foreground/60 bg-hero-foreground/10 lg:hidden">
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {menuOpen ? (
        <nav id="public-mobile-nav" className="border-t border-hero-foreground/20 px-4 pb-4 pt-3 lg:hidden" aria-label="Navigasi mobile">
          <ul className="grid gap-2">
            <li><Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-xl bg-ut-yellow px-4 py-3 text-sm font-black text-ut-navy"><Home className="size-4" />Beranda</Link></li>
            {publicNav.filter((link) => link.href !== "/").map((link) => <li key={link.id}><Link to={link.href} onClick={() => setMenuOpen(false)} className="block rounded-xl bg-hero-foreground/10 px-4 py-3 text-sm font-bold text-hero-foreground">{link.label}</Link></li>)}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

export function PublicFooter() {
  const footerQuery = useQuery({ queryKey: ["public-footer"], queryFn: fetchPublicFooter, staleTime: 0, refetchOnMount: "always", refetchOnWindowFocus: true });
  const footer = footerQuery.data ?? defaultFooterContent;
  const socialLinks = [
    { label: "TikTok", value: "@salute.arek.malang", href: "https://tiktok.com/@salute.arek.malang", icon: <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="currentColor"><path d="M19.59 7.69a4.83 4.83 0 0 1-3.77-3.77V3h-3.4v11.34a2.89 2.89 0 1 1-2-2.73v-3.5a6.4 6.4 0 1 0 5.4 6.32V8.75a8.2 8.2 0 0 0 3.77.91V6.28Z" /></svg> },
    { label: "Instagram", value: "@salutearekmalang_ut", href: "https://www.instagram.com/salutearekmalang_ut/", icon: <Instagram className="size-5" /> },
    { label: "Website", value: "salutearekmalang.com", href: "https://salutearekmalang.com/", icon: <Globe className="size-5" /> },
    { label: "Email", value: "admin@salurtearekmalang.com", href: "mailto:admin@salurtearekmalang.com", icon: <Mail className="size-5" /> },
  ];
  return (
    <div id="kontak" className="relative w-full scroll-mt-20 bg-hero-nav text-hero-foreground">
      <footer className="w-full bg-hero-nav text-hero-foreground">
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-8 md:py-12 lg:px-12 lg:py-14">
          <div className="grid grid-cols-1 gap-10 lg:gap-12">
            <div className="flex w-full flex-col items-center justify-center gap-8 text-center md:flex-row md:items-center md:gap-10 lg:gap-14">
              {footer.contact?.enabled && <div className="flex min-w-0 flex-1 flex-col items-center justify-center text-center"><a href={footer.contact.phone_href || "#"} aria-label={`Hubungi ${footer.contact.label}`} className="mb-3 grid size-11 place-items-center rounded-full bg-ut-yellow text-ut-navy shadow-lg"><Phone className="size-5" fill="currentColor" /></a><p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-hero-foreground/70 sm:text-xs">{footer.contact.label}</p><a href={footer.contact.phone_href || "#"} className="font-display text-xl font-black tracking-[0.1em] text-hero-foreground sm:text-2xl">{footer.contact.phone}</a></div>}
              {footer.address?.enabled && footer.address?.text && <div className="flex min-w-0 flex-1 flex-col items-center justify-center text-center"><div className="mb-3 grid size-11 place-items-center rounded-full bg-ut-yellow text-ut-navy"><MapPin className="size-5" /></div><p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-hero-foreground/70 sm:text-xs">Alamat Kantor</p><p className="w-full max-w-[520px] text-sm font-medium leading-[1.6] text-hero-foreground/85 sm:text-base">{footer.address.text}</p></div>}
              <div className="flex min-w-0 flex-1 items-center justify-center"><Link to="/" aria-label="Kembali ke beranda" className="flex items-center justify-center"><SiteLogo className="justify-center" imageClassName="max-h-20 max-w-[210px] sm:max-h-24 sm:max-w-[240px] lg:max-h-28 lg:max-w-[270px]" /></Link></div>
            </div>
            <div className="border-t border-hero-foreground/15 pt-8 sm:pt-10"><div className="mx-auto max-w-5xl"><ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4" aria-label="Akun media sosial dan kontak SALUT Arek Malang">
              {socialLinks.map((item) => <li key={item.label} className="min-w-0"><a href={item.href} target={item.href.startsWith("mailto:") ? undefined : "_blank"} rel={item.href.startsWith("mailto:") ? undefined : "noopener noreferrer"} className="group flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border border-hero-foreground/15 bg-hero-foreground/10 px-3.5 py-3 text-center sm:justify-start sm:text-left"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ut-yellow text-ut-navy">{item.icon}</span><span className="min-w-0 flex-1"><span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-hero-foreground/65">{item.label}</span><span className="block truncate text-xs font-extrabold text-hero-foreground sm:text-sm">{item.value}</span></span></a></li>)}
            </ul></div></div>
          </div>
        </div>
      </footer>
      <div className="w-full border-t border-hero-foreground/15 bg-hero-nav py-2.5"><div className="mx-auto max-w-7xl px-4 text-center text-[10px] font-bold leading-normal text-hero-foreground/70 sm:px-6 sm:text-xs md:px-8 lg:px-12 lg:text-left"><p>© {new Date().getFullYear()} Sentra Layanan Universitas Terbuka Arek Malang.</p></div></div>
    </div>
  );
}
