import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <div className="speed-lines grid min-h-screen place-items-center bg-ink-950 px-4 text-center text-white">
      <div>
        <Logo size="lg" />
        <p className="mt-10 font-display text-7xl font-extrabold text-brand-600">404</p>
        <h1 className="mt-2 font-display text-2xl font-bold">Página não encontrada</h1>
        <p className="mt-2 text-ink-400">Parece que essa estrada não leva a lugar nenhum.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn btn-primary">Início</Link>
          <Link href="/estoque" className="btn border border-white/20 text-white hover:bg-white/10">Ver estoque</Link>
        </div>
      </div>
    </div>
  );
}
