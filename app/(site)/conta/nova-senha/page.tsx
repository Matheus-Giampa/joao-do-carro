import type { Metadata } from "next";
import { NewPasswordForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Criar nova senha", robots: { index: false, follow: false } };

export default function NovaSenhaPage() {
  return (
    <section className="container grid min-h-[60vh] place-items-center py-12">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <h1 className="mb-5 font-display text-2xl font-bold text-ink-950">Criar nova senha</h1>
        <NewPasswordForm />
      </div>
    </section>
  );
}
