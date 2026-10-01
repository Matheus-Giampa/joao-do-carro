"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { useAccount } from "./AccountProvider";
import { cn } from "@/lib/utils";

/** Coração para salvar/remover o veículo dos favoritos. */
export function FavoriteButton({
  vehicleId,
  label,
  variant = "overlay",
  className,
}: {
  vehicleId: string;
  label: string;
  variant?: "overlay" | "outline";
  className?: string;
}) {
  const { isFavorite, toggleFavorite } = useAccount();
  const [busy, setBusy] = useState(false);
  const active = isFavorite(vehicleId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remover ${label} dos favoritos` : `Salvar ${label} nos favoritos`}
      title={active ? "Remover dos favoritos" : "Salvar nos favoritos"}
      disabled={busy}
      onClick={async (e) => {
        // O card inteiro é um link: o clique no coração não deve abrir o anúncio
        e.preventDefault();
        e.stopPropagation();
        setBusy(true);
        await toggleFavorite(vehicleId);
        setBusy(false);
      }}
      className={cn(
        "grid place-items-center rounded-full transition active:scale-90",
        variant === "overlay"
          ? "h-10 w-10 bg-white/90 text-ink-800 shadow-sm backdrop-blur hover:bg-white"
          : "h-12 w-12 border border-ink-300 bg-white text-ink-800 hover:border-ink-900",
        className,
      )}
    >
      <Heart className={cn("h-5 w-5 transition", active && "fill-brand-600 text-brand-600")} />
    </button>
  );
}
