"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
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

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const isActive = (href: string) => {
    const path = href.split("?")[0];
    if (href.includes("oferta")) return false;
    return path === "/" ? pathname === "/" : pathname.startsWith(path);
  };

  return (
    <header
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
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-lg px-3 py-2 text-sm font-semibold text-ink-200 transition hover:text-white",
                isActive(item.href) &&
                  "text-white after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded after:bg-brand-600",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {phone && (
            <a href={`tel:${phone.replace(/\D/g, "")}`} className="flex items-center gap-2 text-sm font-semibold text-ink-200 hover:text-white">
              <Phone className="h-4 w-4" /> {formatPhone(phone)}
            </a>
          )}
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm py-2.5">
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp
          </a>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-10 w-10 place-items-center rounded-xl bg-whatsapp text-white"
            aria-label="Falar no WhatsApp"
          >
            <WhatsAppIcon />
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-x-0 bottom-0 top-[68px] z-40 overflow-y-auto bg-ink-950 lg:hidden">
          <nav className="container flex flex-col gap-1 py-6" aria-label="Menu móvel">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-4 py-4 font-display text-lg font-semibold text-ink-100 hover:bg-white/5",
                  isActive(item.href) && "bg-white/5 text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-6 grid gap-3 border-t border-white/10 pt-6">
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
    </header>
  );
}
