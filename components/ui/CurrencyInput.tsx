"use client";

import { cn } from "@/lib/utils";

const fmt = new Intl.NumberFormat("pt-BR");

/** Campo de valor em reais com máscara (R$ 129.900). Trabalha com número inteiro. */
export function CurrencyInput({
  value,
  onChange,
  id,
  name,
  className,
  placeholder = "0",
  ...rest
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  id?: string;
  name?: string;
  className?: string;
  placeholder?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-400">R$</span>
      <input
        {...rest}
        id={id}
        name={name}
        inputMode="numeric"
        autoComplete="off"
        className={cn("input pl-10", className)}
        placeholder={placeholder}
        value={value == null ? "" : fmt.format(value)}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
          onChange(digits ? Number(digits) : null);
        }}
      />
    </div>
  );
}
