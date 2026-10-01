import Link from "next/link";
import { Calendar, Fuel, Gauge, Settings2 } from "lucide-react";
import { VehicleImage } from "./VehicleImage";
import { VehicleBadges } from "./VehicleBadges";
import { WhatsAppIcon } from "@/components/site/icons";
import { cn, coverImage, formatKm, formatPrice, vehicleYears } from "@/lib/utils";
import { vehicleInterestMessage, whatsappLink } from "@/lib/whatsapp";
import type { Vehicle } from "@/types";

export function VehicleCard({
  vehicle: v,
  whatsapp,
  companyName,
  priority = false,
}: {
  vehicle: Vehicle;
  whatsapp: string | null;
  companyName: string;
  priority?: boolean;
}) {
  const href = `/veiculos/${v.slug}`;
  const sold = v.status === "vendido";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-ink-100" aria-label={`Ver detalhes do ${v.brand} ${v.model}`}>
        <VehicleImage
          src={coverImage(v)}
          alt={`${v.brand} ${v.model} ${v.version ?? ""} ${v.year_model}`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={cn("object-cover transition duration-500 group-hover:scale-105", sold && "grayscale")}
        />
        <VehicleBadges vehicle={v} className="absolute left-3 top-3" />
        {sold && (
          <div className="absolute inset-0 grid place-items-center bg-ink-950/45">
            <span className="-rotate-6 rounded-lg border-2 border-white px-5 py-1.5 font-display text-2xl font-extrabold uppercase tracking-widest text-white">
              Vendido
            </span>
          </div>
        )}
        {v.images.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-md bg-ink-950/70 px-2 py-0.5 text-[11px] font-semibold text-white">
            {v.images.length} fotos
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link href={href} className="block">
          <h3 className="font-display text-lg font-bold uppercase leading-tight text-ink-950 transition group-hover:text-brand-700">
            {v.brand} <span className="text-brand-600">{v.model}</span>
          </h3>
          <p className="mt-0.5 line-clamp-1 text-sm text-ink-500">{v.version}</p>
        </Link>

        <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[13px] text-ink-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-ink-400" />
            <dt className="sr-only">Ano</dt>
            <dd>{vehicleYears(v)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-ink-400" />
            <dt className="sr-only">Quilometragem</dt>
            <dd>{formatKm(v.mileage)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Settings2 className="h-3.5 w-3.5 text-ink-400" />
            <dt className="sr-only">Câmbio</dt>
            <dd>{v.transmission}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel className="h-3.5 w-3.5 text-ink-400" />
            <dt className="sr-only">Combustível</dt>
            <dd>{v.fuel}</dd>
          </div>
        </dl>

        <div className="mt-4 border-t border-ink-100 pt-4">
          {v.previous_price && v.previous_price > v.price && !sold && (
            <p className="text-xs text-ink-400 line-through">{formatPrice(v.previous_price)}</p>
          )}
          <p className={cn("font-display text-2xl font-extrabold", sold ? "text-ink-400" : "text-ink-950")}>{formatPrice(v.price)}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href={href} className="btn btn-outline btn-sm whitespace-nowrap px-2 py-2.5 text-[11px]">
            Ver detalhes
          </Link>
          <a
            href={whatsappLink(whatsapp, vehicleInterestMessage(v, companyName))}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("btn btn-sm gap-1.5 whitespace-nowrap px-2 py-2.5 text-[11px]", sold ? "btn-dark" : "btn-primary")}
          >
            <WhatsAppIcon className="hidden h-3.5 w-3.5 shrink-0 sm:max-lg:block 2xl:block" />
            {sold ? "Ver similar" : "Tenho interesse"}
          </a>
        </div>
      </div>
    </article>
  );
}

export function VehicleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
      <div className="skeleton aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-5 w-2/3" />
        <div className="skeleton h-4 w-1/2" />
        <div className="grid grid-cols-2 gap-2">
          <div className="skeleton h-4" />
          <div className="skeleton h-4" />
          <div className="skeleton h-4" />
          <div className="skeleton h-4" />
        </div>
        <div className="skeleton h-7 w-1/2" />
        <div className="grid grid-cols-2 gap-2">
          <div className="skeleton h-9" />
          <div className="skeleton h-9" />
        </div>
      </div>
    </div>
  );
}
