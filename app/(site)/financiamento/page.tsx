import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { FinanceSimulator } from "@/components/finance/FinanceSimulator";
import { PageHero } from "@/components/site/PageHero";
import { getStoreSettings } from "@/services/settings";
import { whatsappLink } from "@/lib/whatsapp";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStoreSettings();
  return {
    title: "Simule seu financiamento",
    description: `Simule as parcelas do financiamento do seu veículo na ${s.company_name}: escolha entrada e prazo de 12 a 60 meses.`,
    alternates: { canonical: "/financiamento" },
  };
}

export default async function FinanciamentoPage() {
  const s = await getStoreSettings();
  const wa = whatsappLink(s.whatsapp, `Olá! Vim pelo site da ${s.company_name} e gostaria de informações sobre financiamento.`);
  return (
    <>
      <PageHero eyebrow="Financiamento" title="Simule seu financiamento" subtitle="Defina o valor do veículo, a entrada e o número de parcelas. Depois é só solicitar a análise." />
      <div className="container pt-10 space-y-12 pb-8">
        <FinanceSimulator monthlyRate={s.finance_monthly_rate} whatsappHref={wa} initialValue={90000} />
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Escolha o veículo", "Encontre o carro no estoque e use o simulador na própria página do anúncio."],
            ["Envie seus dados", "Solicite o financiamento online. Seus dados são usados apenas para a análise."],
            ["Receba a resposta", "Nossa equipe retorna com as condições aprovadas pelas instituições financeiras."],
          ].map(([t, d]) => (
            <div key={t} className="card p-6">
              <CheckCircle2 className="h-6 w-6 text-brand-600" />
              <h2 className="mt-3 font-display text-lg font-bold text-ink-950">{t}</h2>
              <p className="mt-1 text-sm text-ink-600">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
