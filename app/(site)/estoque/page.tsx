import type { Metadata } from "next";
import { Suspense } from "react";
import { EstoqueView } from "@/components/vehicle/EstoqueView";
import { StaticInventory } from "@/components/vehicle/StaticInventory";
import { DEMO_VEHICLES } from "@/lib/demo-data";
import { IS_STATIC_EXPORT } from "@/lib/paths";
import { getFilterOptions, parseFilters, searchVehicles } from "@/services/vehicles";
import { getStoreSettings } from "@/services/settings";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const s = await getStoreSettings();
  if (IS_STATIC_EXPORT) {
    return { title: "Estoque de veículos", description: `Confira os veículos à venda na ${s.company_name}.` };
  }
  const f = parseFilters(await searchParams);
  const parts = [f.carroceria, f.marca, f.modelo].filter(Boolean).join(" ");
  const title = f.oferta ? "Ofertas de veículos" : parts ? `${parts} à venda` : "Estoque de veículos";
  return {
    title,
    description: `Confira ${parts ? `${parts} ` : "os veículos "}à venda na ${s.company_name}. Filtre por marca, modelo, preço, ano, quilometragem e mais.`,
    alternates: { canonical: "/estoque" },
  };
}

export default async function EstoquePage({ searchParams }: Props) {
  const [settings, options] = await Promise.all([getStoreSettings(), getFilterOptions()]);

  // Versão estática (GitHub Pages): filtros aplicados no navegador
  if (IS_STATIC_EXPORT) {
    return (
      <Suspense>
        <StaticInventory vehicles={DEMO_VEHICLES} options={options} whatsapp={settings.whatsapp} companyName={settings.company_name} />
      </Suspense>
    );
  }

  const params = await searchParams;
  const filters = parseFilters(params);
  const result = await searchVehicles(filters);
  return (
    <EstoqueView filters={filters} result={result} options={options} params={params} whatsapp={settings.whatsapp} companyName={settings.company_name} />
  );
}
