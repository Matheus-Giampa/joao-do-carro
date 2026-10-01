import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { LoginForm } from "@/components/admin/LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Acesso administrativo", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="speed-lines grid min-h-screen place-items-center bg-ink-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
          <h1 className="font-display text-2xl font-bold text-ink-950">Painel administrativo</h1>
          <p className="mb-6 mt-1 text-sm text-ink-500">Entre com seu e-mail e senha de administrador.</p>
          {!isSupabaseConfigured && (
            <div className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
              <strong>Supabase não configurado.</strong> O site está em modo demonstração. Configure as variáveis de ambiente
              (veja o README) para ativar o painel.
            </div>
          )}
          <LoginForm next={next} />
        </div>
        <p className="mt-6 text-center text-xs text-ink-500">
          <a href="/" className="hover:text-white">← Voltar para o site</a>
        </p>
      </div>
    </div>
  );
}
