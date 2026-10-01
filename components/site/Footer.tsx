import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { FacebookIcon, InstagramIcon, WhatsAppIcon, facebookUrl, instagramUrl } from "./icons";
import { formatPhone } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { whatsappLink, generalMessage } from "@/lib/whatsapp";
import type { StoreSettings } from "@/types";

export function Footer({ settings: s }: { settings: StoreSettings }) {
  const ig = instagramUrl(s.instagram);
  const fb = facebookUrl(s.facebook);
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-20 overflow-hidden rounded-t-[2rem] bg-ink-950 text-ink-300">
            <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo name={s.company_name} logoUrl={s.logo_url} />
          <p className="max-w-xs text-sm leading-relaxed">{s.slogan}</p>
          <div className="flex gap-2">
            {ig && (
              <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full bg-white/5 transition hover:bg-brand-600 hover:text-white">
                <InstagramIcon />
              </a>
            )}
            {fb && (
              <a href={fb} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full bg-white/5 transition hover:bg-brand-600 hover:text-white">
                <FacebookIcon />
              </a>
            )}
            <a href={whatsappLink(s.whatsapp, generalMessage(s.company_name))} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid h-10 w-10 place-items-center rounded-full bg-white/5 transition hover:bg-whatsapp hover:text-white">
              <WhatsAppIcon />
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-display text-base font-semibold text-white">Navegação</h3>
          <ul className="space-y-2.5 text-sm">
            {[
              ["/estoque", "Estoque completo"],
              ["/estoque?oferta=1", "Ofertas"],
              ["/financiamento", "Simular financiamento"],
              ["/sobre", "Sobre a loja"],
              ["/contato", "Contato"],
              // Site real: painel de verdade. Demonstração (sem banco): painel de exemplo
              [isSupabaseConfigured ? "/admin" : "/painel-demo", "Área da loja"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="transition hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-base font-semibold text-white">Carrocerias</h3>
          <ul className="grid grid-cols-2 gap-2.5 text-sm">
            {["Hatch", "Sedan", "SUV", "Picape", "Utilitário", "Conversível", "Minivan"].map((b) => (
              <li key={b}>
                <Link href={`/estoque?carroceria=${encodeURIComponent(b)}`} className="transition hover:text-white">
                  {b}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-base font-semibold text-white">Atendimento</h3>
          <ul className="space-y-3 text-sm">
            {s.whatsapp && (
              <li className="flex gap-3">
                <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-whatsapp" /> {formatPhone(s.whatsapp)}
              </li>
            )}
            {s.phone && (
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> {formatPhone(s.phone)}
              </li>
            )}
            {s.email && (
              <li className="flex gap-3 break-all">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> {s.email}
              </li>
            )}
            {s.address && (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> {s.address}
              </li>
            )}
            {s.business_hours && (
              <li className="flex gap-3 whitespace-pre-line">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> {s.business_hours}
              </li>
            )}
            {!s.whatsapp && !s.phone && !s.email && !s.address && (
              <li className="text-ink-400">Contatos configuráveis no painel administrativo.</li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-xs text-ink-400 sm:flex-row">
          <p>
            © {year} {s.company_name}. Todos os direitos reservados.
          </p>
          <p>Preços e condições sujeitos a alteração sem aviso prévio. Imagens meramente ilustrativas.</p>
        </div>
      </div>
    </footer>
  );
}
