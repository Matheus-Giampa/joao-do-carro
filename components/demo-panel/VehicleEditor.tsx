"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ImagePlus, Loader2, Save, Star, X } from "lucide-react";
import { PanelHeader } from "./PanelHeader";
import { go } from "./routes";
import { fileToDataUrl, newId, type DemoData } from "./store";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { BODY_TYPES, FUEL_OPTIONS, TRANSMISSION_OPTIONS, VEHICLE_OPTIONS, VEHICLE_STATUS_LABEL } from "@/lib/constants";
import { cn, slugify } from "@/lib/utils";
import type { Vehicle, VehicleStatus } from "@/types";

const MAX_PHOTOS = 8;

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
    // <label> envolvendo o campo: liga o rótulo ao input (acessibilidade e clique no rótulo)
    <label className={cn("block", className)}>
      <span className="label">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-semibold text-brand-700">{error}</span>}
    </label>
  );
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition", checked ? "border-ink-950 bg-ink-50" : "border-ink-200")}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-ink-200 transition after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-brand-600 peer-checked:after:translate-x-5" />
      <span>
        <span className="block text-sm font-bold text-ink-950">{label}</span>
        <span className="block text-xs text-ink-500">{description}</span>
      </span>
    </label>
  );
}

type Draft = Omit<Vehicle, "id" | "slug" | "created_at" | "updated_at" | "is_demo">;

function emptyDraft(): Draft {
  const year = new Date().getFullYear();
  return {
    brand: "", model: "", version: "", year_manufacture: year, year_model: year, price: 0, previous_price: null, mileage: 0,
    fuel: "Flex", transmission: "Manual", body_type: "Hatch", color: "", doors: 4, plate_end: null, description: "", options: [],
    status: "disponivel", featured: false, is_offer: false, is_new_arrival: true, published: true, images: [],
  };
}

export function VehicleEditor({ data, update, vehicleId }: { data: DemoData; update: (fn: (d: DemoData) => DemoData) => void; vehicleId?: string }) {
  const existing = vehicleId ? data.vehicles.find((v) => v.id === vehicleId) : undefined;
  const [d, setD] = useState<Draft>(() => (existing ? { ...existing } : emptyDraft()));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const year = new Date().getFullYear();

  if (vehicleId && !existing) {
    return (
      <div className="card p-10 text-center">
        <p className="text-ink-600">Este veículo não existe mais.</p>
        <a href="#/veiculos" className="btn btn-dark mt-5">Voltar para a lista</a>
      </div>
    );
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setSaved(false);
    setD((prev) => ({ ...prev, [key]: value }));
  };
  const allOptions = Array.from(new Set([...VEHICLE_OPTIONS, ...d.options]));

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    const room = MAX_PHOTOS - d.images.length;
    const urls: string[] = [];
    for (const f of Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, room)) {
      try {
        urls.push(await fileToDataUrl(f));
      } catch {}
    }
    setUploading(false);
    setSaved(false);
    setD((prev) => ({
      ...prev,
      images: [...prev.images, ...urls.map((url, i) => ({ id: newId("img"), vehicle_id: "", url, storage_path: null, position: prev.images.length + i }))],
    }));
  }

  function moveImage(index: number, dir: -1 | 1) {
    setD((prev) => {
      const imgs = [...prev.images];
      const j = index + dir;
      if (j < 0 || j >= imgs.length) return prev;
      [imgs[index], imgs[j]] = [imgs[j], imgs[index]];
      return { ...prev, images: imgs.map((img, position) => ({ ...img, position })) };
    });
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!d.brand.trim()) errs.brand = "Informe a marca.";
    if (!d.model.trim()) errs.model = "Informe o modelo.";
    if (!d.price || d.price <= 0) errs.price = "Informe o preço.";
    if (d.year_model < d.year_manufacture) errs.year_model = "O ano do modelo não pode ser menor que o de fabricação.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const now = new Date().toISOString();
    const id = existing?.id ?? newId("v");
    const vehicle: Vehicle = {
      ...d,
      brand: d.brand.trim(),
      model: d.model.trim(),
      id,
      slug: existing?.slug ?? `${slugify(`${d.brand} ${d.model} ${d.version ?? ""} ${d.year_model}`)}-${id.slice(-4)}`,
      is_demo: true,
      created_at: existing?.created_at ?? now,
      updated_at: now,
      images: d.images.map((img, position) => ({ ...img, vehicle_id: id, position })),
    };
    update((data) => ({
      ...data,
      vehicles: existing ? data.vehicles.map((v) => (v.id === id ? vehicle : v)) : [vehicle, ...data.vehicles],
    }));
    if (existing) setSaved(true);
    else go({ page: "veiculos" });
  }

  return (
    <form onSubmit={save} className="space-y-6 pb-24" noValidate>
      <PanelHeader
        title={existing ? `Editar ${existing.brand} ${existing.model}` : "Adicionar veículo"}
        subtitle={existing ? "Altere os dados e salve." : "Preencha os dados, envie as fotos e publique o anúncio."}
        actions={<a href="#/veiculos" className="btn btn-outline"><ArrowLeft className="h-4 w-4" /> Voltar</a>}
      />

      {Object.keys(errors).length > 0 && (
        <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800" role="alert">Confira os campos destacados.</p>
      )}

      <Section title="Informações do veículo">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Marca *" error={errors.brand}>
            <input value={d.brand} onChange={(e) => set("brand", e.target.value)} className="input" placeholder="Ex.: Toyota" />
          </Field>
          <Field label="Modelo *" error={errors.model}>
            <input value={d.model} onChange={(e) => set("model", e.target.value)} className="input" placeholder="Ex.: Corolla" />
          </Field>
          <Field label="Versão">
            <input value={d.version ?? ""} onChange={(e) => set("version", e.target.value)} className="input" placeholder="Ex.: XEi 2.0 Flex" />
          </Field>
          <Field label="Ano de fabricação">
            <input type="number" min={1950} max={year + 1} value={d.year_manufacture} onChange={(e) => set("year_manufacture", Number(e.target.value))} className="input" />
          </Field>
          <Field label="Ano do modelo" error={errors.year_model}>
            <input type="number" min={1950} max={year + 1} value={d.year_model} onChange={(e) => set("year_model", Number(e.target.value))} className="input" />
          </Field>
          <Field label="Quilometragem">
            <input type="number" min={0} step={1000} value={d.mileage} onChange={(e) => set("mileage", Number(e.target.value))} className="input" />
          </Field>
          <Field label="Combustível">
            <select value={d.fuel} onChange={(e) => set("fuel", e.target.value)} className="input">
              {FUEL_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Câmbio">
            <select value={d.transmission} onChange={(e) => set("transmission", e.target.value)} className="input">
              {TRANSMISSION_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Carroceria">
            <select value={d.body_type} onChange={(e) => set("body_type", e.target.value)} className="input">
              {BODY_TYPES.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Cor">
            <input value={d.color ?? ""} onChange={(e) => set("color", e.target.value)} className="input" placeholder="Ex.: Prata" />
          </Field>
          <Field label="Portas">
            <input type="number" min={0} max={6} value={d.doors ?? ""} onChange={(e) => set("doors", e.target.value ? Number(e.target.value) : null)} className="input" />
          </Field>
          <Field label="Status">
            <select value={d.status} onChange={(e) => set("status", e.target.value as VehicleStatus)} className="input">
              {(Object.keys(VEHICLE_STATUS_LABEL) as VehicleStatus[]).map((s) => <option key={s} value={s}>{VEHICLE_STATUS_LABEL[s]}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Preço">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Preço de venda *" error={errors.price}>
            <CurrencyInput value={d.price || null} onChange={(v) => set("price", v ?? 0)} />
          </Field>
          <Field label="Preço anterior (aparece riscado)">
            <CurrencyInput value={d.previous_price} onChange={(v) => set("previous_price", v)} />
          </Field>
        </div>
      </Section>

      <Section title="Fotos" description={`A primeira foto é a capa do anúncio. Até ${MAX_PHOTOS} fotos.`}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {d.images.map((img, i) => (
            <div key={img.id} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-ink-950/80 px-2 py-0.5 text-[11px] font-semibold text-white">
                  <Star className="h-3 w-3" /> Capa
                </span>
              )}
              <div className="absolute inset-x-2 bottom-2 flex justify-between gap-1">
                <span className="flex gap-1">
                  <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink-900 disabled:opacity-40" aria-label="Mover para a esquerda">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => moveImage(i, 1)} disabled={i === d.images.length - 1} className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink-900 disabled:opacity-40" aria-label="Mover para a direita">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </span>
                <button
                  type="button"
                  onClick={() => set("images", d.images.filter((x) => x.id !== img.id))}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-brand-700"
                  aria-label="Remover foto"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {d.images.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addPhotos(e.dataTransfer.files);
              }}
              className="grid aspect-[4/3] place-items-center rounded-2xl border-2 border-dashed border-ink-300 text-ink-500 transition hover:border-ink-900 hover:text-ink-900"
            >
              <span className="flex flex-col items-center gap-1.5 text-sm font-medium">
                {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
                {uploading ? "Processando..." : "Adicionar fotos"}
              </span>
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
      </Section>

      <Section title="Itens e opcionais">
        <div className="flex flex-wrap gap-2">
          {allOptions.map((o) => {
            const on = d.options.includes(o);
            return (
              <button
                key={o}
                type="button"
                onClick={() => set("options", on ? d.options.filter((x) => x !== o) : [...d.options, o])}
                aria-pressed={on}
                className={cn("rounded-full border px-3.5 py-1.5 text-sm font-medium transition", on ? "border-ink-950 bg-ink-950 text-white" : "border-ink-200 text-ink-700 hover:border-ink-400")}
              >
                {o}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Descrição">
        <textarea value={d.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={5} className="input resize-y" placeholder="Conte os detalhes do carro: revisões, estado, diferenciais..." />
      </Section>

      <Section title="Visibilidade e etiquetas">
        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle checked={d.published} onChange={(v) => set("published", v)} label="Publicado no site" description="Desligue para esconder o anúncio sem excluir." />
          <Toggle checked={d.featured} onChange={(v) => set("featured", v)} label="Destaque" description="Aparece na página inicial." />
          <Toggle checked={d.is_offer} onChange={(v) => set("is_offer", v)} label="Oferta" description="Ganha a etiqueta de oferta e entra na página Ofertas." />
          <Toggle checked={d.is_new_arrival} onChange={(v) => set("is_new_arrival", v)} label="Recém-chegado" description="Etiqueta de novidade no anúncio." />
        </div>
      </Section>

      {/* Barra fixa com o botão de salvar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-200 bg-white/95 px-4 py-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 sm:px-2 lg:px-4">
          {saved && <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Alterações salvas</span>}
          <a href="#/veiculos" className="btn btn-ghost">Cancelar</a>
          <button type="submit" disabled={uploading} className="btn btn-primary">
            <Save className="h-4 w-4" /> {existing ? "Salvar alterações" : "Publicar anúncio"}
          </button>
        </div>
      </div>
    </form>
  );
}
