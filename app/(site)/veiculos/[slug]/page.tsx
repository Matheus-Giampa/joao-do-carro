import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Car,
  CheckCircle2,
  DoorOpen,
  Fuel,
  Gauge,
  Hash,
  Palette,
  Settings2,
  Tag,
} from "lucide-react";
import { FavoriteButton } from "@/components/account/FavoriteButton";
import { Gallery } from "@/components/vehicle/Gallery";
import { VehicleBadges } from "@/components/vehicle/VehicleBadges";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { FinanceSimulator } from "@/components/finance/FinanceSimulator";
import { LeadForm } from "@/components/forms/LeadForm";
import { WhatsAppIcon } from "@/components/site/icons";
import { VEHICLE_STATUS_LABEL } from "@/lib/constants";
import { absoluteUrl, cn, formatKm, formatPrice, vehicleFullName, vehicleYears } from "@/lib/utils";
import { vehicleInterestMessage, whatsappLink } from "@/lib/whatsapp";
import { getSimilarVehicles, getVehicleBySlug } from "@/services/vehicles";
import { getStoreSettings } from "@/services/settings";
import { DEMO_VEHICLES } from "@/lib/demo-data";
import { IS_STATIC_EXPORT } from "@/lib/paths";
import type { Vehicle } from "@/types";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

/** Na versão estática (GitHub Pages) as páginas dos veículos de demonstração são geradas no build. */
export async function generateStaticParams() {
  if (!IS_STATIC_EXPORT) return [];
  return DEMO_VEHICLES.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [v, s] = await Promise.all([getVehicleBySlug(slug), getStoreSettings()]);
  if (!v) return { title: "Veículo não encontrado" };
  const name = `${v.brand} ${v.model} ${v.version ?? ""} ${v.year_model}`.replace(/\s+/g, " ").trim();
  const title = `${name} à venda`;
  const description = `${name}, ${vehicleYears(v)}, ${formatKm(v.mileage)}, ${v.transmission}, ${v.fuel}, por ${formatPrice(v.price)}. Veja fotos e detalhes na ${s.company_name}.`;
  const image = v.images[0]?.url;
  return {
    title,
    description,
    alternates: { canonical: `/veiculos/${v.slug}` },
    openGraph: {
      title: `${title} | ${s.company_name}`,
      description,
      url: `/veiculos/${v.slug}`,
      type: "website",
      images: image ? [{ url: absoluteUrl(image), alt: name }] : undefined,
    },
  };
}

export default async function VehiclePage({ params }: Props) {
  const { slug } = await params;
  const [v, s] = await Promise.all([getVehicleBySlug(slug), getStoreSettings()]);
  if (!v) notFound();

  const similar = await getSimilarVehicles(v, 4);
  const fullName = vehicleFullName(v);
  const wa = whatsappLink(s.whatsapp, vehicleInterestMessage(v, s.company_name));
  const sold = v.status === "vendido";

  const specs = [
    { icon: Tag, label: "Marca", value: v.brand },
    { icon: Car, label: "Modelo", value: v.model },
    { icon: Calendar, label: "Ano", value: vehicleYears(v) },
    { icon: Gauge, label: "Quilometragem", value: formatKm(v.mileage) },
    { icon: Fuel, label: "Combustível", value: v.fuel },
    { icon: Settings2, label: "Câmbio", value: v.transmission },
    { icon: Car, label: "Carroceria", value: v.body_type },
    { icon: Palette, label: "Cor", value: v.color },
    { icon: Hash, label: "Final da placa", value: v.plate_end },
    { icon: DoorOpen, label: "Portas", value: v.doors?.toString() },
  ].filter((s) => s.value);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: fullName,
    brand: { "@type": "Brand", name: v.brand },
    model: v.model,
    vehicleConfiguration: v.version ?? undefined,
    productionDate: String(v.year_manufacture),
    vehicleModelDate: String(v.year_model),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: v.mileage, unitCode: "KMT" },
    fuelType: v.fuel,
    vehicleTransmission: v.transmission,
    bodyType: v.body_type,
    color: v.color ?? undefined,
    numberOfDoors: v.doors ?? undefined,
    itemCondition: "https://schema.org/UsedCondition",
    image: v.images.map((i) => absoluteUrl(i.url)),
    description: v.description ?? undefined,
    url: absoluteUrl(`/veiculos/${v.slug}`),
    offers: {
      "@type": "Offer",
      price: v.price,
      priceCurrency: "BRL",
      availability: sold ? "https://schema.org/SoldOut" : v.status === "reservado" ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock",
      seller: { "@type": "AutoDealer", name: s.company_name },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Estoque", item: absoluteUrl("/estoque") },
      { "@type": "ListItem", position: 3, name: fullName, item: absoluteUrl(`/veiculos/${v.slug}`) },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbLd]) }} />

      <div className="container pb-28 pt-6 sm:pt-8 lg:pb-12">
        <nav className="mb-4 flex flex-wrap gap-1 text-xs text-ink-500" aria-label="Trilha">
          <Link href="/" className="hover:text-ink-900">Início</Link> /
          <Link href="/estoque" className="hover:text-ink-900">Estoque</Link> /
          <Link href={`/estoque?marca=${encodeURIComponent(v.brand)}`} className="hover:text-ink-900">{v.brand}</Link> /
          <span className="text-ink-900">{v.model}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr]">
          {/* Coluna principal */}
          <div className="min-w-0 space-y-8">
            <Gallery images={v.images} alt={fullName} sold={sold}>
              <VehicleBadges vehicle={v} className="pointer-events-none absolute left-3 top-3" />
              {sold && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center bg-ink-950/40">
                  <span className="-rotate-6 rounded-xl border-4 border-white px-8 py-2 font-display text-4xl font-extrabold uppercase tracking-widest text-white sm:text-5xl">
                    Vendido
                  </span>
                </div>
              )}
            </Gallery>

            {/* Título (mobile) */}
            <div className="lg:hidden">
              <TitleBlock v={v} />
            </div>

            <section aria-labelledby="ficha" className="card p-5 sm:p-7">
              <h2 id="ficha" className="font-display text-xl font-bold text-ink-950">Ficha técnica</h2>
              <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 rounded-xl bg-ink-50 p-3">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    <div className="min-w-0">
                      <dt className="text-xs font-medium text-ink-500">{label}</dt>
                      <dd className="truncate font-semibold text-ink-950">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </section>

            {v.options.length > 0 && (
              <section aria-labelledby="opcionais" className="card p-5 sm:p-7">
                <h2 id="opcionais" className="font-display text-xl font-bold text-ink-950">Itens e opcionais</h2>
                <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                  {v.options.map((o) => (
                    <li key={o} className="flex items-center gap-2 text-sm text-ink-800">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> {o}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {v.description && (
              <section aria-labelledby="descricao" className="card p-5 sm:p-7">
                <h2 id="descricao" className="font-display text-xl font-bold text-ink-950">Descrição do veículo</h2>
                <p className="prose-text mt-4">{v.description}</p>
              </section>
            )}

            {!sold && (
              <section id="financiamento" aria-label="Simulação de financiamento" className="scroll-mt-24">
                <FinanceSimulator
                  initialValue={v.price}
                  monthlyRate={s.finance_monthly_rate}
                  vehicleId={v.id}
                  vehicleLabel={fullName}
                  whatsappHref={wa}
                  compact
                />
              </section>
            )}
          </div>

          {/* Coluna lateral */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5 sm:p-6">
              <div className="hidden lg:block">
                <TitleBlock v={v} />
              </div>
              <div className="mt-0 lg:mt-5 lg:border-t lg:border-ink-100 lg:pt-5">
                {v.previous_price && v.previous_price > v.price && !sold && (
                  <p className="text-sm text-ink-400">
                    De <span className="line-through">{formatPrice(v.previous_price)}</span> por
                  </p>
                )}
                <p className={cn("font-display text-4xl font-extrabold", sold ? "text-ink-400" : "text-ink-950")}>{formatPrice(v.price)}</p>
                <p className={cn("mt-1 text-sm font-semibold", sold ? "text-brand-700" : v.status === "reservado" ? "text-amber-600" : "text-emerald-600")}>
                  ● {VEHICLE_STATUS_LABEL[v.status]}
                </p>
              </div>
              <div className="mt-5 grid gap-2.5">
                <div className="flex gap-2.5">
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-primary flex-1 py-4 text-base">
                    <WhatsAppIcon className="h-5 w-5" /> {sold ? "Quero um similar" : "Tenho interesse"}
                  </a>
                  <FavoriteButton vehicleId={v.id} label={fullName} variant="outline" className="h-auto w-14 shrink-0" />
                </div>
                <a href="#proposta" className="btn btn-outline py-3.5">Solicitar proposta</a>
                {!sold && <a href="#financiamento" className="btn btn-ghost py-3">Simular financiamento</a>}
              </div>
            </div>

            <div id="proposta" className="card scroll-mt-24 p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold text-ink-950">Solicitar proposta</h2>
              <p className="mb-5 mt-1 text-sm text-ink-500">Deixe seu contato e retornaremos com as condições para este veículo.</p>
              <LeadForm
                idPrefix="prop"
                source="proposta"
                vehicleId={v.id}
                vehicleLabel={fullName}
                defaultMessage={`Tenho interesse no ${fullName}.`}
                whatsappHref={wa}
                submitLabel="Enviar proposta"
              />
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-16" aria-labelledby="similares">
            <h2 id="similares" className="section-title">Veículos semelhantes</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((sv) => (
                <VehicleCard key={sv.id} vehicle={sv} whatsapp={s.whatsapp} companyName={s.company_name} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Barra fixa no celular */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-100 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,.08)] backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-ink-500">{v.brand} {v.model}</p>
            <p className="font-display text-xl font-extrabold leading-tight text-ink-950">{formatPrice(v.price)}</p>
          </div>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-primary px-5 py-3.5">
            <WhatsAppIcon className="h-4 w-4" /> {sold ? "Similar" : "Tenho interesse"}
          </a>
        </div>
      </div>
    </>
  );
}

function TitleBlock({ v }: { v: Vehicle }) {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink-950">
        {v.brand} {v.model}
      </h1>
      {v.version && <p className="mt-1 text-ink-600">{v.version}</p>}
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-ink-700">
        <span className="rounded-full bg-ink-100 px-2.5 py-1">{vehicleYears(v)}</span>
        <span className="rounded-full bg-ink-100 px-2.5 py-1">{formatKm(v.mileage)}</span>
        <span className="rounded-full bg-ink-100 px-2.5 py-1">{v.transmission}</span>
        <span className="rounded-full bg-ink-100 px-2.5 py-1">{v.fuel}</span>
      </div>
    </div>
  );
}
