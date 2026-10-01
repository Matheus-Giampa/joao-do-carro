import "server-only";
import { cache } from "react";
import { PAGE_SIZE } from "@/lib/constants";
import { DEMO_VEHICLES } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";
import { buildFilterOptions, filterVehicles, paginate, searchWords as searchWordsOf, sortVehicles } from "@/lib/inventory";
import type { FilterOptions, PaginatedVehicles, Vehicle, VehicleFilters } from "@/types";

export { parseFilters } from "@/lib/inventory";

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

/** Busca paginada do estoque com filtros e ordenação. */
export async function searchVehicles(filters: VehicleFilters, pageSize = PAGE_SIZE): Promise<PaginatedVehicles> {
  const page = Math.max(1, filters.pagina ?? 1);

  if (!isSupabaseConfigured) {
    return paginate(sortVehicles(filterVehicles(DEMO_VEHICLES, filters), filters.ordem), page, pageSize);
  }

  const supabase = createPublicClient();
  let query = supabase.from("vehicles").select(VEHICLE_SELECT, { count: "exact" }).eq("published", true);

  for (const w of searchWordsOf(filters.q)) query = query.ilike("search_text", `%${w}%`);
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

  return buildFilterOptions(rows);
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

