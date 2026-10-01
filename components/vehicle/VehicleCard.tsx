import Link from "next/link";
import { ArrowUpRight, Calendar, Fuel, Gauge, Settings2 } from "lucide-react";
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
    <article className="group relative flex flex-col rounded-3xl border border-ink-200/60 bg-white p-2 shadow-card transition duration-300 hover:shadow-card-hover">
      <Link href={href} className="relative block aspect-[16/11] overflow-hidden rounded-[20px] bg-ink-100" aria-label={`Ver detalhes do ${v.brand} ${v.model}`}>
        <VehicleImage
          src={coverImage(v)}
          alt={`${v.brand} ${v.model} ${v.version ?? ""} ${v.year_model}`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={cn("object-cover transition duration-700 group-hover:scale-[1.03]", sold && "grayscale")}
        />
        <VehicleBadges vehicle={v} className="absolute left-3 top-3" />
        {sold && (
          <div className="absolute inset-0 grid place-items-center bg-ink-950/45">
            <span className="-rotate-6 rounded-full border-2 border-white px-5 py-1.5 font-display text-2xl font-bold text-white">
              Vendido
            </span>
          </div>
        )}
        {v.images.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-ink-950/70 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur">
            {v.images.length} fotos
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
        <Link href={href} className="block">
          <p className="text-[13px] font-medium text-ink-500">{v.brand}</p>
          <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-ink-950">
            {v.model} <span className="font-semibold text-ink-500">{v.version}</span>
          </h3>
        </Link>

        <dl className="mt-3 flex flex-wrap gap-1.5 text-xs font-medium text-ink-700">
          {[
            { icon: Calendar, label: "Ano", value: vehicleYears(v) },
            { icon: Gauge, label: "Quilometragem", value: formatKm(v.mileage) },
            { icon: Settings2, label: "Câmbio", value: v.transmission },
            { icon: Fuel, label: "Combustível", value: v.fuel },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1">
              <Icon className="h-3 w-3 text-ink-500" />
              <dt className="sr-only">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            {v.previous_price && v.previous_price > v.price && !sold && (
              <p className="text-xs text-ink-400 line-through">{formatPrice(v.previous_price)}</p>
            )}
            <p className={cn("font-display text-2xl font-bold tracking-tight", sold ? "text-ink-400" : "text-ink-950")}>{formatPrice(v.price)}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <a
              href={whatsappLink(whatsapp, vehicleInterestMessage(v, companyName))}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-11 w-11 place-items-center rounded-full border border-ink-200 text-ink-700 transition hover:border-whatsapp hover:bg-whatsapp hover:text-white"
              aria-label={sold ? `Pedir um similar ao ${v.brand} ${v.model} pelo WhatsApp` : `Tenho interesse no ${v.brand} ${v.model} (WhatsApp)`}
              title={sold ? "Ver similar" : "Tenho interesse"}
            >
              <WhatsAppIcon className="h-[18px] w-[18px]" />
            </a>
            <Link
              href={href}
              className="grid h-11 w-11 place-items-center rounded-full bg-ink-950 text-white transition group-hover:bg-brand-600"
              aria-label={`Ver detalhes do ${v.brand} ${v.model}`}
              title="Ver detalhes"
            >
              <ArrowUpRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function VehicleCardSkeleton() {
  return (
    <div className="rounded-3xl border border-ink-200/60 bg-white p-2">
      <div className="skeleton aspect-[16/11] rounded-[20px]" />
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
