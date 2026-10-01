"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { addStaff, changeStaffRole, removeStaff } from "@/app/actions/team";
import { ROLE_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ActionResult, StaffMember, StaffRole } from "@/types";

export function StaffRow({ member: m, isSelf }: { member: StaffMember; isSelf: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) alert(r.message);
      router.refresh();
    });

  return (
    <li className="flex flex-wrap items-center gap-3 px-5 py-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink-100 font-display font-bold text-ink-700">
        {(m.name || m.email || "?").charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink-950">
          {m.name || m.email || "Sem nome"} {isSelf && <span className="text-xs font-medium text-ink-400">(você)</span>}
        </p>
        <p className="truncate text-sm text-ink-500">{m.email ?? "—"}</p>
      </div>
      {isSelf || !m.email ? (
        <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-700">{ROLE_LABEL[m.role]}</span>
      ) : (
        <select
          aria-label={`Cargo de ${m.name || m.email}`}
          value={m.role}
          disabled={pending}
          onChange={(e) => run(() => changeStaffRole(m.email!, e.target.value as StaffRole))}
          className="input w-auto py-2 text-sm"
        >
          <option value="admin">{ROLE_LABEL.admin}</option>
          <option value="funcionario">{ROLE_LABEL.funcionario}</option>
        </select>
      )}
      {!isSelf && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (confirm(`Remover o acesso de ${m.name || m.email} ao painel? A conta continua existindo como cliente.`)) run(() => removeStaff(m.user_id));
          }}
          className="grid h-10 w-10 place-items-center rounded-full text-ink-400 transition hover:bg-brand-50 hover:text-brand-700"
          aria-label={`Remover ${m.name || m.email}`}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      )}
    </li>
  );
}

export function AddStaffForm({ canCreateAccounts }: { canCreateAccounts: boolean }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addStaff, null);
  const formRef = useRef<HTMLFormElement>(null);
  const e = state?.errors ?? {};

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-4" noValidate>
      <div>
        <label htmlFor="st-name" className="label">Nome</label>
        <input id="st-name" name="name" className="input" placeholder="Ex.: Ana Souza" autoComplete="off" />
      </div>
      <div>
        <label htmlFor="st-email" className="label">E-mail *</label>
        <input id="st-email" name="email" type="email" required className="input" placeholder="pessoa@email.com" autoComplete="off" />
        {e.email && <p className="mt-1 text-xs font-medium text-brand-700">{e.email}</p>}
      </div>
      {canCreateAccounts && (
        <div>
          <label htmlFor="st-pass" className="label">Senha provisória (opcional)</label>
          <input id="st-pass" name="password" type="text" minLength={8} className="input" placeholder="Mínimo de 8 caracteres" autoComplete="new-password" />
          {e.password && <p className="mt-1 text-xs font-medium text-brand-700">{e.password}</p>}
        </div>
      )}
      <fieldset>
        <legend className="label">Cargo *</legend>
        <div className="grid grid-cols-2 gap-2">
          {(["funcionario", "admin"] as const).map((r) => (
            <label key={r} className="cursor-pointer">
              <input type="radio" name="role" value={r} defaultChecked={r === "funcionario"} className="peer sr-only" />
              <span className="block rounded-xl border border-ink-200 px-3 py-2.5 text-center text-sm font-medium text-ink-700 transition peer-checked:border-ink-950 peer-checked:bg-ink-950 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500">
                {ROLE_LABEL[r]}
              </span>
            </label>
          ))}
        </div>
        {e.role && <p className="mt-1 text-xs font-medium text-brand-700">{e.role}</p>}
      </fieldset>

      {state && (
        <p
          className={cn("rounded-xl px-4 py-3 text-sm font-medium", state.ok ? "bg-emerald-50 text-emerald-800" : "bg-brand-50 text-brand-800")}
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Liberar acesso
      </button>
    </form>
  );
}
