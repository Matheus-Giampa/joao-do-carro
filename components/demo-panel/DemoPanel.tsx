"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Car, ExternalLink, Info, LayoutDashboard, Lock, LogOut, Menu, PlusCircle, RotateCcw, Settings, ShieldCheck, Users, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { DEMO_LOGIN, useDemoData } from "./store";
import { go, parseHash, type Route } from "./routes";
import { Dashboard, LeadsPage, SettingsPage, TeamPage, VehiclesPage } from "./Sections";
import { VehicleEditor } from "./VehicleEditor";
import { ROLE_DESCRIPTION, ROLE_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { StaffRole } from "@/types";

const NAV: { page: Route["page"]; label: string; icon: React.ComponentType<{ className?: string }>; adminOnly?: boolean }[] = [
  { page: "inicio", label: "Dashboard", icon: LayoutDashboard },
  { page: "veiculos", label: "Veículos", icon: Car },
  { page: "novo", label: "Adicionar veículo", icon: PlusCircle },
  { page: "leads", label: "Leads", icon: Users },
  { page: "equipe", label: "Equipe", icon: ShieldCheck, adminOnly: true },
  { page: "config", label: "Configurações", icon: Settings, adminOnly: true },
];

const ROLE_KEY = "jdc-painel-demo-cargo";

export function DemoPanel() {
  const { data, update, reset, saveError } = useDemoData();
  const [role, setRole] = useState<StaffRole | null>(null);
  const [route, setRoute] = useState<Route>({ page: "inicio" });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(ROLE_KEY);
      if (saved === "admin" || saved === "funcionario") setRole(saved);
    } catch {}
    const onHash = () => {
      setRoute(parseHash());
      setMenuOpen(false);
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const login = (r: StaffRole | null) => {
    setRole(r);
    try {
      if (r) sessionStorage.setItem(ROLE_KEY, r);
      else sessionStorage.removeItem(ROLE_KEY);
    } catch {}
    if (!r) go({ page: "inicio" });
  };

  if (!data) return <div className="min-h-screen bg-ink-50" />;

  // Tela de "login" da demonstração: escolhe o cargo para ver as diferenças
  if (!role) {
    return (
      <div className="speed-lines grid min-h-screen place-items-center bg-ink-950 px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="mb-8 flex justify-center">
            <Logo size="lg" />
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <p className="eyebrow">Demonstração</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink-950">Painel da loja</h1>
            <p className="mt-1 text-sm text-ink-500">
              Na versão real, cada pessoa entra com e-mail e senha. Aqui, escolha como quer testar:
            </p>
            <div className="mt-6 grid gap-3">
              {(["admin", "funcionario"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => login(r)}
                  className="group flex items-start gap-4 rounded-2xl border border-ink-200 p-4 text-left transition hover:border-ink-950 hover:bg-ink-50"
                >
                  <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full text-white", r === "admin" ? "bg-brand-600" : "bg-ink-950")}>
                    {r === "admin" ? <ShieldCheck className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                  </span>
                  <span>
                    <span className="block font-semibold text-ink-950">Entrar como {ROLE_LABEL[r]}</span>
                    <span className="block text-sm text-ink-500">{DEMO_LOGIN[r].name} · {ROLE_DESCRIPTION[r]}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-6 flex gap-2 rounded-xl bg-ink-50 p-3 text-xs leading-relaxed text-ink-600">
              <Info className="mt-0.5 h-4 w-4 shrink-0" /> Tudo o que você fizer fica salvo só neste navegador. Pode testar à vontade.
            </p>
          </div>
          <p className="mt-6 text-center text-xs text-ink-400">
            <Link href="/" className="hover:text-white">← Voltar para o site</Link>
          </p>
        </div>
      </div>
    );
  }

  const me = DEMO_LOGIN[role];
  const blocked = NAV.find((n) => n.page === route.page)?.adminOnly && role !== "admin";
  const activePage = route.page === "editar" ? "veiculos" : route.page;
  const newLeads = data.leads.filter((l) => l.status === "novo").length;

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV.filter((n) => !n.adminOnly || role === "admin").map(({ page, label, icon: Icon }) => (
        <a
          key={page}
          href={`#/${page}`}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
            activePage === page ? "bg-brand-600 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white",
          )}
        >
          <Icon className="h-4 w-4" /> {label}
          {page === "leads" && newLeads > 0 && (
            <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-brand-700">{newLeads}</span>
          )}
        </a>
      ))}
      <div className="mt-auto space-y-1 border-t border-white/10 pt-3">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-300 hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-4 w-4" /> Ver site
        </Link>
        <button type="button" onClick={() => login(null)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-300 hover:bg-white/5 hover:text-white">
          <LogOut className="h-4 w-4" /> Sair
        </button>
        <div className="px-3 pt-2">
          <p className="truncate text-xs font-semibold text-ink-300">{me.name}</p>
          <p className="truncate text-xs text-ink-500">{ROLE_LABEL[role]} · {me.email}</p>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-ink-50 lg:flex">
      {/* Topo no celular */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between bg-ink-950 px-4 lg:hidden">
        <Logo size="sm" />
        <button type="button" onClick={() => setMenuOpen(true)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white" aria-label="Abrir menu">
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 animate-fade-up flex-col bg-ink-950">
            <div className="flex h-16 items-center justify-between px-4">
              <Logo size="sm" />
              <button type="button" onClick={() => setMenuOpen(false)} className="rounded-lg p-2 text-white" aria-label="Fechar menu"><X className="h-5 w-5" /></button>
            </div>
            {nav}
          </aside>
        </div>
      )}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-ink-950 lg:flex">
        <div className="flex h-20 items-center px-5"><Logo size="sm" /></div>
        {nav}
      </aside>

      <div className="min-w-0 flex-1">
        {/* Faixa da demonstração + troca rápida de cargo */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 sm:px-6 lg:px-8">
          <span className="flex items-center gap-2 font-medium"><Info className="h-4 w-4 shrink-0" /> Painel de demonstração — as alterações ficam salvas só neste navegador.</span>
          <span className="flex items-center gap-2 sm:ml-auto">
            <span className="whitespace-nowrap">Ver como:</span>
            <span className="inline-flex rounded-full bg-white p-0.5 shadow-sm">
              {(["admin", "funcionario"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => login(r)}
                  className={cn("rounded-full px-3 py-1 text-xs font-semibold transition", role === r ? "bg-ink-950 text-white" : "text-ink-600 hover:text-ink-950")}
                >
                  {ROLE_LABEL[r]}
                </button>
              ))}
            </span>
            <button
              type="button"
              onClick={() => confirm("Apagar tudo o que foi alterado e voltar aos dados de exemplo?") && reset()}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold hover:bg-amber-100"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restaurar
            </button>
          </span>
        </div>
        {saveError && <p className="bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-800 sm:px-6 lg:px-8" role="alert">{saveError}</p>}

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {blocked ? (
            <div className="card mx-auto max-w-md p-8 text-center">
              <Lock className="mx-auto h-12 w-12 text-brand-600" />
              <h1 className="mt-4 font-display text-2xl font-bold">Sem permissão</h1>
              <p className="mt-2 text-sm text-ink-600">
                O cargo <strong>Funcionário</strong> não acessa esta área. Só administradores mexem nas configurações e na equipe.
              </p>
              <a href="#/inicio" className="btn btn-dark mt-6">Voltar ao painel</a>
            </div>
          ) : route.page === "veiculos" ? (
            <VehiclesPage data={data} update={update} />
          ) : route.page === "novo" || route.page === "editar" ? (
            // key: trocar de "editar X" para "novo" precisa começar um formulário limpo
            <VehicleEditor key={route.page === "editar" ? route.id : "novo"} data={data} update={update} vehicleId={route.page === "editar" ? route.id : undefined} />
          ) : route.page === "leads" ? (
            <LeadsPage data={data} update={update} />
          ) : route.page === "equipe" ? (
            <TeamPage data={data} update={update} meId={me.id} />
          ) : route.page === "config" ? (
            <SettingsPage data={data} update={update} />
          ) : (
            <Dashboard data={data} me={me} />
          )}
        </div>
      </div>
    </div>
  );
}
