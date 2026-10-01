import Link from "next/link";
import { SearchX } from "lucide-react";
import { InventoryShell } from "./InventoryShell";
import { VehicleCard } from "./VehicleCard";
import { Pagination } from "@/components/ui/Pagination";
import type { FilterOptions, PaginatedVehicles, VehicleFilters } from "@/types";

/** Conteúdo da página /estoque (usado na versão com servidor e na versão estática). */
export function EstoqueView({
  filters,
  result,
  options,
  params,
  whatsapp,
  companyName,
}: {
  filters: VehicleFilters;
  result: PaginatedVehicles;
  options: FilterOptions;
  params: Record<string, string | string[] | undefined>;
  whatsapp: string | null;
  companyName: string;
}) {
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
                <VehicleCard key={v.id} vehicle={v} whatsapp={whatsapp} companyName={companyName} priority={i < 3} />
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
