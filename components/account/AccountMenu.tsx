"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Heart, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { useAccount } from "./AccountProvider";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cn } from "@/lib/utils";

/** Coração com o número de favoritos (aparece sempre, logado ou não). */
export function FavoritesLink({ className }: { className?: string }) {
  const { favorites } = useAccount();
  return (
    <Link
      href="/favoritos"
      className={cn("relative grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20", className)}
      aria-label={`Meus favoritos${favorites.size ? ` (${favorites.size})` : ""}`}
    >
      <Heart className="h-[18px] w-[18px]" />
      {favorites.size > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-bold">
          {favorites.size}
        </span>
      )}
    </Link>
  );
}

/** Desktop: botão "Entrar" ou o avatar com o menu da conta. */
export function AccountMenu() {
  const { ready, user, isStaff, signOut } = useAccount();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (!isSupabaseConfigured) return null; // modo demonstração: sem login
  if (!ready) return <span className="h-10 w-20 animate-pulse rounded-full bg-white/10" aria-hidden="true" />;

  if (!user) {
    return (
      <Link href="/entrar" className="btn btn-sm border border-white/20 py-2.5 text-white hover:bg-white/10">
        <UserRound className="h-4 w-4" /> Entrar
      </Link>
    );
  }

  const initial = (user.name || user.email).charAt(0).toUpperCase();
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Minha conta"
        className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 font-display font-bold text-white transition hover:bg-brand-700"
      >
        {initial}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-ink-200/60 bg-white text-ink-900 shadow-card-hover">
          <div className="border-b border-ink-100 px-4 py-3">
            <p className="truncate font-semibold">{user.name || "Minha conta"}</p>
            <p className="truncate text-sm text-ink-500">{user.email}</p>
          </div>
          <div className="p-1.5">
            <Link role="menuitem" href="/favoritos" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-ink-50">
              <Heart className="h-4 w-4 text-brand-600" /> Meus favoritos
            </Link>
            {isStaff && (
              // <a> (e não <Link>): o painel é outra área do site, com layout próprio
              <a role="menuitem" href="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-ink-50">
                <LayoutDashboard className="h-4 w-4 text-ink-500" /> Painel da loja
              </a>
            )}
            <button role="menuitem" type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-ink-50">
              <LogOut className="h-4 w-4 text-ink-500" /> Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Celular: atalhos da conta dentro do menu aberto. */
export function MobileAccountLinks() {
  const { ready, user, isStaff, favorites, signOut } = useAccount();
  const item = "flex items-center gap-3 rounded-2xl px-4 py-3.5 font-semibold text-ink-100 hover:bg-white/5";
  return (
    <div className="grid gap-1">
      <Link href="/favoritos" className={item}>
        <Heart className="h-5 w-5 text-brand-500" /> Meus favoritos {favorites.size > 0 && <span className="text-ink-400">({favorites.size})</span>}
      </Link>
      {isSupabaseConfigured && ready && !user && (
        <Link href="/entrar" className={item}>
          <UserRound className="h-5 w-5" /> Entrar ou criar conta
        </Link>
      )}
      {user && isStaff && (
        <a href="/admin" className={item}>
          <LayoutDashboard className="h-5 w-5" /> Painel da loja
        </a>
      )}
      {user && (
        <button type="button" onClick={signOut} className={cn(item, "text-left")}>
          <LogOut className="h-5 w-5" /> Sair <span className="truncate text-sm font-normal text-ink-400">{user.email}</span>
        </button>
      )}
    </div>
  );
}
