import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { WhatsAppIcon } from "./icons";
import { formatPhone } from "@/lib/utils";
import { generalMessage, whatsappLink } from "@/lib/whatsapp";
import type { StoreSettings } from "@/types";

/** "Onde estamos": endereço, mapa, horário e botão Como chegar — tudo vindo das configurações. */
export function LocationSection({ settings: s }: { settings: StoreSettings }) {
  const mapQuery = encodeURIComponent(s.address ?? "");
  return (
    <section className="container py-16" aria-labelledby="onde-estamos">
      <div className="overflow-hidden rounded-3xl bg-white shadow-card lg:grid lg:grid-cols-[1fr_1.3fr]">
        <div className="p-6 sm:p-10">
          <p className="eyebrow">Visite a loja</p>
          <h2 id="onde-estamos" className="section-title mt-2">Onde estamos</h2>
          <ul className="mt-8 space-y-6">
            <li className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink-100 text-ink-900"><MapPin className="h-5 w-5" /></span>
              <div>
                <p className="text-[13px] font-medium text-ink-500">Endereço</p>
                <p className="mt-0.5 font-medium text-ink-900">{s.address ?? "Endereço ainda não configurado."}</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink-100 text-ink-900"><Clock className="h-5 w-5" /></span>
              <div>
                <p className="text-[13px] font-medium text-ink-500">Horário de funcionamento</p>
                <p className="mt-0.5 whitespace-pre-line font-medium text-ink-900">{s.business_hours ?? "Horário ainda não configurado."}</p>
              </div>
            </li>
            {(s.phone || s.whatsapp) && (
              <li className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink-100 text-ink-900"><Phone className="h-5 w-5" /></span>
                <div>
                  <p className="text-[13px] font-medium text-ink-500">Contato</p>
                  <p className="mt-0.5 font-medium text-ink-900">{formatPhone(s.phone ?? s.whatsapp)}</p>
                </div>
              </li>
            )}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            {s.address && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <Navigation className="h-4 w-4" /> Como chegar
              </a>
            )}
            <a href={whatsappLink(s.whatsapp, generalMessage(s.company_name))} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
        <div className="relative min-h-[320px] bg-ink-100">
          {s.address ? (
            <iframe
              title={`Mapa — ${s.company_name}`}
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center p-8 text-center text-sm text-ink-500">
              <div>
                <MapPin className="mx-auto mb-3 h-10 w-10 text-ink-300" />
                O mapa aparecerá aqui assim que o endereço for cadastrado em
                <br />
                <strong>Painel → Configurações</strong>.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
