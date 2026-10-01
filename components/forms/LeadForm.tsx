"use client";

import { startTransition, useActionState, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { submitLead } from "@/app/actions/leads";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { WhatsAppIcon } from "@/components/site/icons";
import { INSTALLMENT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ActionResult, LeadSource } from "@/types";

function maskPhone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function PhoneInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [v, setV] = useState("");
  return (
    <input
      {...props}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder="(00) 00000-0000"
      className="input"
      value={v}
      onChange={(e) => setV(maskPhone(e.target.value))}
    />
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-brand-700">{error}</p>}
    </div>
  );
}

/**
 * Formulário de lead reutilizável.
 * source = "interesse" | "proposta" → Nome, WhatsApp, E-mail, Veículo, Mensagem
 * source = "financiamento" → + Telefone, Entrada, Parcelas
 * source = "contato" → Nome, WhatsApp, Telefone, E-mail, Mensagem
 */
export function LeadForm({
  source,
  vehicleId,
  vehicleLabel,
  defaultMessage,
  defaultDownPayment,
  defaultInstallments,
  whatsappHref,
  submitLabel,
  idPrefix = "lead",
  dark = false,
}: {
  source: LeadSource;
  vehicleId?: string;
  vehicleLabel?: string;
  defaultMessage?: string;
  defaultDownPayment?: number | null;
  defaultInstallments?: number;
  whatsappHref?: string;
  submitLabel?: string;
  idPrefix?: string;
  dark?: boolean;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(submitLead, null);
  const [down, setDown] = useState<number | null>(defaultDownPayment ?? null);
  const e = state?.errors ?? {};
  const id = (k: string) => `${idPrefix}-${k}`;
  const isFinance = source === "financiamento";
  const isContact = source === "contato";

  if (state?.ok) {
    return (
      <div className={cn("rounded-2xl p-6 text-center", dark ? "bg-white/5 text-white" : "bg-emerald-50 text-emerald-900")}>
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <p className="mt-3 font-display text-lg font-bold">Tudo certo!</p>
        <p className="mt-1 text-sm opacity-80">{state.message}</p>
        {whatsappHref && (
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-5">
            <WhatsAppIcon className="h-4 w-4" /> Agilizar pelo WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.currentTarget);
        startTransition(() => action(fd));
      }}
      className={cn("grid gap-4 sm:grid-cols-2", dark && "[&_.label]:text-ink-300")}
      noValidate
    >
      <input type="hidden" name="source" value={source} />
      {vehicleId && <input type="hidden" name="vehicle_id" value={vehicleId} />}
      {/* honeypot */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field label="Nome *" htmlFor={id("name")} error={e.name} className="sm:col-span-2">
        <input id={id("name")} name="name" required autoComplete="name" className="input" placeholder="Seu nome completo" />
      </Field>

      <Field label="WhatsApp *" htmlFor={id("whatsapp")} error={e.whatsapp}>
        <PhoneInput id={id("whatsapp")} name="whatsapp" />
      </Field>

      {(isFinance || isContact) && (
        <Field label="Telefone" htmlFor={id("phone")} error={e.phone}>
          <PhoneInput id={id("phone")} name="phone" />
        </Field>
      )}

      <Field label="E-mail" htmlFor={id("email")} error={e.email} className={isFinance || isContact ? "sm:col-span-2" : ""}>
        <input id={id("email")} name="email" type="email" autoComplete="email" className="input" placeholder="voce@email.com" />
      </Field>

      {!isContact && (
        <Field label={isFinance ? "Veículo" : "Veículo de interesse"} htmlFor={id("vehicle")} className="sm:col-span-2">
          <input
            id={id("vehicle")}
            name="vehicle_label"
            defaultValue={vehicleLabel}
            className="input"
            placeholder="Ex.: Toyota Corolla 2024"
          />
        </Field>
      )}

      {isFinance && (
        <>
          <Field label="Valor da entrada" htmlFor={id("down")}>
            <CurrencyInput id={id("down")} value={down} onChange={setDown} />
            <input type="hidden" name="down_payment" value={down ?? ""} />
          </Field>
          <Field label="Quantidade de parcelas" htmlFor={id("inst")}>
            <select id={id("inst")} name="installments" className="input" defaultValue={defaultInstallments ?? 48}>
              {INSTALLMENT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}x
                </option>
              ))}
            </select>
          </Field>
        </>
      )}

      {!isFinance && (
        <Field label="Mensagem" htmlFor={id("message")} className="sm:col-span-2">
          <textarea
            id={id("message")}
            name="message"
            rows={4}
            className="input resize-y"
            defaultValue={defaultMessage}
            placeholder="Como podemos ajudar?"
          />
        </Field>
      )}

      {state && !state.ok && (
        <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800 sm:col-span-2" role="alert">
          {state.message}
        </p>
      )}

      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="btn btn-primary w-full py-4">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {submitLabel ?? "Enviar"}
        </button>
        <p className={cn("mt-2 text-center text-xs", dark ? "text-ink-400" : "text-ink-500")}>
          Seus dados serão usados apenas para retornarmos o seu contato.
        </p>
      </div>
    </form>
  );
}
