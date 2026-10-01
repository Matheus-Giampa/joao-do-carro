import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { signOut } from "@/app/actions/auth";
import { requireAdmin } from "@/services/auth";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s | Painel João do Carro" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, isAdmin } = await requireAdmin();

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-50 px-4">
        <div className="card max-w-md p-8 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-brand-600" />
          <h1 className="mt-4 font-display text-2xl font-bold">Acesso negado</h1>
          <p className="mt-2 text-sm text-ink-600">
            O usuário <strong>{user.email}</strong> não está cadastrado como administrador. Veja no README como cadastrar o
            primeiro administrador.
          </p>
          <form action={signOut} className="mt-6">
            <button className="btn btn-dark">Sair</button>
          </form>
        </div>
      </div>
    );
  }

  const { count } = await supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "novo");

  return (
    <div className="min-h-screen bg-ink-50 lg:flex">
      <AdminSidebar email={user.email ?? ""} newLeads={count ?? 0} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
