import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";
import { getAllVehicleSlugs } from "@/services/vehicles";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await getAllVehicleSlugs();
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/estoque"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/financiamento"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/sobre"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contato"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
  return [
    ...pages,
    ...vehicles.map((v) => ({
      url: absoluteUrl(`/veiculos/${v.slug}`),
      lastModified: new Date(v.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
