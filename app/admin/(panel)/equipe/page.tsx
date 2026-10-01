import { AdminHeader } from "@/components/admin/AdminHeader";
import { AddStaffForm, StaffRow } from "@/components/admin/TeamManager";
import { requireAdminRole } from "@/services/auth";
import { canCreateAccounts } from "@/lib/supabase/admin";
import { ROLE_DESCRIPTION, ROLE_LABEL } from "@/lib/constants";
import type { StaffMember } from "@/types";

export const metadata = { title: "Equipe" };

export default async function TeamPage() {
  const { supabase, user } = await requireAdminRole();
  const { data } = await supabase.from("admins").select("user_id, name, email, role, created_at").order("created_at");
  const members = (data ?? []) as StaffMember[];

  return (
    <>
      <AdminHeader title="Equipe" subtitle="Quem pode acessar o painel e o que cada um pode fazer." />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="card overflow-hidden">
          <div className="border-b border-ink-100 px-5 py-4">
            <h2 className="font-display text-lg font-bold text-ink-950">Membros ({members.length})</h2>
          </div>
          <ul className="divide-y divide-ink-100">
            {members.map((m) => (
              <StaffRow key={m.user_id} member={m} isSelf={m.user_id === user.id} />
            ))}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-ink-950">Adicionar pessoa</h2>
            <p className="mb-5 mt-1 text-sm text-ink-500">
              {canCreateAccounts
                ? "Informe uma senha provisória para criar a conta agora, ou deixe em branco se a pessoa já tem conta no site."
                : "A pessoa precisa ter criado uma conta no site (Entrar → Criar conta). Depois é só informar o e-mail dela aqui."}
            </p>
            <AddStaffForm canCreateAccounts={canCreateAccounts} />
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
