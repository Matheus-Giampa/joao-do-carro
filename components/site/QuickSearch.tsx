"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import type { FilterOptions } from "@/types";

/** Buscador rápido da home: Marca, Modelo, Ano, Preço mínimo e máximo. */
export function QuickSearch({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const models = brand ? options.modelsByBrand[brand] ?? [] : Array.from(new Set(Object.values(options.modelsByBrand).flat())).sort();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [k, v] of data.entries()) {
      const value = String(v).trim();
      if (value) params.set(k, value);
    }
    router.push(`/estoque${params.size ? `?${params}` : ""}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded-2xl bg-white p-4 shadow-2xl shadow-black/30 sm:grid-cols-2 sm:p-5 lg:grid-cols-[1fr_1fr_.8fr_1fr_1fr_auto] lg:items-end"
      role="search"
      aria-label="Busca rápida de veículos"
    >
      <div>
        <label htmlFor="qs-marca" className="label">Marca</label>
        <select id="qs-marca" name="marca" className="input" value={brand} onChange={(e) => { setBrand(e.target.value); setModel(""); }}>
          <option value="">Todas as marcas</option>
          {options.brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="qs-modelo" className="label">Modelo</label>
        <select id="qs-modelo" name="modelo" className="input" value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="">Todos os modelos</option>
          {models.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="qs-ano" className="label">Ano (a partir de)</label>
        <select id="qs-ano" name="anoMin" className="input" defaultValue="">
          <option value="">Qualquer</option>
          {options.years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="qs-min" className="label">Preço mínimo</label>
        <input id="qs-min" name="precoMin" type="number" inputMode="numeric" min={0} step={1000} placeholder="R$ 0" className="input" />
      </div>
      <div>
        <label htmlFor="qs-max" className="label">Preço máximo</label>
        <input id="qs-max" name="precoMax" type="number" inputMode="numeric" min={0} step={1000} placeholder="R$ sem limite" className="input" />
      </div>
      <button type="submit" className="btn btn-primary h-[46px] w-full sm:col-span-2 lg:col-span-1 lg:w-auto">
        <Search className="h-4 w-4" /> Buscar veículos
      </button>
    </form>
  );
}
