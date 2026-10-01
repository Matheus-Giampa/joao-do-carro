import Link from "next/link";

export function DemoBanner() {
  return (
    <div className="bg-brand-700 px-4 py-1.5 text-center text-xs font-semibold text-white">
      Site de demonstração com veículos fictícios.{" "}
      <Link href="/painel-demo" className="underline underline-offset-2 hover:no-underline">
        Conheça o painel da loja →
      </Link>
    </div>
  );
}
