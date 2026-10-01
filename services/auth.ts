import "server-only";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Garante que o usuário logado é administrador.
 * Retorna o cliente Supabase autenticado para uso nas operações do painel.
 */
export async function requireAdmin() {
  if (!isSupabaseConfigured) redirect("/admin/login");
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase.from("admins").select("user_id, name").eq("user_id", user.id).maybeSingle();
  return { supabase, user, admin, isAdmin: Boolean(admin) };
}

/** Versão para server actions: lança erro em vez de redirecionar. */
export async function assertAdmin() {
  if (!isSupabaseConfigured) throw new Error("Supabase não configurado.");
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada. Faça login novamente.");
  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) throw new Error("Acesso negado: usuário não é administrador.");
  return { supabase, user };
}
