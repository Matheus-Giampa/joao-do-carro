import type { Vehicle } from "@/types";

/** Usado no servidor (services/vehicles) e no navegador (página de favoritos). */
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
