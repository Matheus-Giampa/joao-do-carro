import type { FilterOptions, PaginatedVehicles, SortOption, Vehicle, VehicleFilters } from "@/types";

/** Funções puras de busca/ordenação do estoque (usadas no servidor e na versão estática). */

const STATUS_ORDER = { disponivel: 0, reservado: 1, vendido: 2 } as const;

export function sortVehicles(list: Vehicle[], sort: SortOption = "recentes") {
  return [...list].sort((a, b) => {
    const s = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (s !== 0) return s;
    switch (sort) {
      case "menor-preco":
        return a.price - b.price;
      case "maior-preco":
        return b.price - a.price;
      case "menor-km":
        return a.mileage - b.mileage;
      case "maior-ano":
        return b.year_model - a.year_model || b.year_manufacture - a.year_manufacture;
      default:
        return b.created_at.localeCompare(a.created_at);
    }
  });
}

export function searchWords(q?: string) {
  return (q ?? "")
    .toLowerCase()
    .replace(/[%_,()*\\]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);
}

function eqi(a: string, b: string) {
  return a.localeCompare(b, "pt-BR", { sensitivity: "base" }) === 0;
}

export function filterVehicles(list: Vehicle[], f: VehicleFilters) {
  const words = searchWords(f.q);
  return list.filter((v) => {
    const text = `${v.brand} ${v.model} ${v.version ?? ""} ${v.year_model}`.toLowerCase();
    if (words.some((w) => !text.includes(w))) return false;
    if (f.marca && !eqi(v.brand, f.marca)) return false;
    if (f.modelo && !eqi(v.model, f.modelo)) return false;
    if (f.precoMin != null && v.price < f.precoMin) return false;
    if (f.precoMax != null && v.price > f.precoMax) return false;
    if (f.anoMin != null && v.year_model < f.anoMin) return false;
    if (f.anoMax != null && v.year_model > f.anoMax) return false;
    if (f.kmMax != null && v.mileage > f.kmMax) return false;
    if (f.combustivel && !eqi(v.fuel, f.combustivel)) return false;
    if (f.cambio && !eqi(v.transmission, f.cambio)) return false;
    if (f.carroceria && !eqi(v.body_type, f.carroceria)) return false;
    if (f.oferta && !v.is_offer) return false;
    return true;
  });
}

export function paginate(list: Vehicle[], page: number, pageSize: number): PaginatedVehicles {
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  return {
    vehicles: list.slice((current - 1) * pageSize, current * pageSize),
    total,
    page: current,
    pageSize,
    totalPages,
  };
}

type OptionRow = Pick<Vehicle, "brand" | "model" | "year_model" | "fuel" | "transmission" | "body_type">;

export function buildFilterOptions(rows: OptionRow[]): FilterOptions {
  const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));
  const sortPt = (a: string, b: string) => a.localeCompare(b, "pt-BR");
  const modelsByBrand: Record<string, string[]> = {};
  for (const r of rows) {
    modelsByBrand[r.brand] = uniq([...(modelsByBrand[r.brand] ?? []), r.model]).sort(sortPt);
  }
  return {
    brands: uniq(rows.map((r) => r.brand)).sort(sortPt),
    modelsByBrand,
    years: uniq(rows.map((r) => r.year_model)).sort((a, b) => b - a),
    fuels: uniq(rows.map((r) => r.fuel)).sort(sortPt),
    transmissions: uniq(rows.map((r) => r.transmission)).sort(sortPt),
    bodyTypes: uniq(rows.map((r) => r.body_type)).sort(sortPt),
  };
}

/** Converte os parâmetros da URL em filtros tipados. */
export function parseFilters(params: Record<string, string | string[] | undefined>): VehicleFilters {
  const str = (k: string) => {
    const v = params[k];
    const s = Array.isArray(v) ? v[0] : v;
    return s && s.trim() ? s.trim().slice(0, 80) : undefined;
  };
  const num = (k: string) => {
    const s = str(k);
    if (!s) return undefined;
    const n = Number(s.replace(/\D/g, ""));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  const ordem = str("ordem") as SortOption | undefined;
  return {
    q: str("q"),
    marca: str("marca"),
    modelo: str("modelo"),
    precoMin: num("precoMin"),
    precoMax: num("precoMax"),
    anoMin: num("anoMin") ?? num("ano"),
    anoMax: num("anoMax"),
    kmMax: num("kmMax"),
    combustivel: str("combustivel"),
    cambio: str("cambio"),
    carroceria: str("carroceria"),
    oferta: str("oferta") === "1",
    ordem: ordem && ["recentes", "menor-preco", "maior-preco", "menor-km", "maior-ano"].includes(ordem) ? ordem : "recentes",
    pagina: num("pagina") ?? 1,
  };
}
