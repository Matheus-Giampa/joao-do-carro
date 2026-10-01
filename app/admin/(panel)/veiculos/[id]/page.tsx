import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { requireStaff } from "@/services/auth";
import { VEHICLE_SELECT, normalizeVehicle } from "@/services/vehicles";

export const metadata = { title: "Editar veículo" };

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("vehicles").select(VEHICLE_SELECT).eq("id", id).maybeSingle();
  if (!data) notFound();
  const vehicle = normalizeVehicle(data);

  return (
    <>
      <AdminHeader
        title={`${vehicle.brand} ${vehicle.model}`}
        subtitle={`Editando anúncio · /veiculos/${vehicle.slug}`}
        actions={
          <Link href={`/veiculos/${vehicle.slug}`} target="_blank" className="btn btn-outline btn-sm">
            <ExternalLink className="h-4 w-4" /> Ver anúncio
          </Link>
        }
      />
      <VehicleForm vehicle={vehicle} />
    </>
  );
}
