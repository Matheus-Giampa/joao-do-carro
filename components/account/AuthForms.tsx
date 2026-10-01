"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Heart, Loader2, LogIn, MailCheck, UserPlus } from "lucide-react";
import { useAccount } from "./AccountProvider";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { BASE_PATH } from "@/lib/paths";
import { cn } from "@/lib/utils";

type Mode = "entrar" | "criar" | "esqueci";

/** Só aceita caminhos internos (evita redirecionar para outro site). */
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/entrar") ? next : "/favoritos";
}

function siteUrl(path: string) {
  return `${window.location.origin}${BASE_PATH}${path}`;
}

/** Traduz as mensagens mais comuns do Supabase Auth. */
function authMessage(message: string) {
  if (/invalid login credentials/i.test(message)) return "E-mail ou senha incorretos.";
  if (/email not confirmed/i.test(message)) return "Confirme o seu e-mail antes de entrar: abra o link que enviamos para a sua caixa de entrada.";
  if (/already registered|already been registered/i.test(message)) return "Já existe uma conta com este e-mail. Use a opção Entrar.";
  if (/rate limit|too many/i.test(message)) return "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.";
  if (/password/i.test(message)) return "A senha precisa ter pelo menos 8 caracteres.";
  return "Não foi possível concluir. Tente novamente.";
}

function PasswordInput({ id, autoComplete, value, onChange }: { id: string; autoComplete: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        required
        minLength={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input pr-11"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-400 hover:text-ink-700"
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function AuthForms() {
  const router = useRouter();
  const params = useSearchParams();
  const { ready, user } = useAccount();
  const next = safeNext(params.get("next"));
  const [mode, setMode] = useState<Mode>(params.get("modo") === "criar" ? "criar" : "entrar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<"confirmacao" | "senha" | null>(null);

  // Já logado (ou acabou de confirmar o e-mail pelo link): segue para onde ia
  useEffect(() => {
    if (ready && user) {
      router.replace(next);
      router.refresh();
    }
  }, [ready, user, next, router]);

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-2xl bg-amber-50 p-5 text-sm leading-relaxed text-amber-900">
        <strong>Versão de demonstração.</strong> O login e o cadastro de clientes funcionam quando o site estiver ligado ao banco de
        dados (Supabase). Por enquanto, os seus favoritos ficam salvos neste navegador.{" "}
        <Link href="/favoritos" className="font-semibold underline">Ver meus favoritos</Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return setError("Informe um e-mail válido.");
    if (mode !== "esqueci" && password.length < 8) return setError("A senha precisa ter pelo menos 8 caracteres.");
    if (mode === "criar" && name.trim().length < 2) return setError("Informe o seu nome.");

    setPending(true);
    const supabase = createSupabaseBrowserClient();
    try {
      if (mode === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) return setError(authMessage(error.message));
        // o efeito acima redireciona quando a sessão chega
      } else if (mode === "criar") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { name: name.trim() }, emailRedirectTo: siteUrl(`/entrar?confirmado=1&next=${encodeURIComponent(next)}`) },
        });
        if (error) return setError(authMessage(error.message));
        // Supabase devolve usuário sem "identities" quando o e-mail já existe
        if (data.user && data.user.identities?.length === 0) return setError(authMessage("already registered"));
        if (!data.session) setSent("confirmacao");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo: siteUrl("/conta/nova-senha") });
        if (error) return setError(authMessage(error.message));
        setSent("senha");
      }
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl bg-emerald-50 p-6 text-center text-emerald-900">
        <MailCheck className="mx-auto h-12 w-12 text-emerald-600" />
        <p className="mt-3 font-display text-lg font-bold">Confira o seu e-mail</p>
        <p className="mt-1 text-sm">
          {sent === "confirmacao"
            ? `Enviamos um link para ${email}. Clique nele para ativar a sua conta.`
            : `Se existir uma conta com ${email}, você vai receber um link para criar uma nova senha.`}
        </p>
        <button type="button" onClick={() => { setSent(null); setMode("entrar"); }} className="btn btn-outline mt-5">
          Voltar para o login
        </button>
      </div>
    );
  }

  const tabs: { id: Mode; label: string }[] = [
    { id: "entrar", label: "Entrar" },
    { id: "criar", label: "Criar conta" },
  ];

  return (
    <div>
      {params.get("motivo") === "favorito" && (
        <p className="mb-5 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800">
          <Heart className="h-4 w-4 shrink-0" /> Entre ou crie uma conta para salvar este carro nos seus favoritos.
        </p>
      )}
      {params.get("confirmado") === "1" && (
        <p className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> E-mail confirmado! Já pode entrar.
        </p>
      )}

      {mode !== "esqueci" && (
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-ink-100 p-1" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={mode === t.id}
              onClick={() => { setMode(t.id); setError(null); }}
              className={cn("rounded-full py-2.5 text-sm font-semibold transition", mode === t.id ? "bg-white text-ink-950 shadow-sm" : "text-ink-500 hover:text-ink-900")}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4" noValidate>
        {mode === "esqueci" && (
          <p className="text-sm text-ink-600">Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha.</p>
        )}
        {mode === "criar" && (
          <div>
            <label htmlFor="ac-name" className="label">Nome</label>
            <input id="ac-name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </div>
        )}
        <div>
          <label htmlFor="ac-email" className="label">E-mail</label>
          <input id="ac-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        </div>
        {mode !== "esqueci" && (
          <div>
            <div className="flex items-end justify-between">
              <label htmlFor="ac-pass" className="label">Senha</label>
              {mode === "entrar" && (
                <button type="button" onClick={() => { setMode("esqueci"); setError(null); }} className="mb-1.5 text-[13px] font-medium text-brand-700 hover:underline">
                  Esqueci a senha
                </button>
              )}
            </div>
            <PasswordInput
              id="ac-pass"
              autoComplete={mode === "criar" ? "new-password" : "current-password"}
              value={password}
              onChange={setPassword}
            />
            {mode === "criar" && <p className="mt-1 text-xs text-ink-500">Mínimo de 8 caracteres.</p>}
          </div>
        )}

        {error && (
          <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800" role="alert">{error}</p>
        )}

        <button type="submit" disabled={pending} className="btn btn-primary w-full py-3.5">
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : mode === "criar" ? (
            <UserPlus className="h-4 w-4" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          {mode === "entrar" ? "Entrar" : mode === "criar" ? "Criar conta" : "Enviar link"}
        </button>

        {mode === "esqueci" && (
          <button type="button" onClick={() => { setMode("entrar"); setError(null); }} className="btn btn-ghost w-full">
            Voltar para o login
          </button>
        )}
      </form>
    </div>
  );
}

/** Página aberta pelo link "criar nova senha" do e-mail. */
export function NewPasswordForm() {
  const router = useRouter();
  const { ready, user } = useAccount();
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!isSupabaseConfigured) {
    return <p className="text-sm text-ink-600">Disponível quando o site estiver ligado ao banco de dados (Supabase).</p>;
  }
  if (!ready) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-400" />;
  if (!user && !done) {
    return (
      <div className="text-sm text-ink-600">
        O link expirou ou já foi usado.{" "}
        <Link href="/entrar" className="font-semibold text-brand-700 underline">Peça um novo link</Link>.
      </div>
    );
  }
  if (done) {
    return (
      <div className="rounded-2xl bg-emerald-50 p-6 text-center text-emerald-900">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <p className="mt-3 font-display text-lg font-bold">Senha alterada!</p>
        <button type="button" onClick={() => router.push("/favoritos")} className="btn btn-dark mt-5">Continuar</button>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (password.length < 8) return setError("A senha precisa ter pelo menos 8 caracteres.");
        setPending(true);
        const { error } = await createSupabaseBrowserClient().auth.updateUser({ password });
        setPending(false);
        if (error) return setError(authMessage(error.message));
        setDone(true);
      }}
      className="space-y-4"
      noValidate
    >
      <div>
        <label htmlFor="np-pass" className="label">Nova senha</label>
        <PasswordInput id="np-pass" autoComplete="new-password" value={password} onChange={setPassword} />
        <p className="mt-1 text-xs text-ink-500">Mínimo de 8 caracteres.</p>
      </div>
      {error && <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800" role="alert">{error}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary w-full py-3.5">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Salvar nova senha
      </button>
    </form>
  );
}
