import { VehicleCardSkeleton } from "@/components/vehicle/VehicleCard";

export default function Loading() {
  return (
    <div className="container py-8 sm:py-10" aria-busy="true" aria-label="Carregando veículos">
      <div className="skeleton mb-6 h-10 w-48" />
      <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
        <div className="skeleton hidden h-[640px] rounded-2xl lg:block" />
        <div className="space-y-5">
          <div className="skeleton h-12 rounded-xl" />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
