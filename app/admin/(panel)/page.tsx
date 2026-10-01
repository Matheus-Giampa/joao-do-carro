import Link from "next/link";
import { ArrowRight, Car, CheckCircle2, PlusCircle, Star, Tag, Users } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { LeadStatusBadge } from "@/components/admin/LeadStatusBadge";
import { requireStaff } from "@/services/auth";
import { LEAD_SOURCE_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Lead } from "@/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { supabase } = await requireStaff();
  const head = { count: "exact" as const, head: true };

  const [total, available, sold, featured, leads, newLeads, recent] = await Promise.all([
    supabase.from("vehicles").select("id", head),
    supabase.from("vehicles").select("id", head).eq("status", "disponivel"),
    supabase.from("vehicles").select("id", head).eq("status", "vendido"),
    supabase.from("vehicles").select("id", head).eq("featured", true),
    supabase.from("leads").select("id", head),
    supabase.from("leads").select("id", head).eq("status", "novo"),
    supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(8),
  ]);

  const stats = [
    { label: "Total de veículos", value: total.count ?? 0, icon: Car, href: "/admin/veiculos", tone: "bg-ink-950 text-white" },
    { label: "Disponíveis", value: available.count ?? 0, icon: CheckCircle2, href: "/admin/veiculos?status=disponivel", tone: "bg-emerald-600 text-white" },
    { label: "Vendidos", value: sold.count ?? 0, icon: Tag, href: "/admin/veiculos?status=vendido", tone: "bg-ink-600 text-white" },
    { label: "Em destaque", value: featured.count ?? 0, icon: Star, href: "/admin/veiculos?destaque=1", tone: "bg-amber-500 text-ink-950" },
    { label: "Leads", value: leads.count ?? 0, icon: Users, href: "/admin/leads", tone: "bg-brand-600 text-white", extra: newLeads.count ? `${newLeads.count} novos` : undefined },
  ];

  const recentLeads = (recent.data ?? []) as Lead[];

  return (
    <>
      <AdminHeader
        title="Dashboard"
        subtitle="Visão geral do estoque e dos contatos recebidos."
        actions={
          <Link href="/admin/veiculos/novo" className="btn btn-primary">
            <PlusCircle className="h-4 w-4" /> Adicionar veículo
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, href, tone, extra }) => (
          <Link key={label} href={href} className="card group p-4 transition hover:-translate-y-0.5 hover:shadow-card-hover sm:p-5">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
            <p className="mt-4 font-display text-3xl font-extrabold text-ink-950">{value}</p>
            <p className="text-sm font-medium text-ink-500">{label}</p>
            {extra && <p className="mt-1 text-xs font-bold text-brand-700">{extra}</p>}
          </Link>
        ))}
      </div>

      <section className="card mt-8">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-ink-950">Leads recentes</h2>
          <Link href="/admin/leads" className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {recentLeads.length ? (
          <ul className="divide-y divide-ink-100">
            {recentLeads.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-950">{l.name}</p>
                  <p className="truncate text-sm text-ink-500">
                    {LEAD_SOURCE_LABEL[l.source]} {l.vehicle_label ? `· ${l.vehicle_label}` : ""}
                  </p>
                </div>
                <span className="text-xs text-ink-400">{formatDate(l.created_at)}</span>
                <LeadStatusBadge status={l.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-ink-500">Nenhum lead recebido ainda.</p>
        )}
      </section>
    </>
  );
}
