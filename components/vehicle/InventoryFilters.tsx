"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { BODY_TYPES, SORT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { FilterOptions } from "@/types";

const KM_OPTIONS = [10000, 30000, 50000, 80000, 100000, 150000];
const FILTER_KEYS = ["q", "marca", "modelo", "precoMin", "precoMax", "anoMin", "anoMax", "kmMax", "combustivel", "cambio", "carroceria", "oferta"];

function useFilterNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function apply(updates: Record<string, string | null>, resetPage = true) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v == null || v === "") params.delete(k);
      else params.set(k, v);
    }
    if (resetPage) params.delete("pagina");
    startTransition(() => router.push(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false }));
  }
  return { apply, pending, searchParams };
}

/** Barra superior: busca por texto + ordenação + botão de filtros (mobile). */
export function InventoryToolbar({ total, onOpenFilters }: { total: number; onOpenFilters?: () => void }) {
  const { apply, pending, searchParams } = useFilterNavigation();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  useEffect(() => setQ(searchParams.get("q") ?? ""), [searchParams]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <form
        className="relative flex-1"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q: q.trim() || null });
        }}
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="search"
          placeholder='Busque por "Corolla", "Honda Civic", "Onix"...'
          className="input h-12 pl-10 pr-24"
          aria-label="Pesquisar veículos"
        />
        <button type="submit" className="btn btn-dark btn-sm absolute right-1.5 top-1/2 -translate-y-1/2 py-2">
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Buscar"}
        </button>
      </form>
      <div className="flex gap-2">
        <button type="button" onClick={onOpenFilters} className="btn btn-outline h-12 flex-1 lg:hidden">
          <SlidersHorizontal className="h-4 w-4" /> Filtros
        </button>
        <label className="sr-only" htmlFor="ordem">Ordenar por</label>
        <select
          id="ordem"
          className="input h-12 flex-1 sm:w-56"
          value={searchParams.get("ordem") ?? "recentes"}
          onChange={(e) => apply({ ordem: e.target.value === "recentes" ? null : e.target.value })}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <p className="sr-only" aria-live="polite">{total} veículos encontrados</p>
    </div>
  );
}

/** Painel de filtros (lateral no desktop, gaveta no celular). */
export function InventoryFilters({ options, mobileOpen, onClose }: { options: FilterOptions; mobileOpen: boolean; onClose: () => void }) {
  const { apply, pending, searchParams } = useFilterNavigation();
  const get = (k: string) => searchParams.get(k) ?? "";
  const [brand, setBrand] = useState(get("marca"));
  useEffect(() => setBrand(searchParams.get("marca") ?? ""), [searchParams]);

  const models = brand
    ? options.modelsByBrand[brand] ?? []
    : Array.from(new Set(Object.values(options.modelsByBrand).flat())).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const bodyTypes = Array.from(new Set([...BODY_TYPES, ...options.bodyTypes]));
  const activeCount = FILTER_KEYS.filter((k) => k !== "q" && searchParams.get(k)).length;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const updates: Record<string, string | null> = {};
    for (const k of FILTER_KEYS) {
      if (k === "q") continue;
      const v = fd.get(k);
      updates[k] = typeof v === "string" && v.trim() ? v.trim() : null;
    }
    apply(updates);
    onClose();
  }

  // Selects aplicam na hora no desktop; no celular, aplica ao tocar em "Ver resultados".
  const autoSubmit = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    if (window.matchMedia("(min-width: 1024px)").matches) e.currentTarget.form?.requestSubmit();
  };

  const formKey = searchParams.toString();

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-ink-950/60 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={cn(
          "lg:sticky lg:top-24 lg:block lg:self-start",
          mobileOpen
            ? "fixed inset-y-0 right-0 z-50 flex w-[88%] max-w-sm animate-slide-in flex-col bg-white shadow-2xl"
            : "hidden",
        )}
        aria-label="Filtros"
      >
        <form key={formKey} onSubmit={onSubmit} className="flex h-full flex-col lg:card lg:h-auto">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-950">
              <SlidersHorizontal className="h-4 w-4" /> Filtros
              {activeCount > 0 && <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs text-white">{activeCount}</span>}
            </h2>
            <div className="flex items-center gap-1">
              {pending && <Loader2 className="h-4 w-4 animate-spin text-ink-400" />}
              <button type="button" onClick={onClose} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 lg:hidden" aria-label="Fechar filtros">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <div>
              <label className="label" htmlFor="f-marca">Marca</label>
              <select id="f-marca" name="marca" className="input" value={brand} onChange={(e) => { setBrand(e.target.value); const m = e.currentTarget.form?.elements.namedItem("modelo") as HTMLSelectElement | null; if (m) m.value = ""; autoSubmit(e); }}>
                <option value="">Todas</option>
                {options.brands.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="f-modelo">Modelo</label>
              <select id="f-modelo" name="modelo" className="input" defaultValue={get("modelo")} onChange={autoSubmit}>
                <option value="">Todos</option>
                {models.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <fieldset>
              <legend className="label">Preço (R$)</legend>
              <div className="grid grid-cols-2 gap-2">
                <input name="precoMin" type="number" inputMode="numeric" min={0} step={1000} placeholder="Mínimo" defaultValue={get("precoMin")} className="input" aria-label="Preço mínimo" />
                <input name="precoMax" type="number" inputMode="numeric" min={0} step={1000} placeholder="Máximo" defaultValue={get("precoMax")} className="input" aria-label="Preço máximo" />
              </div>
            </fieldset>

            <fieldset>
              <legend className="label">Ano</legend>
              <div className="grid grid-cols-2 gap-2">
                <select name="anoMin" className="input" defaultValue={get("anoMin")} onChange={autoSubmit} aria-label="Ano mínimo">
                  <option value="">De</option>
                  {options.years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <select name="anoMax" className="input" defaultValue={get("anoMax")} onChange={autoSubmit} aria-label="Ano máximo">
                  <option value="">Até</option>
                  {options.years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </fieldset>

            <div>
              <label className="label" htmlFor="f-km">Quilometragem máxima</label>
              <select id="f-km" name="kmMax" className="input" defaultValue={get("kmMax")} onChange={autoSubmit}>
                <option value="">Qualquer</option>
                {KM_OPTIONS.map((k) => <option key={k} value={k}>Até {k.toLocaleString("pt-BR")} km</option>)}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="f-comb">Combustível</label>
              <select id="f-comb" name="combustivel" className="input" defaultValue={get("combustivel")} onChange={autoSubmit}>
                <option value="">Todos</option>
                {options.fuels.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="f-cambio">Câmbio</label>
              <select id="f-cambio" name="cambio" className="input" defaultValue={get("cambio")} onChange={autoSubmit}>
                <option value="">Todos</option>
                {options.transmissions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <fieldset>
              <legend className="label">Carroceria</legend>
              <div className="grid grid-cols-2 gap-2">
                {[["", "Todas"], ...bodyTypes.map((b) => [b, b])].map(([value, label]) => (
                  <label key={label} className="cursor-pointer">
                    <input type="radio" name="carroceria" value={value} defaultChecked={get("carroceria") === value} onChange={autoSubmit} className="peer sr-only" />
                    <span className="block rounded-xl border border-ink-200 px-3 py-2 text-center text-sm font-medium text-ink-700 transition peer-checked:border-ink-950 peer-checked:bg-ink-950 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 hover:border-ink-400">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-200 px-3 py-3">
              <input type="checkbox" name="oferta" value="1" defaultChecked={get("oferta") === "1"} onChange={autoSubmit} className="h-4 w-4 accent-brand-600" />
              <span className="text-sm font-semibold text-ink-800">Somente ofertas</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-ink-100 p-4">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                apply(Object.fromEntries(FILTER_KEYS.map((k) => [k, null])));
                onClose();
              }}
            >
              <RotateCcw className="h-4 w-4" /> Limpar
            </button>
            <button type="submit" className="btn btn-primary">
              <span className="lg:hidden">Ver resultados</span>
              <span className="hidden lg:inline">Aplicar</span>
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}

/** Chips com os filtros ativos (permite remover individualmente). */
export function ActiveFilterChips() {
  const { apply, searchParams } = useFilterNavigation();
  const labels: Record<string, (v: string) => string> = {
    q: (v) => `"${v}"`,
    marca: (v) => v,
    modelo: (v) => v,
    precoMin: (v) => `A partir de R$ ${Number(v).toLocaleString("pt-BR")}`,
    precoMax: (v) => `Até R$ ${Number(v).toLocaleString("pt-BR")}`,
    anoMin: (v) => `Ano ≥ ${v}`,
    anoMax: (v) => `Ano ≤ ${v}`,
    kmMax: (v) => `Até ${Number(v).toLocaleString("pt-BR")} km`,
    combustivel: (v) => v,
    cambio: (v) => v,
    carroceria: (v) => v,
    oferta: () => "Ofertas",
  };
  const active = FILTER_KEYS.filter((k) => searchParams.get(k));
  if (!active.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {active.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => apply({ [k]: null, ...(k === "marca" ? { modelo: null } : {}) })}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink-950 py-1.5 pl-3 pr-2 text-xs font-semibold text-white transition hover:bg-brand-700"
        >
          {labels[k](searchParams.get(k)!)} <X className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
