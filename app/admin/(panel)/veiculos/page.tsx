import Link from "next/link";
import { CheckCircle2, Pencil, PlusCircle, Search } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { VehicleRowActions, QuickPrice } from "@/components/admin/VehicleRowActions";
import { VehicleImage } from "@/components/vehicle/VehicleImage";
import { requireStaff } from "@/services/auth";
import { VEHICLE_SELECT, normalizeVehicle } from "@/services/vehicles";
import { VEHICLE_STATUS_LABEL } from "@/lib/constants";
import { cn, coverImage, formatKm, vehicleYears } from "@/lib/utils";

export const metadata = { title: "Veículos" };

const STATUS_TONE = {
  disponivel: "bg-emerald-100 text-emerald-800",
  reservado: "bg-amber-100 text-amber-800",
  vendido: "bg-ink-200 text-ink-700",
};

export default async function AdminVehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; destaque?: string; salvo?: string }>;
}) {
  const { q, status, destaque, salvo } = await searchParams;
  const { supabase } = await requireStaff();

  let query = supabase.from("vehicles").select(VEHICLE_SELECT).order("created_at", { ascending: false });
  if (status && ["disponivel", "reservado", "vendido"].includes(status)) query = query.eq("status", status);
  if (destaque === "1") query = query.eq("featured", true);
  if (status === "oculto") query = query.eq("published", false);
  for (const w of (q ?? "").toLowerCase().replace(/[%_,()*\\]/g, " ").split(/\s+/).filter(Boolean).slice(0, 5)) {
    query = query.ilike("search_text", `%${w}%`);
  }
  const { data, error } = await query;
  const vehicles = (data ?? []).map(normalizeVehicle);

  const tabs = [
    { label: "Todos", value: undefined },
    { label: "Disponíveis", value: "disponivel" },
    { label: "Reservados", value: "reservado" },
    { label: "Vendidos", value: "vendido" },
    { label: "Ocultos", value: "oculto" },
  ];

  return (
    <>
      <AdminHeader
        title="Veículos"
        subtitle={`${vehicles.length} veículo(s)`}
        actions={
          <Link href="/admin/veiculos/novo" className="btn btn-primary">
            <PlusCircle className="h-4 w-4" /> Adicionar veículo
          </Link>
        }
      />

      {salvo && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> Veículo cadastrado com sucesso!
        </p>
      )}
      {error && <p className="mb-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">{error.message}</p>}

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-card">
          {tabs.map((t) => (
            <Link
              key={t.label}
              href={t.value ? `/admin/veiculos?status=${t.value}` : "/admin/veiculos"}
              className={cn(
                "whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition",
                status === t.value || (!status && !t.value && !destaque) ? "bg-ink-950 text-white" : "text-ink-600 hover:bg-ink-50",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <form className="relative lg:w-80">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input name="q" defaultValue={q} placeholder="Buscar marca, modelo, versão..." className="input pl-10" />
        </form>
      </div>

      {vehicles.length === 0 ? (
        <div className="card p-12 text-center text-ink-500">
          Nenhum veículo encontrado.{" "}
          <Link href="/admin/veiculos/novo" className="font-bold text-brand-700">Cadastrar agora</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map((v) => (
            <div key={v.id} className={cn("card flex flex-col gap-4 p-3 sm:flex-row sm:items-center sm:p-4", !v.published && "opacity-70")}>
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl bg-ink-100 sm:w-32">
                  <VehicleImage src={coverImage(v)} alt="" fill sizes="128px" className="object-cover" />
                  {v.is_demo && <span className="absolute left-1 top-1 rounded bg-ink-950/80 px-1.5 py-0.5 text-[10px] font-bold text-white">DEMO</span>}
                </div>
                <div className="min-w-0">
                  <Link href={`/admin/veiculos/${v.id}`} className="font-display text-lg font-bold leading-tight text-ink-950 hover:text-brand-700">
                    {v.brand} {v.model}
                  </Link>
                  <p className="truncate text-sm text-ink-500">{v.version}</p>
                  <p className="mt-1 text-xs text-ink-500">{vehicleYears(v)} · {formatKm(v.mileage)} · {v.images.length} foto(s)</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-bold", STATUS_TONE[v.status])}>{VEHICLE_STATUS_LABEL[v.status]}</span>
                    {v.featured && <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">Destaque</span>}
                    {v.is_offer && <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-800">Oferta</span>}
                    {!v.published && <span className="rounded-md bg-ink-950 px-2 py-0.5 text-[11px] font-bold text-white">Oculto</span>}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <QuickPrice id={v.id} price={v.price} />
                <VehicleRowActions vehicle={{ id: v.id, slug: v.slug, status: v.status, featured: v.featured, published: v.published, label: `${v.brand} ${v.model}` }} />
                <Link href={`/admin/veiculos/${v.id}`} className="btn btn-dark btn-sm">
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
