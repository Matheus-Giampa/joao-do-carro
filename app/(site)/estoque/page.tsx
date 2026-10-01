import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { InventoryShell } from "@/components/vehicle/InventoryShell";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { Pagination } from "@/components/ui/Pagination";
import { getFilterOptions, parseFilters, searchVehicles } from "@/services/vehicles";
import { getStoreSettings } from "@/services/settings";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const f = parseFilters(await searchParams);
  const s = await getStoreSettings();
  const parts = [f.carroceria, f.marca, f.modelo].filter(Boolean).join(" ");
  const title = f.oferta ? "Ofertas de veículos" : parts ? `${parts} à venda` : "Estoque de veículos";
  return {
    title,
    description: `Confira ${parts ? `${parts} ` : "os veículos "}à venda na ${s.company_name}. Filtre por marca, modelo, preço, ano, quilometragem e mais.`,
    alternates: { canonical: "/estoque" },
  };
}

export default async function EstoquePage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const [settings, options, result] = await Promise.all([getStoreSettings(), getFilterOptions(), searchVehicles(filters)]);

  return (
    <div className="container py-8 sm:py-10">
      <nav className="mb-3 text-xs text-ink-500" aria-label="Trilha">
        <Link href="/" className="hover:text-ink-900">Início</Link> <span className="mx-1">/</span>{" "}
        <span className="text-ink-900">{filters.oferta ? "Ofertas" : "Estoque"}</span>
      </nav>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-display text-3xl font-extrabold text-ink-950 sm:text-4xl">
          {filters.oferta ? "Ofertas" : "Estoque"}
          {filters.carroceria && <span className="text-brand-600"> · {filters.carroceria}</span>}
        </h1>
        <p className="text-sm font-medium text-ink-500">
          <strong className="text-ink-950">{result.total}</strong> {result.total === 1 ? "veículo encontrado" : "veículos encontrados"}
        </p>
      </div>

      <InventoryShell options={options} total={result.total}>
        {result.vehicles.length ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {result.vehicles.map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} whatsapp={settings.whatsapp} companyName={settings.company_name} priority={i < 3} />
              ))}
            </div>
            <Pagination page={result.page} totalPages={result.totalPages} basePath="/estoque" params={params} />
          </>
        ) : (
          <div className="card flex flex-col items-center px-6 py-16 text-center">
            <SearchX className="h-12 w-12 text-ink-300" />
            <h2 className="mt-4 font-display text-xl font-bold text-ink-950">Nenhum veículo encontrado</h2>
            <p className="mt-1 max-w-sm text-sm text-ink-500">Tente remover alguns filtros ou buscar por outro termo. Também podemos procurar o carro para você pelo WhatsApp.</p>
            <Link href="/estoque" className="btn btn-dark mt-6">Ver todo o estoque</Link>
          </div>
        )}
      </InventoryShell>
    </div>
  );
}
