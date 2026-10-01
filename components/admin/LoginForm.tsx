"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { signIn } from "@/app/actions/auth";
import type { ActionResult } from "@/types";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(signIn, null);
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label htmlFor="email" className="label">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Senha</label>
        <div className="relative">
          <input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required className="input pr-11" />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-400 hover:text-ink-700" aria-label={show ? "Ocultar senha" : "Mostrar senha"}>
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {state && !state.ok && (
        <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800" role="alert">{state.message}</p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full py-3.5">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Entrar
      </button>
    </form>
  );
}
