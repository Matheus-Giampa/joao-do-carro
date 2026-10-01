"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Car, ExternalLink, LayoutDashboard, LogOut, Menu, PlusCircle, Settings, ShieldCheck, Users, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { signOut } from "@/app/actions/auth";
import { ROLE_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { StaffRole } from "@/types";

/** adminOnly: itens que o funcionário não vê (e que o servidor também bloqueia). */
const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/veiculos", label: "Veículos", icon: Car },
  { href: "/admin/veiculos/novo", label: "Adicionar veículo", icon: PlusCircle, exact: true },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/equipe", label: "Equipe", icon: ShieldCheck, adminOnly: true },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings, adminOnly: true },
];

export function AdminSidebar({ email, name, role, newLeads }: { email: string; name: string | null; role: StaffRole; newLeads: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href) && !(href === "/admin/veiculos" && pathname === "/admin/veiculos/novo");

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV.filter((item) => !item.adminOnly || role === "admin").map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
            active(href, exact) ? "bg-brand-600 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white",
          )}
        >
          <Icon className="h-4 w-4" /> {label}
          {href === "/admin/leads" && newLeads > 0 && (
            <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-brand-700">{newLeads}</span>
          )}
        </Link>
      ))}
      <div className="mt-auto space-y-1 border-t border-white/10 pt-3">
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-300 hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-4 w-4" /> Ver site
        </a>
        <form action={signOut}>
          <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-300 hover:bg-white/5 hover:text-white">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </form>
        <div className="px-3 pt-2">
          <p className="truncate text-xs font-semibold text-ink-300">{name || email}</p>
          <p className="truncate text-xs text-ink-500">{ROLE_LABEL[role]}{name ? ` · ${email}` : ""}</p>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {/* Topo mobile */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between bg-ink-950 px-4 lg:hidden">
        <Link href="/admin"><Logo size="sm" /></Link>
        <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white" aria-label="Abrir menu">
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 animate-fade-up flex-col bg-ink-950">
            <div className="flex h-16 items-center justify-between px-4">
              <Logo size="sm" />
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-white" aria-label="Fechar menu"><X className="h-5 w-5" /></button>
            </div>
            {nav}
          </aside>
        </div>
      )}
      {/* Lateral desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-ink-950 lg:flex">
        <Link href="/admin" className="flex h-20 items-center px-5"><Logo size="sm" /></Link>
        {nav}
      </aside>
    </>
  );
}
