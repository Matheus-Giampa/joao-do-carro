import type { Metadata } from "next";
import { DemoPanel } from "@/components/demo-panel/DemoPanel";

export const metadata: Metadata = {
  title: "Painel da loja (demonstração)",
  description: "Demonstração do painel administrativo: cadastro de veículos, leads, equipe e configurações.",
  robots: { index: false, follow: false },
};

/** Painel de DEMONSTRAÇÃO: funciona sem banco de dados (dados salvos no navegador). */
export default function PainelDemoPage() {
  return <DemoPanel />;
}
