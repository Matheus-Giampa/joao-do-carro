import demo from "@/data/demo-vehicles.json";
import type { Vehicle } from "@/types";

/**
 * Veículos FICTÍCIOS usados no modo demonstração (quando o Supabase
 * ainda não foi configurado). Os mesmos dados estão em supabase/seed.sql.
 */
const base = Date.UTC(2026, 0, 1);

export const DEMO_VEHICLES: Vehicle[] = demo.map((v, index) => {
  const id = `demo-${index + 1}`;
  const createdAt = new Date(base + (demo.length - index) * 86_400_000).toISOString();
  return {
    id,
    slug: v.slug,
    brand: v.brand,
    model: v.model,
    version: v.version,
    year_manufacture: v.year_manufacture,
    year_model: v.year_model,
    price: v.price,
    previous_price: v.previous_price,
    mileage: v.mileage,
    fuel: v.fuel,
    transmission: v.transmission,
    body_type: v.body_type,
    color: v.color,
    doors: v.doors,
    plate_end: v.plate_end,
    description: v.description,
    options: v.options,
    status: v.status as Vehicle["status"],
    featured: v.featured,
    is_offer: v.is_offer,
    is_new_arrival: v.is_new_arrival,
    published: true,
    is_demo: true,
    created_at: createdAt,
    updated_at: createdAt,
    // Fotos reais com licença livre (Wikimedia Commons), com crédito do autor
    images: v.photos.map((photo, position) => ({
      id: `${id}-img-${position + 1}`,
      vehicle_id: id,
      url: photo.file,
      storage_path: null,
      position,
      credit: { author: photo.author, license: photo.license, source: photo.source },
    })),
  };
});
