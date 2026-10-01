"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types";

export async function signIn(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "O Supabase ainda não foi configurado. Siga o passo a passo do README." };
  }
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const next = String(fd.get("next") ?? "");
  if (!email || !password) return { ok: false, message: "Informe e-mail e senha." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { ok: false, message: "E-mail ou senha inválidos." };

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return { ok: false, message: "Este usuário não tem permissão de administrador." };
  }

  // Só permite redirecionar para dentro do painel (evita open redirect)
  redirect(/^\/admin(\/[\w\-/]*)?$/.test(next) && !next.startsWith("/admin/login") ? next : "/admin");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
