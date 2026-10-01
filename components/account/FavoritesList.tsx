"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useAccount } from "./AccountProvider";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { DEMO_VEHICLES } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { VEHICLE_SELECT, normalizeVehicle } from "@/lib/vehicle-row";
import type { Vehicle } from "@/types";

export function FavoritesList({ whatsapp, companyName }: { whatsapp: string | null; companyName: string }) {
  const { ready, user, favorites } = useAccount();
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const ids = [...favorites];
  const key = ids.sort().join(",");

  useEffect(() => {
    if (!ready) return;
    if (!ids.length) return setVehicles([]);
    if (!isSupabaseConfigured) return setVehicles(DEMO_VEHICLES.filter((v) => favorites.has(v.id)));
    if (!user) return setVehicles([]);
    createSupabaseBrowserClient()
      .from("vehicles")
      .select(VEHICLE_SELECT)
      .in("id", ids)
      .then(({ data }) => setVehicles((data ?? []).map(normalizeVehicle)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user, key]);

  if (!ready || vehicles === null) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
      </div>
    );
  }

  if (isSupabaseConfigured && !user) {
    return (
      <div className="card flex flex-col items-center px-6 py-16 text-center">
        <Heart className="h-12 w-12 text-brand-600" />
        <h2 className="mt-4 font-display text-xl font-bold text-ink-950">Entre para ver seus favoritos</h2>
        <p className="mt-1 max-w-sm text-sm text-ink-500">Crie uma conta grátis e salve os carros que você gostou para ver depois, em qualquer aparelho.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/entrar?next=/favoritos" className="btn btn-dark">Entrar</Link>
          <Link href="/entrar?modo=criar&next=/favoritos" className="btn btn-outline">Criar conta</Link>
        </div>
      </div>
    );
  }

  // Ao tirar o coração, o carro some da lista na hora
  const list = vehicles.filter((v) => favorites.has(v.id));

  if (!list.length) {
    return (
      <div className="card flex flex-col items-center px-6 py-16 text-center">
        <Heart className="h-12 w-12 text-ink-300" />
        <h2 className="mt-4 font-display text-xl font-bold text-ink-950">Nenhum favorito ainda</h2>
        <p className="mt-1 max-w-sm text-sm text-ink-500">Toque no coração de um anúncio para salvar o carro aqui.</p>
        <Link href="/estoque" className="btn btn-dark mt-6">Ver estoque</Link>
      </div>
    );
  }

  return (
    <>
      {!isSupabaseConfigured && (
        <p className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Versão de demonstração: os favoritos ficam salvos só neste navegador.
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((v) => (
          <VehicleCard key={v.id} vehicle={v} whatsapp={whatsapp} companyName={companyName} />
        ))}
      </div>
    </>
  );
}
