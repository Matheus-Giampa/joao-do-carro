"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calculator, Info, X } from "lucide-react";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { LeadForm } from "@/components/forms/LeadForm";
import { FINANCE_DISCLAIMER, simulate } from "@/lib/finance";
import { INSTALLMENT_OPTIONS } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";

export function FinanceSimulator({
  initialValue = 80000,
  monthlyRate,
  vehicleId,
  vehicleLabel,
  whatsappHref,
  compact = false,
}: {
  initialValue?: number;
  monthlyRate: number;
  vehicleId?: string;
  vehicleLabel?: string;
  whatsappHref?: string;
  compact?: boolean;
}) {
  const [value, setValue] = useState<number | null>(initialValue);
  const [down, setDown] = useState<number | null>(Math.round((initialValue * 0.3) / 100) * 100);
  const [months, setMonths] = useState<number>(48);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Ao abrir, leva a pessoa até o formulário (antes ele aparecia fora da tela e parecia que o botão não fazia nada)
  useEffect(() => {
    if (showForm) formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [showForm]);

  const v = value ?? 0;
  const d = Math.min(down ?? 0, v);
  const result = useMemo(() => simulate(v, d, months, monthlyRate), [v, d, months, monthlyRate]);
  const all = useMemo(() => INSTALLMENT_OPTIONS.map((n) => ({ n, ...simulate(v, d, n, monthlyRate) })), [v, d, monthlyRate]);
  const maxInstallment = Math.max(...all.map((a) => a.installment), 1);
  const downPct = v > 0 ? Math.round((d / v) * 100) : 0;

  return (
    <div className="overflow-hidden rounded-3xl border border-ink-200/60 bg-white shadow-card">
      <div className={cn("grid", !compact && "lg:grid-cols-[1fr_1.1fr]")}>
        {/* Entradas */}
        <div className="space-y-5 p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-white">
              <Calculator className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-xl font-bold text-ink-950">Simule seu financiamento</h3>
              {vehicleLabel && <p className="text-sm text-ink-500">{vehicleLabel}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="sim-valor" className="label">Valor do veículo</label>
            <CurrencyInput id="sim-valor" value={value} onChange={setValue} />
          </div>

          <div>
            <div className="flex items-end justify-between">
              <label htmlFor="sim-entrada" className="label">Valor da entrada</label>
              <span className="mb-1.5 text-xs font-bold text-brand-700">{downPct}%</span>
            </div>
            <CurrencyInput id="sim-entrada" value={down} onChange={setDown} />
            <input
              type="range"
              min={0}
              max={v || 0}
              step={500}
              value={d}
              onChange={(e) => setDown(Number(e.target.value))}
              className="mt-3 w-full accent-brand-600"
              aria-label="Ajustar valor da entrada"
            />
          </div>

          <div>
            <span className="label">Quantidade de parcelas</span>
            <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Quantidade de parcelas">
              {INSTALLMENT_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={months === n}
                  onClick={() => setMonths(n)}
                  className={cn(
                    "rounded-full border py-2.5 text-sm font-semibold transition",
                    months === n ? "border-ink-950 bg-ink-950 text-white" : "border-ink-200 bg-white text-ink-700 hover:border-ink-400",
                  )}
                >
                  {n}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resultado visual */}
        <div className="speed-lines relative bg-ink-950 p-5 text-white sm:p-7">
          <p className="text-sm font-medium text-ink-400">Parcela estimada</p>
          <p className="mt-1 font-display text-4xl font-extrabold sm:text-5xl" aria-live="polite">
            {months}x <span className="text-brand-500">{formatPrice(result.installment, true)}</span>
          </p>

          {/* Barra entrada x financiado */}
          <div className="mt-6">
            <div className="flex h-3 overflow-hidden rounded-full bg-white/10">
              <div className="bg-white transition-all duration-500" style={{ width: `${downPct}%` }} />
              <div className="bg-brand-600 transition-all duration-500" style={{ width: `${100 - downPct}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="flex items-center gap-1.5 text-ink-400"><span className="h-2.5 w-2.5 rounded-full bg-white" /> Entrada</p>
                <p className="font-bold">{formatPrice(d)}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-ink-400"><span className="h-2.5 w-2.5 rounded-full bg-brand-600" /> Valor financiado</p>
                <p className="font-bold">{formatPrice(result.financed)}</p>
              </div>
            </div>
          </div>

          {/* Comparativo de prazos */}
          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium text-ink-400">Compare os prazos</p>
            {all.map((a) => (
              <button
                key={a.n}
                type="button"
                onClick={() => setMonths(a.n)}
                className={cn("flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition", a.n === months ? "bg-white/10" : "hover:bg-white/5")}
              >
                <span className="w-9 font-bold">{a.n}x</span>
                <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <span
                    className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-500", a.n === months ? "bg-brand-500" : "bg-ink-500")}
                    style={{ width: `${(a.installment / maxInstallment) * 100}%` }}
                  />
                </span>
                <span className="w-28 text-right font-semibold tabular-nums">{formatPrice(a.installment, true)}</span>
              </button>
            ))}
          </div>

          <p className="mt-5 text-xs text-ink-400">
            Taxa de referência: {monthlyRate.toLocaleString("pt-BR")}% a.m. · Total estimado: {formatPrice(result.totalPaid)}
          </p>
          <p className="mt-3 flex gap-2 rounded-xl bg-white/5 p-3 text-xs leading-relaxed text-ink-300">
            <Info className="mt-0.5 h-4 w-4 shrink-0" /> {FINANCE_DISCLAIMER}
          </p>

          <button type="button" onClick={() => setShowForm(true)} className="btn btn-primary mt-5 w-full py-4">
            Solicitar financiamento
          </button>
        </div>
      </div>

      {showForm && (
        <div ref={formRef} className="scroll-mt-24 border-t border-ink-100 bg-ink-50 p-5 sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h4 className="font-display text-lg font-bold text-ink-950">Solicitar financiamento</h4>
              <p className="text-sm text-ink-500">Preencha seus dados e nossa equipe fará a análise com as financeiras parceiras.</p>
            </div>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100" aria-label="Fechar formulário">
              <X className="h-5 w-5" />
            </button>
          </div>
          <LeadForm
            idPrefix="fin"
            source="financiamento"
            vehicleId={vehicleId}
            vehicleLabel={vehicleLabel}
            defaultDownPayment={d}
            defaultInstallments={months}
            whatsappHref={whatsappHref}
            submitLabel="Enviar solicitação"
          />
        </div>
      )}
    </div>
  );
}
