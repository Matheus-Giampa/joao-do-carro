"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { CheckCircle2, Loader2, Plus, Save, X } from "lucide-react";
import { saveVehicle } from "@/app/actions/admin";
import { ImageManager, type ManagedImage } from "./ImageManager";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { BODY_TYPES, FUEL_OPTIONS, TRANSMISSION_OPTIONS, VEHICLE_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ActionResult, Vehicle } from "@/types";

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-7">
      <h2 className="font-display text-lg font-bold text-ink-950">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs font-semibold text-brand-700">{error}</p>}
    </div>
  );
}

function Toggle({ name, label, description, defaultChecked }: { name: string; label: string; description: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink-200 p-4 transition has-[:checked]:border-ink-950 has-[:checked]:bg-ink-50">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-ink-200 transition after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-brand-600 peer-checked:after:translate-x-5" />
      <span>
        <span className="block text-sm font-bold text-ink-950">{label}</span>
        <span className="block text-xs text-ink-500">{description}</span>
      </span>
    </label>
  );
}

export function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(saveVehicle, null);
  const [images, setImages] = useState<ManagedImage[]>(
    vehicle?.images.map((i) => ({ key: i.id, url: i.url, storage_path: i.storage_path })) ?? [],
  );
  const [price, setPrice] = useState<number | null>(vehicle?.price ?? null);
  const [prevPrice, setPrevPrice] = useState<number | null>(vehicle?.previous_price ?? null);
  const [options, setOptions] = useState<string[]>(vehicle?.options ?? []);
  const [customOption, setCustomOption] = useState("");
  const e = state?.errors ?? {};
  const uploading = images.some((i) => i.uploading);
  const allOptions = Array.from(new Set([...VEHICLE_OPTIONS, ...options]));
  const year = new Date().getFullYear();

  const toggleOption = (o: string) => setOptions((prev) => (prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]));

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.currentTarget);
        startTransition(() => action(fd));
      }}
      className="space-y-6 pb-24"
    >
      {vehicle && <input type="hidden" name="id" value={vehicle.id} />}
      <input type="hidden" name="images" value={JSON.stringify(images.filter((i) => !i.uploading && !i.error).map(({ url, storage_path }) => ({ url, storage_path })))} />
      {options.map((o) => <input key={o} type="hidden" name="options" value={o} />)}
      <input type="hidden" name="price" value={price ?? ""} />
      <input type="hidden" name="previous_price" value={prevPrice ?? ""} />

      <Section title="Informações do veículo">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Marca *" error={e.brand}>
            <input name="brand" defaultValue={vehicle?.brand} className="input" placeholder="Ex.: Toyota" list="brand-list" required />
          </Field>
          <Field label="Modelo *" error={e.model}>
            <input name="model" defaultValue={vehicle?.model} className="input" placeholder="Ex.: Corolla" required />
          </Field>
          <Field label="Versão">
            <input name="version" defaultValue={vehicle?.version ?? ""} className="input" placeholder="Ex.: XEi 2.0 Flex Automático" />
          </Field>
          <Field label="Ano de fabricação *" error={e.year_manufacture}>
            <input name="year_manufacture" type="number" min={1950} max={year + 1} defaultValue={vehicle?.year_manufacture ?? year} className="input" required />
          </Field>
          <Field label="Ano modelo *" error={e.year_model}>
            <input name="year_model" type="number" min={1950} max={year + 2} defaultValue={vehicle?.year_model ?? year} className="input" required />
          </Field>
          <Field label="Quilometragem (km)">
            <input name="mileage" type="number" min={0} step={1} defaultValue={vehicle?.mileage ?? 0} className="input" />
          </Field>
          <Field label="Combustível *" error={e.fuel}>
            <select name="fuel" defaultValue={vehicle?.fuel ?? "Flex"} className="input">
              {FUEL_OPTIONS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Câmbio *" error={e.transmission}>
            <select name="transmission" defaultValue={vehicle?.transmission ?? "Manual"} className="input">
              {TRANSMISSION_OPTIONS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Carroceria *" error={e.body_type}>
            <select name="body_type" defaultValue={vehicle?.body_type ?? "Hatch"} className="input">
              {BODY_TYPES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Cor">
            <input name="color" defaultValue={vehicle?.color ?? ""} className="input" placeholder="Ex.: Prata" />
          </Field>
          <Field label="Portas">
            <select name="doors" defaultValue={vehicle?.doors?.toString() ?? "4"} className="input">
              <option value="">—</option>
              {[2, 3, 4, 5].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Final da placa" error={e.plate_end}>
            <select name="plate_end" defaultValue={vehicle?.plate_end ?? ""} className="input">
              <option value="">—</option>
              {Array.from({ length: 10 }, (_, i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Preço e status">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Preço *" error={e.price}>
            <CurrencyInput value={price} onChange={setPrice} />
          </Field>
          <Field label="Preço anterior (opcional)">
            <CurrencyInput value={prevPrice} onChange={setPrevPrice} />
            <p className="mt-1 text-xs text-ink-500">Aparece riscado (“de / por”) quando maior que o preço.</p>
          </Field>
          <Field label="Status" error={e.status}>
            <select name="status" defaultValue={vehicle?.status ?? "disponivel"} className="input">
              <option value="disponivel">Disponível</option>
              <option value="reservado">Reservado</option>
              <option value="vendido">Vendido</option>
            </select>
          </Field>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Toggle name="published" label="Publicado" description="Visível no site. Desmarque para ocultar." defaultChecked={vehicle?.published ?? true} />
          <Toggle name="featured" label="Destaque" description="Aparece em “Veículos em destaque”." defaultChecked={vehicle?.featured ?? false} />
          <Toggle name="is_offer" label="Oferta" description="Etiqueta OFERTA e página de ofertas." defaultChecked={vehicle?.is_offer ?? false} />
          <Toggle name="is_new_arrival" label="Recém-chegado" description="Etiqueta RECÉM-CHEGADO." defaultChecked={vehicle?.is_new_arrival ?? !vehicle} />
        </div>
      </Section>

      <Section title="Fotos" description="Envie várias fotos, defina a capa e reorganize a ordem.">
        <ImageManager images={images} onChange={setImages} />
      </Section>

      <Section title="Itens e opcionais" description={`${options.length} selecionado(s)`}>
        <div className="flex flex-wrap gap-2">
          {allOptions.map((o) => {
            const on = options.includes(o);
            return (
              <button
                key={o}
                type="button"
                onClick={() => toggleOption(o)}
                aria-pressed={on}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition",
                  on ? "border-ink-950 bg-ink-950 text-white" : "border-ink-200 bg-white text-ink-700 hover:border-ink-400",
                )}
              >
                {on && <CheckCircle2 className="h-3.5 w-3.5" />} {o}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex max-w-md gap-2">
          <input
            value={customOption}
            onChange={(ev) => setCustomOption(ev.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") {
                ev.preventDefault();
                if (customOption.trim()) setOptions((p) => Array.from(new Set([...p, customOption.trim()])));
                setCustomOption("");
              }
            }}
            placeholder="Outro opcional (ex.: Engate)"
            className="input"
          />
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              if (customOption.trim()) setOptions((p) => Array.from(new Set([...p, customOption.trim()])));
              setCustomOption("");
            }}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </Section>

      <Section title="Descrição do veículo">
        <textarea name="description" rows={7} defaultValue={vehicle?.description ?? ""} className="input resize-y" placeholder="Conte os diferenciais, estado de conservação, revisões, etc." />
      </Section>

      {/* Barra de ações fixa */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-100 bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-h-[20px] text-sm">
            {state && (
              <span className={cn("font-semibold", state.ok ? "text-emerald-700" : "text-brand-700")} role="status">
                {state.message}
              </span>
            )}
            {uploading && <span className="text-ink-500">Enviando fotos…</span>}
          </div>
          <div className="flex gap-2">
            <Link href="/admin/veiculos" className="btn btn-ghost">
              <X className="h-4 w-4" /> Cancelar
            </Link>
            <button type="submit" disabled={pending || uploading} className="btn btn-primary">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {vehicle ? "Salvar alterações" : "Cadastrar veículo"}
            </button>
          </div>
        </div>
      </div>
      <datalist id="brand-list">
        {["Audi", "BMW", "BYD", "Chevrolet", "Citroën", "Fiat", "Ford", "Honda", "Hyundai", "Jeep", "Kia", "Mercedes-Benz", "Mitsubishi", "Nissan", "Peugeot", "Renault", "Toyota", "Volkswagen", "Volvo"].map((b) => (
          <option key={b} value={b} />
        ))}
      </datalist>
    </form>
  );
}
