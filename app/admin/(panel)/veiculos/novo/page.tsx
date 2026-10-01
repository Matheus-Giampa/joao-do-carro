import { AdminHeader } from "@/components/admin/AdminHeader";
import { VehicleForm } from "@/components/admin/VehicleForm";

export const metadata = { title: "Adicionar veículo" };

export default function NewVehiclePage() {
  return (
    <>
      <AdminHeader title="Adicionar veículo" subtitle="Preencha os dados, envie as fotos e publique o anúncio." />
      <VehicleForm />
    </>
  );
}
