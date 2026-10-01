"use client";

import { useState } from "react";
import { BadgePercent, Car, CheckCircle2, Eye, EyeOff, Pencil, Plus, Search, Star, Trash2, UserPlus, Users } from "lucide-react";
import { PanelHeader } from "./PanelHeader";
import { go } from "./routes";
import { newId, type DemoData, type DemoMember } from "./store";
import { LEAD_SOURCE_LABEL, LEAD_STATUS_LABEL, LEAD_STATUS_STYLE, ROLE_DESCRIPTION, ROLE_LABEL, VEHICLE_STATUS_LABEL } from "@/lib/constants";
import { asset } from "@/lib/paths";
import { cn, coverImage, formatDate, formatKm, formatPrice, vehicleYears } from "@/lib/utils";
import type { LeadStatus, StaffRole, VehicleStatus } from "@/types";

type Props = { data: DemoData; update: (fn: (d: DemoData) => DemoData) => void };

/* ------------------------------------------------------------------ */
/* Dashboard                                                          */
/* ------------------------------------------------------------------ */
export function Dashboard({ data, me }: { data: DemoData; me: DemoMember }) {
  const v = data.vehicles;
  const stats = [
    { label: "Veículos", value: v.length, icon: Car },
    { label: "Disponíveis", value: v.filter((x) => x.status === "disponivel").length, icon: CheckCircle2 },
    { label: "Em oferta", value: v.filter((x) => x.is_offer).length, icon: BadgePercent },
    { label: "Leads novos", value: data.leads.filter((l) => l.status === "novo").length, icon: Users },
  ];
  return (
    <>
      <PanelHeader
        title={`Olá, ${me.name.split(" ")[0]}!`}
        subtitle="Resumo da loja hoje."
        actions={<a href="#/novo" className="btn btn-primary"><Plus className="h-4 w-4" /> Adicionar veículo</a>}
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-5">
            <Icon className="h-5 w-5 text-brand-600" />
            <p className="mt-3 font-display text-3xl font-bold text-ink-950">{value}</p>
            <p className="text-sm text-ink-500">{label}</p>
          </div>
        ))}
      </div>
      <section className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-ink-950">Leads recentes</h2>
          <a href="#/leads" className="text-sm font-semibold text-brand-700 hover:underline">Ver todos</a>
        </div>
        <ul className="divide-y divide-ink-100">
          {[...data.leads].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 4).map((l) => (
            <li key={l.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink-950">{l.name}</p>
                <p className="truncate text-sm text-ink-500">{l.vehicle_label || l.message}</p>
              </div>
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", LEAD_STATUS_STYLE[l.status])}>{LEAD_STATUS_LABEL[l.status]}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Veículos                                                           */
/* ------------------------------------------------------------------ */
export function VehiclesPage({ data, update }: Props) {
  const [q, setQ] = useState("");
  const list = data.vehicles.filter((v) => `${v.brand} ${v.model} ${v.version ?? ""} ${v.year_model}`.toLowerCase().includes(q.trim().toLowerCase()));

  const patch = (id: string, changes: Partial<DemoData["vehicles"][number]>) =>
    update((d) => ({ ...d, vehicles: d.vehicles.map((v) => (v.id === id ? { ...v, ...changes, updated_at: new Date().toISOString() } : v)) }));

  return (
    <>
      <PanelHeader
        title="Veículos"
        subtitle={`${data.vehicles.length} anúncios cadastrados`}
        actions={<a href="#/novo" className="btn btn-primary"><Plus className="h-4 w-4" /> Adicionar veículo</a>}
      />
      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Buscar por marca, modelo ou ano" className="input pl-10" aria-label="Buscar veículos" />
      </div>

      <div className="space-y-3">
        {list.map((v) => {
          const cover = asset(coverImage(v)); // asset(): prefixo do GitHub Pages na imagem "foto em breve"
          return (
            <article key={v.id} className={cn("card flex flex-wrap items-center gap-4 p-3 sm:flex-nowrap", !v.published && "opacity-60")}>
              <button type="button" onClick={() => go({ page: "editar", id: v.id })} className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl bg-ink-100 sm:w-36">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-ink-500">{v.brand}</p>
                <p className="truncate font-display text-lg font-bold text-ink-950">{v.model} <span className="font-semibold text-ink-500">{v.version}</span></p>
                <p className="text-sm text-ink-500">{vehicleYears(v)} · {formatKm(v.mileage)} · <strong className="text-ink-950">{formatPrice(v.price)}</strong></p>
                <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs font-semibold">
                  {v.featured && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">Destaque</span>}
                  {v.is_offer && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-700">Oferta</span>}
                  {!v.published && <span className="rounded-full bg-ink-100 px-2 py-0.5 text-ink-600">Oculto no site</span>}
                </div>
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <select
                  aria-label="Status"
                  value={v.status}
                  onChange={(e) => patch(v.id, { status: e.target.value as VehicleStatus })}
                  className="input w-auto flex-1 py-2 text-sm sm:flex-none"
                >
                  {(Object.keys(VEHICLE_STATUS_LABEL) as VehicleStatus[]).map((s) => (
                    <option key={s} value={s}>{VEHICLE_STATUS_LABEL[s]}</option>
                  ))}
                </select>
                <IconButton label={v.featured ? "Tirar dos destaques" : "Destacar"} onClick={() => patch(v.id, { featured: !v.featured })}>
                  <Star className={cn("h-4 w-4", v.featured && "fill-amber-400 text-amber-500")} />
                </IconButton>
                <IconButton label={v.published ? "Ocultar do site" : "Mostrar no site"} onClick={() => patch(v.id, { published: !v.published })}>
                  {v.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </IconButton>
                <IconButton label="Editar" onClick={() => go({ page: "editar", id: v.id })}>
                  <Pencil className="h-4 w-4" />
                </IconButton>
                <IconButton
                  label="Excluir"
                  danger
                  onClick={() => confirm(`Excluir o anúncio ${v.brand} ${v.model}?`) && update((d) => ({ ...d, vehicles: d.vehicles.filter((x) => x.id !== v.id) }))}
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </article>
          );
        })}
        {!list.length && <p className="card p-10 text-center text-ink-500">Nenhum veículo encontrado.</p>}
      </div>
    </>
  );
}

function IconButton({ label, onClick, danger, children }: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink-200 bg-white text-ink-600 transition",
        danger ? "hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700" : "hover:border-ink-900 hover:text-ink-950",
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Leads                                                              */
/* ------------------------------------------------------------------ */
export function LeadsPage({ data, update }: Props) {
  const leads = [...data.leads].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return (
    <>
      <PanelHeader title="Leads" subtitle="Pessoas que pediram contato pelo site (dados fictícios)." />
      <div className="grid gap-4 lg:grid-cols-2">
        {leads.map((l) => (
          <article key={l.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-bold text-ink-950">{l.name}</p>
                <p className="text-sm text-ink-500">{l.whatsapp} · {formatDate(l.created_at)}</p>
              </div>
              <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-700">{LEAD_SOURCE_LABEL[l.source]}</span>
            </div>
            {l.vehicle_label && <p className="mt-3 text-sm font-semibold text-ink-800">🚗 {l.vehicle_label}</p>}
            <p className="mt-1 text-sm text-ink-600">“{l.message}”</p>
            <div className="mt-4 flex items-center gap-2">
              <select
                aria-label={`Status do lead de ${l.name}`}
                value={l.status}
                onChange={(e) => update((d) => ({ ...d, leads: d.leads.map((x) => (x.id === l.id ? { ...x, status: e.target.value as LeadStatus } : x)) }))}
                className={cn("input w-auto py-2 text-sm font-semibold", LEAD_STATUS_STYLE[l.status])}
              >
                {(Object.keys(LEAD_STATUS_LABEL) as LeadStatus[]).map((s) => (
                  <option key={s} value={s}>{LEAD_STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Equipe (só administrador)                                           */
/* ------------------------------------------------------------------ */
export function TeamPage({ data, update, meId }: Props & { meId: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("funcionario");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function add(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return setMsg({ ok: false, text: "Informe um e-mail válido." });
    if (data.team.some((m) => m.email === clean)) return setMsg({ ok: false, text: "Essa pessoa já faz parte da equipe." });
    update((d) => ({ ...d, team: [...d.team, { id: newId("m"), name: name.trim() || clean, email: clean, role }] }));
    setName("");
    setEmail("");
    setMsg({ ok: true, text: `Acesso liberado como ${ROLE_LABEL[role]}.` });
  }

  return (
    <>
      <PanelHeader title="Equipe" subtitle="Quem pode acessar o painel e o que cada um pode fazer." />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="card overflow-hidden">
          <div className="border-b border-ink-100 px-5 py-4">
            <h2 className="font-display text-lg font-bold text-ink-950">Membros ({data.team.length})</h2>
          </div>
          <ul className="divide-y divide-ink-100">
            {data.team.map((m) => {
              const isSelf = m.id === meId;
              return (
                <li key={m.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink-100 font-display font-bold text-ink-700">{m.name.charAt(0).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-950">{m.name} {isSelf && <span className="text-xs font-medium text-ink-400">(você)</span>}</p>
                    <p className="truncate text-sm text-ink-500">{m.email}</p>
                  </div>
                  {isSelf ? (
                    <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-700">{ROLE_LABEL[m.role]}</span>
                  ) : (
                    <>
                      <select
                        aria-label={`Cargo de ${m.name}`}
                        value={m.role}
                        onChange={(e) => update((d) => ({ ...d, team: d.team.map((x) => (x.id === m.id ? { ...x, role: e.target.value as StaffRole } : x)) }))}
                        className="input w-auto py-2 text-sm"
                      >
                        <option value="admin">{ROLE_LABEL.admin}</option>
                        <option value="funcionario">{ROLE_LABEL.funcionario}</option>
                      </select>
                      <IconButton
                        label={`Remover ${m.name}`}
                        danger
                        onClick={() => confirm(`Remover o acesso de ${m.name} ao painel?`) && update((d) => ({ ...d, team: d.team.filter((x) => x.id !== m.id) }))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-ink-950">Adicionar pessoa</h2>
            <form onSubmit={add} className="mt-5 space-y-4" noValidate>
              <div>
                <label htmlFor="dt-name" className="label">Nome</label>
                <input id="dt-name" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Ex.: Ana Souza" />
              </div>
              <div>
                <label htmlFor="dt-email" className="label">E-mail *</label>
                <input id="dt-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="pessoa@email.com" />
              </div>
              <fieldset>
                <legend className="label">Cargo *</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(["funcionario", "admin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      aria-pressed={role === r}
                      className={cn("rounded-xl border px-3 py-2.5 text-sm font-medium transition", role === r ? "border-ink-950 bg-ink-950 text-white" : "border-ink-200 text-ink-700 hover:border-ink-400")}
                    >
                      {ROLE_LABEL[r]}
                    </button>
                  ))}
                </div>
              </fieldset>
              {msg && (
                <p className={cn("rounded-xl px-4 py-3 text-sm font-medium", msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-brand-50 text-brand-800")}>{msg.text}</p>
              )}
              <button type="submit" className="btn btn-primary w-full"><UserPlus className="h-4 w-4" /> Liberar acesso</button>
            </form>
          </section>
          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-ink-950">O que cada cargo pode fazer</h2>
            <dl className="mt-4 space-y-4 text-sm">
              {(["admin", "funcionario"] as const).map((r) => (
                <div key={r}>
                  <dt className="font-semibold text-ink-950">{ROLE_LABEL[r]}</dt>
                  <dd className="mt-0.5 text-ink-600">{ROLE_DESCRIPTION[r]}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Configurações (só administrador)                                    */
/* ------------------------------------------------------------------ */
export function SettingsPage({ data, update }: Props) {
  const [form, setForm] = useState(data.settings);
  const [saved, setSaved] = useState(false);
  const field = (key: keyof typeof form, label: string, type = "text") => (
    <div>
      <label htmlFor={`ds-${key}`} className="label">{label}</label>
      <input
        id={`ds-${key}`}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        value={form[key]}
        onChange={(e) => {
          setSaved(false);
          setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value });
        }}
        className="input"
      />
    </div>
  );
  return (
    <>
      <PanelHeader title="Configurações da loja" subtitle="Na versão real, essas informações atualizam o site inteiro na hora." />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update((d) => ({ ...d, settings: form }));
          setSaved(true);
        }}
        className="card max-w-2xl space-y-4 p-5 sm:p-7"
      >
        {field("company_name", "Nome da loja")}
        {field("slogan", "Slogan")}
        {field("whatsapp", "WhatsApp")}
        {field("finance_monthly_rate", "Taxa de juros da simulação (% ao mês)", "number")}
        <p className="text-xs text-ink-500">Na versão real também dá para trocar a logo, endereço, horário, redes sociais e os textos da página Sobre.</p>
        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary">Salvar</button>
          {saved && <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Salvo!</span>}
        </div>
      </form>
    </>
  );
}
