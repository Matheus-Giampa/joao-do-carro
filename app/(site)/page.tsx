import Link from "next/link";
import { ArrowRight, BadgePercent, Calculator, Car, MessageCircle, Search, ShieldCheck, Sparkles, Warehouse } from "lucide-react";
import { QuickSearch } from "@/components/site/QuickSearch";
import { LocationSection } from "@/components/site/LocationSection";
import { CarSwoosh } from "@/components/brand/Logo";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { BodyTypeIcon } from "@/components/vehicle/BodyTypeIcon";
import { WhatsAppIcon } from "@/components/site/icons";
import { BODY_TYPES } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";
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

      {/* HERO */}
      <section className="speed-lines relative overflow-hidden overflow-x-clip bg-ink-950 pb-10 pt-12 text-white sm:pt-16 lg:pb-16 lg:pt-20">
        <div className="pointer-events-none absolute -right-40 top-6 w-[900px] max-w-none opacity-[0.13] sm:-right-24 lg:right-[-60px] lg:top-0 lg:opacity-25">
          <CarSwoosh />
        </div>
        <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="container relative">
          <div className="max-w-2xl animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-ink-200">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> {settings.slogan}
            </p>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              {settings.hero_title.split(" ").slice(0, -2).join(" ")}{" "}
              <span className="text-brand-500">{settings.hero_title.split(" ").slice(-2).join(" ")}</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-ink-300">{settings.hero_subtitle}</p>
          </div>

          <div className="mt-8 lg:mt-12">
            <QuickSearch options={options} />
          </div>

          <nav aria-label="Atalhos" className="no-scrollbar -mx-4 mt-6 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-5 sm:px-0">
            {shortcuts.map(({ href, label, icon: Icon, external }) => {
              const cls =
                "group flex min-w-[140px] items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white transition hover:border-brand-500 hover:bg-white/10";
              const inner = (
                <>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 transition group-hover:scale-110">
                    {external ? <WhatsAppIcon className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
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
                className="group flex flex-col items-center gap-3 rounded-2xl border border-ink-100 bg-ink-50 px-3 py-5 text-ink-800 transition hover:-translate-y-0.5 hover:border-ink-950 hover:bg-ink-950 hover:text-white"
              >
                <BodyTypeIcon type={b} className="h-8 w-20 text-ink-900 transition group-hover:text-brand-500" />
                <span className="text-sm font-bold">{b}</span>
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
              <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-ink-950 text-white">
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
