import Link from "next/link";
import { ArrowRight, BadgePercent, Calculator, Car, MessageCircle, Search, ShieldCheck, Sparkles, Warehouse } from "lucide-react";
import { QuickSearch } from "@/components/site/QuickSearch";
import { LocationSection } from "@/components/site/LocationSection";
import { CarSwoosh } from "@/components/brand/Logo";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { VehicleImage } from "@/components/vehicle/VehicleImage";
import { BodyTypeIcon } from "@/components/vehicle/BodyTypeIcon";
import { WhatsAppIcon } from "@/components/site/icons";
import { BODY_TYPES } from "@/lib/constants";
import { absoluteUrl, coverImage, formatKm, formatPrice, vehicleYears } from "@/lib/utils";
import { generalMessage, whatsappLink } from "@/lib/whatsapp";
import { getFeaturedVehicles, getFilterOptions, getOfferVehicles } from "@/services/vehicles";
import { getStoreSettings } from "@/services/settings";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, options, featured, offers] = await Promise.all([
    getStoreSettings(),
    getFilterOptions(),
    getFeaturedVehicles(8),
    getOfferVehicles(4),
  ]);
  const wa = whatsappLink(settings.whatsapp, generalMessage(settings.company_name));
  const showcase = featured[0];

  const shortcuts = [
    { href: "/estoque", label: "Comprar carro", icon: Car },
    { href: "/estoque?ordem=recentes", label: "Ver estoque", icon: Warehouse },
    { href: "/estoque?oferta=1", label: "Ofertas", icon: BadgePercent },
    { href: "/financiamento", label: "Financiamento", icon: Calculator },
    { href: wa, label: "Falar no WhatsApp", icon: MessageCircle, external: true },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: settings.company_name,
    slogan: settings.slogan,
    url: absoluteUrl("/"),
    logo: settings.logo_url ?? absoluteUrl("/logo.svg"),
    ...(settings.phone || settings.whatsapp ? { telephone: settings.phone ?? settings.whatsapp } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.address ? { address: settings.address } : {}),
    ...(settings.business_hours ? { openingHours: settings.business_hours } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO — layout claro e editorial, com um carro em vitrine ao lado */}
      <section className="relative pb-12 pt-10 sm:pt-14 lg:pb-16">
        <div className="container grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="animate-fade-up">
            <p className="eyebrow">{settings.slogan}</p>
            <h1 className="mt-4 font-display text-[2.6rem] font-bold leading-[1.02] tracking-tight text-ink-950 sm:text-6xl lg:text-7xl">
              {settings.hero_title.split(" ").slice(0, -2).join(" ")}{" "}
              <span className="text-brand-600">{settings.hero_title.split(" ").slice(-2).join(" ")}</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-600">{settings.hero_subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/estoque" className="btn btn-dark">
                Ver estoque <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                <WhatsAppIcon className="h-4 w-4 text-whatsapp" /> Falar com a loja
              </a>
            </div>
          </div>

          {showcase ? (
            <Link
              href={`/veiculos/${showcase.slug}`}
              className="speed-lines group relative block overflow-hidden rounded-[2rem] bg-ink-950 p-3 text-white shadow-card-hover"
            >
              <div className="relative aspect-[16/11] overflow-hidden rounded-[1.5rem]">
                <VehicleImage
                  src={coverImage(showcase)}
                  alt={`${showcase.brand} ${showcase.model}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex items-end justify-between gap-4 px-3 pb-2 pt-4">
                <div className="min-w-0">
                  <p className="text-sm text-ink-400">Em destaque · {showcase.brand}</p>
                  <p className="truncate font-display text-2xl font-bold">{showcase.model} <span className="font-semibold text-ink-400">{showcase.version}</span></p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-2xl font-bold">{formatPrice(showcase.price)}</p>
                  <p className="text-sm text-ink-400">{vehicleYears(showcase)} · {formatKm(showcase.mileage)}</p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="speed-lines relative hidden aspect-[16/11] overflow-hidden rounded-[2rem] bg-ink-950 lg:block">
              <div className="absolute inset-x-10 top-1/2 -translate-y-1/2 opacity-60">
                <CarSwoosh />
              </div>
            </div>
          )}
        </div>

        <div className="container mt-10 lg:mt-14">
          <QuickSearch options={options} />

          <nav aria-label="Atalhos" className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {shortcuts.map(({ href, label, icon: Icon, external }) => {
              const cls =
                "flex shrink-0 items-center gap-2 rounded-full border border-ink-200 bg-white/60 px-4 py-2 text-sm font-medium text-ink-800 transition hover:border-ink-900 hover:bg-white";
              const inner = (
                <>
                  {external ? <WhatsAppIcon className="h-4 w-4 text-whatsapp" /> : <Icon className="h-4 w-4 text-brand-600" />}
                  {label}
                </>
              );
              return external ? (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
              ) : (
                <Link key={label} href={href} className={cls}>{inner}</Link>
              );
            })}
          </nav>
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="container py-14 sm:py-16" aria-labelledby="destaques">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Selecionados para você</p>
            <h2 id="destaques" className="section-title mt-1">Veículos em destaque</h2>
          </div>
          <Link href="/estoque" className="group inline-flex items-center gap-1.5 text-sm font-bold text-ink-900 hover:text-brand-700">
            Ver todo o estoque <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
        {featured.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((v, i) => (
              <VehicleCard key={v.id} vehicle={v} whatsapp={settings.whatsapp} companyName={settings.company_name} priority={i < 2} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-white p-10 text-center text-ink-500 shadow-card">Nenhum veículo cadastrado ainda.</p>
        )}
      </section>

      {/* CARROCERIAS */}
      <section className="bg-white py-14" aria-labelledby="carrocerias">
        <div className="container">
          <p className="eyebrow">Navegue por estilo</p>
          <h2 id="carrocerias" className="section-title mt-1">Qual carroceria combina com você?</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {BODY_TYPES.map((b) => (
              <Link
                key={b}
                href={`/estoque?carroceria=${encodeURIComponent(b)}`}
                className="group flex flex-col items-center gap-3 rounded-3xl border border-ink-200/70 bg-ink-50 px-3 py-6 text-ink-800 transition hover:-translate-y-0.5 hover:border-ink-300 hover:bg-white hover:shadow-card"
              >
                <BodyTypeIcon type={b} className="h-8 w-20 text-ink-800 transition group-hover:text-brand-600" />
                <span className="text-sm font-semibold">{b}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* OFERTAS */}
      {offers.length > 0 && (
        <section className="container py-14 sm:py-16" aria-labelledby="ofertas">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Condições especiais</p>
              <h2 id="ofertas" className="section-title mt-1">Ofertas da semana</h2>
            </div>
            <Link href="/estoque?oferta=1" className="group inline-flex items-center gap-1.5 text-sm font-bold text-ink-900 hover:text-brand-700">
              Todas as ofertas <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {offers.map((v) => (
              <VehicleCard key={v.id} vehicle={v} whatsapp={settings.whatsapp} companyName={settings.company_name} />
            ))}
          </div>
        </section>
      )}

      {/* BANNER FINANCIAMENTO */}
      <section className="container py-6">
        <div className="speed-lines relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-10 text-white sm:px-12 sm:py-14">
          <div className="pointer-events-none absolute -bottom-10 -right-20 w-[560px] opacity-20">
            <CarSwoosh />
          </div>
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="eyebrow text-brand-400">Financiamento</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
                Simule as parcelas do seu <span className="text-brand-500">próximo carro</span>
              </h2>
              <p className="mt-3 max-w-xl text-ink-300">
                Escolha o valor da entrada e o prazo de 12 a 60 meses. Em poucos segundos você tem uma estimativa — e pode solicitar a análise sem sair de casa.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link href="/financiamento" className="btn btn-primary py-4">
                <Calculator className="h-4 w-4" /> Simular agora
              </Link>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp py-4">
                <WhatsAppIcon className="h-4 w-4" /> Tirar dúvidas
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="container py-14" aria-labelledby="como-funciona">
        <p className="eyebrow">Simples assim</p>
        <h2 id="como-funciona" className="section-title mt-1">Comprar seu carro na {settings.company_name}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Search, title: "Encontre", text: "Use a busca e os filtros para achar o veículo ideal entre os disponíveis." },
            { icon: Sparkles, title: "Conheça", text: "Veja fotos, itens e opcionais, quilometragem e todas as informações do anúncio." },
            { icon: Calculator, title: "Simule", text: "Calcule as parcelas e envie sua solicitação de financiamento online." },
            { icon: ShieldCheck, title: "Converse", text: "Fale com a equipe pelo WhatsApp, agende uma visita e feche negócio." },
          ].map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="card relative p-6">
              <span className="absolute right-5 top-4 font-display text-5xl font-extrabold text-ink-100">{i + 1}</span>
              <span className="relative grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="relative mt-4 font-display text-lg font-bold text-ink-950">{title}</h3>
              <p className="relative mt-1 text-sm leading-relaxed text-ink-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <LocationSection settings={settings} />
    </>
  );
}
