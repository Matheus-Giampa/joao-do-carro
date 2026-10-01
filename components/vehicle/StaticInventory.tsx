"use client";

import { useSearchParams } from "next/navigation";
import { EstoqueView } from "./EstoqueView";
import { filterVehicles, paginate, parseFilters, sortVehicles } from "@/lib/inventory";
import { PAGE_SIZE } from "@/lib/constants";
import type { FilterOptions, Vehicle } from "@/types";

/** Estoque filtrado no navegador — usado na versão estática (GitHub Pages). */
export function StaticInventory({
  vehicles,
  options,
  whatsapp,
  companyName,
}: {
  vehicles: Vehicle[];
  options: FilterOptions;
  whatsapp: string | null;
  companyName: string;
}) {
  const sp = useSearchParams();
  const params = Object.fromEntries(sp.entries());
  const filters = parseFilters(params);
  const result = paginate(sortVehicles(filterVehicles(vehicles, filters), filters.ordem), filters.pagina ?? 1, PAGE_SIZE);
  return <EstoqueView filters={filters} result={result} options={options} params={params} whatsapp={whatsapp} companyName={companyName} />;
}
