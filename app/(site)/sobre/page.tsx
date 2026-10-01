import type { Metadata } from "next";
import Link from "next/link";
import { Award, BookOpen, Gem, HeartHandshake, ShieldCheck, Target } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { LocationSection } from "@/components/site/LocationSection";
import { getStoreSettings } from "@/services/settings";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStoreSettings();
  return {
    title: `Conheça a ${s.company_name}`,
    description: `História, missão e valores da ${s.company_name}. ${s.slogan}`,
    alternates: { canonical: "/sobre" },
  };
}

/** Todos os textos desta página são editáveis em Painel → Configurações → Página Sobre. */
export default async function SobrePage() {
  const s = await getStoreSettings();
  const values = (s.about_values ?? "").split("\n").map((v) => v.trim()).filter(Boolean);

  const blocks = [
    { icon: Award, title: "Experiência", text: s.about_experience },
    { icon: ShieldCheck, title: "Qualidade dos veículos", text: s.about_quality },
    { icon: HeartHandshake, title: "Atendimento", text: s.about_service },
  ].filter((b) => b.text);

  return (
    <>
      <PageHero eyebrow="Quem somos" title={`Conheça a ${s.company_name}`} subtitle={s.slogan} />

      <div className="container -mt-10 space-y-6">
        {s.about_history && (
          <section className="card p-6 sm:p-10">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white"><BookOpen className="h-5 w-5" /></span>
              <h2 className="font-display text-2xl font-bold text-ink-950">Nossa história</h2>
            </div>
            <p className="prose-text mt-5 max-w-3xl text-lg">{s.about_history}</p>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {s.about_mission && (
            <section className="card bg-ink-950 p-6 text-white sm:p-8">
              <Target className="h-7 w-7 text-brand-500" />
              <h2 className="mt-4 font-display text-xl font-bold">Missão</h2>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-ink-300">{s.about_mission}</p>
            </section>
          )}
          {values.length > 0 && (
            <section className="card p-6 sm:p-8">
              <Gem className="h-7 w-7 text-brand-600" />
              <h2 className="mt-4 font-display text-xl font-bold text-ink-950">Valores</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {values.map((v) => (
                  <li key={v} className="flex items-center gap-2 font-medium text-ink-800">
                    <span className="h-2 w-2 rounded-full bg-brand-600" /> {v}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {blocks.length > 0 && (
          <div className="grid gap-6 md:grid-cols-3">
            {blocks.map(({ icon: Icon, title, text }) => (
              <section key={title} className="card p-6">
                <Icon className="h-7 w-7 text-brand-600" />
                <h2 className="mt-4 font-display text-lg font-bold text-ink-950">{title}</h2>
                <p className="prose-text mt-2 text-sm">{text}</p>
              </section>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-card sm:p-12">
          <h2 className="section-title">Pronto para encontrar seu próximo carro?</h2>
          <Link href="/estoque" className="btn btn-primary">Ver estoque</Link>
        </div>
      </div>

      <LocationSection settings={s} />
    </>
  );
}
