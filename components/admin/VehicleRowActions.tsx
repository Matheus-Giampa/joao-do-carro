"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Eye, EyeOff, Loader2, MoreVertical, Star, Trash2, X } from "lucide-react";
import { deleteVehicle, updateVehicleQuick } from "@/app/actions/admin";
import { cn, formatPrice } from "@/lib/utils";
import type { ActionResult, VehicleStatus } from "@/types";

type RowVehicle = { id: string; slug: string; status: VehicleStatus; featured: boolean; published: boolean; label: string };

export function VehicleRowActions({ vehicle: v }: { vehicle: RowVehicle }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const run = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) alert(r.message);
      setOpen(false);
      router.refresh();
    });

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label="Status do veículo"
        value={v.status}
        disabled={pending}
        onChange={(e) => run(() => updateVehicleQuick(v.id, { status: e.target.value as VehicleStatus }))}
        className="input w-auto py-2 text-sm"
      >
        <option value="disponivel">Disponível</option>
        <option value="reservado">Reservado</option>
        <option value="vendido">Vendido</option>
      </select>
      <button
        type="button"
        title={v.featured ? "Remover destaque" : "Marcar como destaque"}
        aria-label={v.featured ? "Remover destaque" : "Marcar como destaque"}
        disabled={pending}
        onClick={() => run(() => updateVehicleQuick(v.id, { featured: !v.featured }))}
        className={cn("grid h-10 w-10 place-items-center rounded-xl border transition", v.featured ? "border-amber-300 bg-amber-50 text-amber-500" : "border-ink-200 bg-white text-ink-400 hover:text-amber-500")}
      >
        <Star className={cn("h-4 w-4", v.featured && "fill-current")} />
      </button>
      <div className="relative" ref={ref}>
        <button type="button" onClick={() => setOpen((o) => !o)} className="grid h-10 w-10 place-items-center rounded-xl border border-ink-200 bg-white text-ink-600 hover:bg-ink-50" aria-label="Mais ações">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
        </button>
        {open && (
          <div className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-xl border border-ink-100 bg-white py-1 shadow-card-hover">
            <a href={`/veiculos/${v.slug}`} target="_blank" className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50">
              <Eye className="h-4 w-4" /> Ver anúncio
            </a>
            <button type="button" onClick={() => run(() => updateVehicleQuick(v.id, { published: !v.published }))} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50">
              {v.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {v.published ? "Ocultar anúncio" : "Publicar anúncio"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Excluir definitivamente "${v.label}" e todas as fotos? Esta ação não pode ser desfeita.`)) run(() => deleteVehicle(v.id));
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
            >
              <Trash2 className="h-4 w-4" /> Excluir veículo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Edição rápida de preço direto na listagem. */
export function QuickPrice({ id, price }: { id: string; price: number }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(price));
  const [pending, start] = useTransition();

  if (!editing) {
    return (
      <button type="button" onClick={() => setEditing(true)} title="Clique para alterar o preço" className="rounded-lg px-2 py-1 font-display text-lg font-extrabold text-ink-950 hover:bg-ink-100">
        {formatPrice(price)}
      </button>
    );
  }
  const save = () =>
    start(async () => {
      const n = Number(value.replace(/\D/g, ""));
      const r = await updateVehicleQuick(id, { price: n });
      if (!r.ok) alert(r.message);
      setEditing(false);
      router.refresh();
    });
  return (
    <div className="flex items-center gap-1">
      <input
        autoFocus
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") setEditing(false);
        }}
        className="input w-32 py-2"
        aria-label="Novo preço"
      />
      <button type="button" onClick={save} disabled={pending} className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-600 text-white" aria-label="Salvar preço">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </button>
      <button type="button" onClick={() => setEditing(false)} className="grid h-9 w-9 place-items-center rounded-lg bg-ink-100 text-ink-600" aria-label="Cancelar">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
