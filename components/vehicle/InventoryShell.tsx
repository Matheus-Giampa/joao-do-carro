"use client";

import { useState } from "react";
import { ActiveFilterChips, InventoryFilters, InventoryToolbar } from "./InventoryFilters";
import type { FilterOptions } from "@/types";

/** Estrutura da página de estoque: filtros + barra de busca + resultados (children). */
export function InventoryShell({ options, total, children }: { options: FilterOptions; total: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
      <InventoryFilters options={options} mobileOpen={open} onClose={() => setOpen(false)} />
      <div className="min-w-0 space-y-5">
        <InventoryToolbar total={total} onOpenFilters={() => setOpen(true)} />
        <ActiveFilterChips />
        {children}
      </div>
    </div>
  );
}
