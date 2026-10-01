"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Sessão do cliente no site + lista de favoritos.
 *
 * Com Supabase: favoritos ficam na tabela `favorites` (precisa estar logado).
 * Modo demonstração (sem Supabase, ex.: GitHub Pages): favoritos ficam salvos
 * só neste navegador (localStorage), para dar para testar a função.
 */

export type AccountUser = { id: string; email: string; name: string | null };

type AccountContext = {
  ready: boolean;
  user: AccountUser | null;
  isStaff: boolean;
  favorites: Set<string>;
  isFavorite: (vehicleId: string) => boolean;
  toggleFavorite: (vehicleId: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AccountContext | null>(null);

const DEMO_KEY = "jdc-favoritos";
/** Favorito pedido antes do login: aplicado assim que a pessoa entra. */
export const PENDING_FAV_KEY = "jdc-favorito-pendente";

function readDemoFavorites(): string[] {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AccountUser | null>(null);
  const [isStaff, setIsStaff] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Carrega sessão e favoritos (e acompanha login/logout em outras abas)
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setFavorites(new Set(readDemoFavorites()));
      setReady(true);
      return;
    }
    const supabase = createSupabaseBrowserClient();
    let active = true;

    async function load(sessionUser: { id: string; email?: string; user_metadata?: { name?: string } } | null) {
      if (!sessionUser) {
        if (!active) return;
        setUser(null);
        setIsStaff(false);
        setFavorites(new Set());
        setReady(true);
        return;
      }
      // Favorito escolhido antes de fazer login
      let pending: string | null = null;
      try {
        pending = sessionStorage.getItem(PENDING_FAV_KEY);
        sessionStorage.removeItem(PENDING_FAV_KEY);
      } catch {}
      if (pending) await supabase.from("favorites").upsert({ user_id: sessionUser.id, vehicle_id: pending }, { ignoreDuplicates: true });

      const [{ data: favs }, { data: staff }] = await Promise.all([
        supabase.from("favorites").select("vehicle_id"),
        supabase.from("admins").select("user_id").eq("user_id", sessionUser.id).maybeSingle(),
      ]);
      if (!active) return;
      setUser({ id: sessionUser.id, email: sessionUser.email ?? "", name: sessionUser.user_metadata?.name ?? null });
      setIsStaff(Boolean(staff));
      setFavorites(new Set((favs ?? []).map((f) => f.vehicle_id as string)));
      setReady(true);
    }

    supabase.auth.getUser().then(({ data }) => load(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") load(session?.user ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const toggleFavorite = useCallback(
    async (vehicleId: string) => {
      const has = favorites.has(vehicleId);
      const next = new Set(favorites);
      if (has) next.delete(vehicleId);
      else next.add(vehicleId);

      if (!isSupabaseConfigured) {
        setFavorites(next);
        try {
          localStorage.setItem(DEMO_KEY, JSON.stringify([...next]));
        } catch {}
        return;
      }

      if (!user) {
        try {
          sessionStorage.setItem(PENDING_FAV_KEY, vehicleId);
        } catch {}
        router.push(`/entrar?next=${encodeURIComponent(pathname)}&motivo=favorito`);
        return;
      }

      setFavorites(next); // atualiza na hora; desfaz se o banco recusar
      const supabase = createSupabaseBrowserClient();
      const { error } = has
        ? await supabase.from("favorites").delete().eq("user_id", user.id).eq("vehicle_id", vehicleId)
        : await supabase.from("favorites").insert({ user_id: user.id, vehicle_id: vehicleId });
      if (error) setFavorites(favorites);
    },
    [favorites, user, router, pathname],
  );

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) await createSupabaseBrowserClient().auth.signOut();
    router.push("/");
    router.refresh();
  }, [router]);

  const value = useMemo<AccountContext>(
    () => ({ ready, user, isStaff, favorites, isFavorite: (id) => favorites.has(id), toggleFavorite, signOut }),
    [ready, user, isStaff, favorites, toggleFavorite, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAccount() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAccount precisa estar dentro de <AccountProvider>.");
  return ctx;
}
