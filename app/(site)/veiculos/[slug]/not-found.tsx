import Link from "next/link";
import { CarFront } from "lucide-react";

export default function VehicleNotFound() {
  return (
    <div className="container flex flex-col items-center py-24 text-center">
      <CarFront className="h-14 w-14 text-ink-300" />
      <h1 className="mt-4 font-display text-3xl font-extrabold text-ink-950">Veículo não encontrado</h1>
      <p className="mt-2 max-w-md text-ink-500">Este anúncio pode ter sido removido ou o endereço está incorreto. Confira outros veículos disponíveis.</p>
      <Link href="/estoque" className="btn btn-primary mt-8">Ver estoque</Link>
    </div>
  );
}
