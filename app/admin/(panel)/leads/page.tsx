import Link from "next/link";
import { Search } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { LeadCard } from "@/components/admin/LeadCard";
import { requireStaff } from "@/services/auth";
import { LEAD_STATUS_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/types";

export const metadata = { title: "Leads" };

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q } = await searchParams;
  const { supabase } = await requireStaff();

  let query = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(500);
  if (status && status in LEAD_STATUS_LABEL) query = query.eq("status", status);
  const term = (q ?? "").replace(/[%_,()*\\]/g, " ").trim();
  if (term) query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,whatsapp.ilike.%${term}%,phone.ilike.%${term}%,vehicle_label.ilike.%${term}%`);
  const { data, error } = await query;
  const leads = (data ?? []) as Lead[];

  const { data: all } = await supabase.from("leads").select("status");
  const counts = (all ?? []).reduce<Record<string, number>>((acc, l) => ({ ...acc, [l.status]: (acc[l.status] ?? 0) + 1 }), {});

  return (
    <>
      <AdminHeader title="Leads" subtitle="Contatos recebidos pelos formulários do site." />

      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-card">
          <Link href="/admin/leads" className={cn("whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold", !status ? "bg-ink-950 text-white" : "text-ink-600 hover:bg-ink-50")}>
            Todos <span className="opacity-60">{all?.length ?? 0}</span>
          </Link>
          {(Object.keys(LEAD_STATUS_LABEL) as LeadStatus[]).map((s) => (
            <Link key={s} href={`/admin/leads?status=${s}`} className={cn("whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold", status === s ? "bg-ink-950 text-white" : "text-ink-600 hover:bg-ink-50")}>
              {LEAD_STATUS_LABEL[s]} <span className="opacity-60">{counts[s] ?? 0}</span>
            </Link>
          ))}
        </div>
        <form className="relative xl:w-80">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input name="q" defaultValue={q} placeholder="Buscar nome, contato, veículo..." className="input pl-10" />
        </form>
      </div>

      {error && <p className="mb-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">{error.message}</p>}

      {leads.length ? (
        <div className="space-y-3">
          {leads.map((l) => (
            <LeadCard key={l.id} lead={l} />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center text-ink-500">Nenhum lead encontrado.</div>
      )}
    </>
  );
}
