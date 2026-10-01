"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Calendar, Car, Loader2, Mail, MessageSquare, Phone, Save, Trash2 } from "lucide-react";
import { deleteLead, updateLead } from "@/app/actions/admin";
import { WhatsAppIcon } from "@/components/site/icons";
import { LEAD_SOURCE_LABEL, LEAD_STATUS_LABEL, LEAD_STATUS_STYLE } from "@/lib/constants";
import { cn, formatDate, formatPhone, formatPrice } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";
import type { Lead, LeadStatus } from "@/types";

export function LeadCard({ lead: l }: { lead: Lead }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [notes, setNotes] = useState(l.notes ?? "");
  const [showNotes, setShowNotes] = useState(Boolean(l.notes));

  const run = (fn: () => Promise<{ ok: boolean; message: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) alert(r.message);
      router.refresh();
    });

  const firstName = l.name.split(" ")[0];
  const waMsg = `Olá, ${firstName}! Aqui é da João do Carro${l.vehicle_label ? `, sobre o ${l.vehicle_label}` : ""}.`;

  return (
    <article className={cn("card p-4 sm:p-5", l.status === "novo" && "border-l-4 border-l-brand-600")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold text-ink-950">{l.name}</h3>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(l.created_at)}</span>
            <span className="rounded bg-ink-100 px-1.5 py-0.5 font-semibold text-ink-700">Origem: {LEAD_SOURCE_LABEL[l.source]}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pending && <Loader2 className="h-4 w-4 animate-spin text-ink-400" />}
          <select
            aria-label="Status do lead"
            value={l.status}
            onChange={(e) => run(() => updateLead(l.id, { status: e.target.value as LeadStatus }))}
            className={cn("input w-auto py-2 text-sm font-bold ring-1", LEAD_STATUS_STYLE[l.status])}
          >
            {(Object.keys(LEAD_STATUS_LABEL) as LeadStatus[]).map((s) => (
              <option key={s} value={s}>{LEAD_STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>
      </div>

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
        {l.whatsapp && (
          <div className="flex items-center gap-2"><WhatsAppIcon className="h-4 w-4 text-whatsapp" /><dt className="sr-only">WhatsApp</dt><dd>{formatPhone(l.whatsapp)}</dd></div>
        )}
        {l.phone && (
          <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-ink-400" /><dt className="sr-only">Telefone</dt><dd>{formatPhone(l.phone)}</dd></div>
        )}
        {l.email && (
          <div className="flex min-w-0 items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-ink-400" /><dt className="sr-only">E-mail</dt><dd className="truncate">{l.email}</dd></div>
        )}
        {l.vehicle_label && (
          <div className="flex min-w-0 items-center gap-2">
            <Car className="h-4 w-4 shrink-0 text-ink-400" />
            <dt className="sr-only">Veículo</dt>
            <dd className="truncate">
              {l.vehicle_id ? <Link href={`/admin/veiculos/${l.vehicle_id}`} className="font-semibold text-brand-700 hover:underline">{l.vehicle_label}</Link> : l.vehicle_label}
            </dd>
          </div>
        )}
      </dl>

      {(l.down_payment || l.installments) && (
        <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-700">
          Financiamento: entrada de <strong>{formatPrice(l.down_payment)}</strong>
          {l.installments ? <> em <strong>{l.installments}x</strong></> : null}
        </p>
      )}
      {l.message && <p className="mt-3 whitespace-pre-line rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-700">“{l.message}”</p>}

      {showNotes && (
        <div className="mt-3 flex gap-2">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Anotações internas (não aparecem para o cliente)" className="input text-sm" />
          <button type="button" onClick={() => run(() => updateLead(l.id, { notes }))} className="btn btn-dark btn-sm self-start py-2.5" aria-label="Salvar anotação">
            <Save className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-100 pt-4">
        {(l.whatsapp || l.phone) && (
          <a href={whatsappLink(l.whatsapp ?? l.phone, waMsg)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">
            <WhatsAppIcon className="h-3.5 w-3.5" /> Responder
          </a>
        )}
        {l.phone && <a href={`tel:${l.phone.replace(/\D/g, "")}`} className="btn btn-outline btn-sm"><Phone className="h-3.5 w-3.5" /> Ligar</a>}
        {l.email && <a href={`mailto:${l.email}`} className="btn btn-outline btn-sm"><Mail className="h-3.5 w-3.5" /> E-mail</a>}
        {!showNotes && (
          <button type="button" onClick={() => setShowNotes(true)} className="btn btn-ghost btn-sm"><MessageSquare className="h-3.5 w-3.5" /> Anotação</button>
        )}
        <button
          type="button"
          onClick={() => confirm(`Excluir o lead de ${l.name}?`) && run(() => deleteLead(l.id))}
          className="btn btn-ghost btn-sm ml-auto text-brand-700 hover:bg-brand-50"
        >
          <Trash2 className="h-3.5 w-3.5" /> Excluir
        </button>
      </div>
    </article>
  );
}
