import "server-only";
import { cache } from "react";
import { PAGE_SIZE } from "@/lib/constants";
import { DEMO_VEHICLES } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";
import type { FilterOptions, PaginatedVehicles, SortOption, Vehicle, VehicleFilters } from "@/types";

export const VEHICLE_SELECT = "*, images:vehicle_images(id, vehicle_id, url, storage_path, position)";

/** Normaliza o registro vindo do banco (números, ordem das fotos). */
export function normalizeVehicle(row: Record<string, unknown>): Vehicle {
  const v = row as unknown as Vehicle;
  return {
    ...v,
    price: Number(v.price),
    previous_price: v.previous_price != null ? Number(v.previous_price) : null,
    options: v.options ?? [],
    images: [...(v.images ?? [])].sort((a, b) => a.position - b.position),
  };
}

const STATUS_ORDER = { disponivel: 0, reservado: 1, vendido: 2 } as const;

function sortVehicles(list: Vehicle[], sort: SortOption = "recentes") {
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

function searchWords(q?: string) {
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

function filterInMemory(list: Vehicle[], f: VehicleFilters) {
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

function paginate(list: Vehicle[], page: number, pageSize: number): PaginatedVehicles {
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

/** Busca paginada do estoque com filtros e ordenação. */
export async function searchVehicles(filters: VehicleFilters, pageSize = PAGE_SIZE): Promise<PaginatedVehicles> {
  const page = Math.max(1, filters.pagina ?? 1);

  if (!isSupabaseConfigured) {
    return paginate(sortVehicles(filterInMemory(DEMO_VEHICLES, filters), filters.ordem), page, pageSize);
  }

  const supabase = createPublicClient();
  let query = supabase.from("vehicles").select(VEHICLE_SELECT, { count: "exact" }).eq("published", true);

  for (const w of searchWords(filters.q)) query = query.ilike("search_text", `%${w}%`);
  if (filters.marca) query = query.ilike("brand", filters.marca);
  if (filters.modelo) query = query.ilike("model", filters.modelo);
  if (filters.precoMin != null) query = query.gte("price", filters.precoMin);
  if (filters.precoMax != null) query = query.lte("price", filters.precoMax);
  if (filters.anoMin != null) query = query.gte("year_model", filters.anoMin);
  if (filters.anoMax != null) query = query.lte("year_model", filters.anoMax);
  if (filters.kmMax != null) query = query.lte("mileage", filters.kmMax);
  if (filters.combustivel) query = query.ilike("fuel", filters.combustivel);
  if (filters.cambio) query = query.ilike("transmission", filters.cambio);
  if (filters.carroceria) query = query.ilike("body_type", filters.carroceria);
  if (filters.oferta) query = query.eq("is_offer", true);

  // Disponíveis primeiro, depois reservados e vendidos ('disponivel' < 'reservado' < 'vendido')
  query = query.order("status", { ascending: true });
  switch (filters.ordem) {
    case "menor-preco":
      query = query.order("price", { ascending: true });
      break;
    case "maior-preco":
      query = query.order("price", { ascending: false });
      break;
    case "menor-km":
      query = query.order("mileage", { ascending: true });
      break;
    case "maior-ano":
      query = query.order("year_model", { ascending: false }).order("year_manufacture", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * pageSize;
  const { data, count, error } = await query.range(from, from + pageSize - 1);
  if (error) {
    console.error("[searchVehicles]", error.message);
    return { vehicles: [], total: 0, page, pageSize, totalPages: 1 };
  }
  const total = count ?? 0;
  return {
    vehicles: (data ?? []).map(normalizeVehicle),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Opções de filtros com base no estoque publicado (marcas, modelos, anos...). */
export const getFilterOptions = cache(async (): Promise<FilterOptions> => {
  type Row = Pick<Vehicle, "brand" | "model" | "year_model" | "fuel" | "transmission" | "body_type">;
  let rows: Row[] = DEMO_VEHICLES;

  if (isSupabaseConfigured) {
    const { data, error } = await createPublicClient()
      .from("vehicles")
      .select("brand, model, year_model, fuel, transmission, body_type")
      .eq("published", true);
    if (error) console.error("[getFilterOptions]", error.message);
    rows = (data as Row[] | null) ?? [];
  }

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
});

export const getVehicleBySlug = cache(async (slug: string): Promise<Vehicle | null> => {
  if (!isSupabaseConfigured) return DEMO_VEHICLES.find((v) => v.slug === slug) ?? null;
  const { data, error } = await createPublicClient()
    .from("vehicles")
    .select(VEHICLE_SELECT)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) console.error("[getVehicleBySlug]", error.message);
  return data ? normalizeVehicle(data) : null;
});

/** Destaques da home. Se houver poucos marcados, completa com os mais recentes. */
export async function getFeaturedVehicles(limit = 8): Promise<Vehicle[]> {
  let list: Vehicle[];
  if (!isSupabaseConfigured) {
    list = DEMO_VEHICLES;
  } else {
    const { data, error } = await createPublicClient()
      .from("vehicles")
      .select(VEHICLE_SELECT)
      .eq("published", true)
      .neq("status", "vendido")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) console.error("[getFeaturedVehicles]", error.message);
    return (data ?? []).map(normalizeVehicle);
  }
  return sortVehicles(list.filter((v) => v.status !== "vendido"))
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, limit);
}

export async function getOfferVehicles(limit = 4): Promise<Vehicle[]> {
  const result = await searchVehicles({ oferta: true }, limit);
  return result.vehicles.filter((v) => v.status !== "vendido");
}

export async function getSimilarVehicles(vehicle: Vehicle, limit = 4): Promise<Vehicle[]> {
  if (!isSupabaseConfigured) {
    return DEMO_VEHICLES.filter(
      (v) => v.id !== vehicle.id && v.status !== "vendido" && (v.body_type === vehicle.body_type || v.brand === vehicle.brand),
    ).slice(0, limit);
  }
  const { data, error } = await createPublicClient()
    .from("vehicles")
    .select(VEHICLE_SELECT)
    .eq("published", true)
    .neq("status", "vendido")
    .neq("id", vehicle.id)
    .or(`body_type.eq.${JSON.stringify(vehicle.body_type)},brand.eq.${JSON.stringify(vehicle.brand)}`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) console.error("[getSimilarVehicles]", error.message);
  return (data ?? []).map(normalizeVehicle);
}

/** Lista leve para sitemap. */
export async function getAllVehicleSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  if (!isSupabaseConfigured) return DEMO_VEHICLES.map(({ slug, updated_at }) => ({ slug, updated_at }));
  const { data } = await createPublicClient().from("vehicles").select("slug, updated_at").eq("published", true);
  return data ?? [];
}

/** Converte os searchParams da URL em filtros tipados. */
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
