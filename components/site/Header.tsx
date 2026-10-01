"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { AccountMenu, FavoritesLink, MobileAccountLinks } from "@/components/account/AccountMenu";
import { WhatsAppIcon } from "./icons";
import { cn, formatPhone } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/estoque", label: "Estoque" },
  { href: "/estoque?oferta=1", label: "Ofertas" },
  { href: "/financiamento", label: "Financiamento" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

/** "Ofertas" e "Estoque" têm o mesmo caminho: diferencia pelo ?oferta=1. */
function useIsActive() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOffer = searchParams.get("oferta") === "1";
  return (href: string) => {
    const path = href.split("?")[0];
    if (href.includes("oferta")) return pathname.startsWith(path) && isOffer;
    if (path === "/estoque") return pathname.startsWith(path) && !isOffer;
    return path === "/" ? pathname === "/" : pathname.startsWith(path);
  };
}

function NavLinks({ variant, isActive = () => false }: { variant: "desktop" | "mobile"; isActive?: (href: string) => boolean }) {
  return (
    <>
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={cn(
            variant === "desktop"
              ? "rounded-full px-3.5 py-2 text-[15px] font-medium text-ink-300 transition hover:text-white"
              : "rounded-2xl px-4 py-4 font-display text-xl font-semibold text-ink-100 hover:bg-white/5",
            isActive(item.href) && "bg-white/10 text-white",
          )}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

/** useSearchParams exige Suspense na exportação estática; o fallback mostra os links sem destaque. */
function Nav({ variant }: { variant: "desktop" | "mobile" }) {
  return (
    <Suspense fallback={<NavLinks variant={variant} />}>
      <ActiveNavLinks variant={variant} />
    </Suspense>
  );
}

function ActiveNavLinks({ variant }: { variant: "desktop" | "mobile" }) {
  return <NavLinks variant={variant} isActive={useIsActive()} />;
}

export function Header({
  companyName,
  logoUrl,
  phone,
  whatsappHref,
}: {
  companyName: string;
  logoUrl: string | null;
  phone: string | null;
  whatsappHref: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuTop, setMenuTop] = useState(68);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    // O menu móvel abre logo abaixo do header (que pode estar abaixo da faixa de demonstração)
    if (open && headerRef.current) setMenuTop(headerRef.current.getBoundingClientRect().bottom);
  }, [open]);

  return (
    <>
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-40 bg-ink-950/95 text-white backdrop-blur transition-shadow",
        scrolled && "shadow-lg shadow-black/30",
      )}
    >
      <div className="container flex h-[68px] items-center justify-between gap-4 lg:h-20">
        <Link href="/" className="shrink-0" aria-label={`${companyName} — página inicial`}>
          <Logo name={companyName} logoUrl={logoUrl} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Menu principal">
          <Nav variant="desktop" />
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          {phone && (
            <a href={`tel:${phone.replace(/\D/g, "")}`} className="flex items-center gap-2 text-sm font-semibold text-ink-200 hover:text-white">
              <Phone className="h-4 w-4" /> {formatPhone(phone)}
            </a>
          )}
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm py-2.5">
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp
          </a>
          <FavoritesLink />
          <AccountMenu />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <FavoritesLink />
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-10 w-10 place-items-center rounded-full bg-whatsapp text-white"
            aria-label="Falar no WhatsApp"
          >
            <WhatsAppIcon />
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>

      {/* Fica FORA do <header>: o backdrop-blur dele "prende" elementos fixed e o menu abria com altura 0 */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-ink-950 text-white lg:hidden" style={{ top: menuTop }}>
          {/* Fecha ao tocar num link (Estoque → Ofertas não muda o caminho, só a busca) */}
          <nav
            className="container flex flex-col gap-1 py-6"
            aria-label="Menu móvel"
            onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
          >
            <Nav variant="mobile" />
            <div className="mt-4 border-t border-white/10 pt-4">
              <MobileAccountLinks />
            </div>
            <div className="mt-4 grid gap-3 border-t border-white/10 pt-6">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp w-full py-4">
                <WhatsAppIcon /> Falar no WhatsApp
              </a>
              {phone && (
                <a href={`tel:${phone.replace(/\D/g, "")}`} className="btn w-full border border-white/20 py-4 text-white">
                  <Phone className="h-4 w-4" /> Ligar {formatPhone(phone)}
                </a>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
