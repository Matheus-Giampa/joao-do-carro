import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { LocationSection } from "@/components/site/LocationSection";
import { LeadForm } from "@/components/forms/LeadForm";
import { FacebookIcon, InstagramIcon, WhatsAppIcon, facebookUrl, instagramUrl } from "@/components/site/icons";
import { getStoreSettings } from "@/services/settings";
import { formatPhone } from "@/lib/utils";
import { generalMessage, whatsappLink } from "@/lib/whatsapp";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStoreSettings();
  return {
    title: "Contato",
    description: `Fale com a ${s.company_name} pelo WhatsApp, telefone, e-mail ou visite a loja.`,
    alternates: { canonical: "/contato" },
  };
}

export default async function ContatoPage() {
  const s = await getStoreSettings();
  const wa = whatsappLink(s.whatsapp, generalMessage(s.company_name));
  const ig = instagramUrl(s.instagram);
  const fb = facebookUrl(s.facebook);

  const channels = [
    s.whatsapp && { icon: WhatsAppIcon, label: "WhatsApp", value: formatPhone(s.whatsapp), href: wa, color: "bg-whatsapp" },
    s.phone && { icon: Phone, label: "Telefone", value: formatPhone(s.phone), href: `tel:${s.phone.replace(/\D/g, "")}`, color: "bg-ink-950" },
    s.email && { icon: Mail, label: "E-mail", value: s.email, href: `mailto:${s.email}`, color: "bg-ink-950" },
    ig && { icon: InstagramIcon, label: "Instagram", value: s.instagram!.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@"), href: ig, color: "bg-brand-600" },
    fb && { icon: FacebookIcon, label: "Facebook", value: "Acesse nossa página", href: fb, color: "bg-ink-950" },
    s.address && { icon: MapPin, label: "Endereço", value: s.address, href: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.address)}`, color: "bg-ink-950" },
    s.business_hours && { icon: Clock, label: "Horário", value: s.business_hours, href: null, color: "bg-ink-950" },
  ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; label: string; value: string; href: string | null; color: string }[];

  return (
    <>
      <PageHero eyebrow="Fale conosco" title="Contato" subtitle="Tire dúvidas, agende uma visita ou peça uma avaliação. Respondemos o mais rápido possível." />
      <div className="container pt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp w-full py-5 text-base">
            <WhatsAppIcon className="h-5 w-5" /> Chamar no WhatsApp
          </a>
          {channels.map(({ icon: Icon, label, value, href, color }) => {
            const inner = (
              <>
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-white ${color}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium text-ink-500">{label}</span>
                  <span className="block whitespace-pre-line break-words font-semibold text-ink-950">{value}</span>
                </span>
              </>
            );
            return href ? (
              <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-card-hover">
                {inner}
              </a>
            ) : (
              <div key={label} className="card flex items-center gap-4 p-4">{inner}</div>
            );
          })}
          {channels.length === 0 && (
            <p className="card p-5 text-sm text-ink-500">Os canais de contato aparecerão aqui após serem cadastrados no painel administrativo.</p>
          )}
        </div>

        <section className="card p-6 sm:p-8" aria-labelledby="form-contato">
          <h2 id="form-contato" className="font-display text-2xl font-bold text-ink-950">Envie uma mensagem</h2>
          <p className="mb-6 mt-1 text-sm text-ink-500">Preencha o formulário e retornaremos o contato.</p>
          <LeadForm idPrefix="ct" source="contato" whatsappHref={wa} submitLabel="Enviar mensagem" />
        </section>
      </div>
      <LocationSection settings={s} />
    </>
  );
}
