import type { Vehicle } from "@/types";
import { cn } from "@/lib/utils";

type Badge = { label: string; className: string };

export function getVehicleBadges(v: Pick<Vehicle, "status" | "is_offer" | "featured" | "is_new_arrival">): Badge[] {
  const badges: Badge[] = [];
  if (v.status === "vendido") badges.push({ label: "Vendido", className: "bg-ink-950 text-white" });
  if (v.status === "reservado") badges.push({ label: "Reservado", className: "bg-amber-500 text-ink-950" });
  if (v.is_offer && v.status !== "vendido") badges.push({ label: "Oferta", className: "bg-brand-600 text-white" });
  if (v.featured && v.status !== "vendido") badges.push({ label: "Destaque", className: "bg-white text-ink-950" });
  if (v.is_new_arrival && v.status !== "vendido") badges.push({ label: "Recém-chegado", className: "bg-emerald-600 text-white" });
  return badges;
}

export function VehicleBadges({ vehicle, className }: { vehicle: Vehicle; className?: string }) {
  const badges = getVehicleBadges(vehicle);
  if (!badges.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {badges.map((b) => (
        <span key={b.label} className={cn("rounded-md px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider shadow-sm", b.className)}>
          {b.label}
        </span>
      ))}
    </div>
  );
}
