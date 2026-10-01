import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForms } from "@/components/account/AuthForms";

export const metadata: Metadata = {
  title: "Entrar ou criar conta",
  description: "Entre na sua conta para salvar os carros favoritos.",
  robots: { index: false, follow: true },
};

export default function EntrarPage() {
  return (
    <section className="container grid min-h-[70vh] items-center gap-10 py-12 lg:grid-cols-2 lg:py-16">
      <div className="max-w-md">
        <p className="eyebrow">Sua conta</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink-950 sm:text-5xl">
          Salve os carros que você <span className="text-brand-600">gostou</span>
        </h1>
        <p className="mt-4 text-lg text-ink-600">
          Com uma conta grátis, você toca no coração dos anúncios e encontra seus favoritos em qualquer aparelho.
        </p>
      </div>
      <div className="card w-full max-w-md p-6 sm:p-8 lg:justify-self-end">
        <Suspense>
          <AuthForms />
        </Suspense>
      </div>
    </section>
  );
}
