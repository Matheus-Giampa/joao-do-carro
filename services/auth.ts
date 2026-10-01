import "server-only";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StaffRole } from "@/types";

/**
 * Garante que o usuário logado faz parte da equipe (admin ou funcionário).
 * Retorna o cliente Supabase autenticado e o cargo para uso no painel.
 */
export async function requireStaff() {
  if (!isSupabaseConfigured) redirect("/admin/login");
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: staff } = await supabase.from("admins").select("user_id, name, role").eq("user_id", user.id).maybeSingle();
  const role = (staff?.role ?? null) as StaffRole | null;
  return { supabase, user, staff, role, isStaff: Boolean(staff), isAdmin: role === "admin" };
}

/** Páginas exclusivas do cargo admin: funcionário volta para o início do painel. */
export async function requireAdminRole() {
  const ctx = await requireStaff();
  if (!ctx.isAdmin) redirect("/admin");
  return ctx;
}

async function currentStaff() {
  if (!isSupabaseConfigured) throw new Error("Supabase não configurado.");
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada. Faça login novamente.");
  const { data: staff } = await supabase.from("admins").select("role").eq("user_id", user.id).maybeSingle();
  return { supabase, user, role: (staff?.role ?? null) as StaffRole | null };
}

/** Para server actions de anúncios e leads: qualquer membro da equipe. */
export async function assertStaff() {
  const ctx = await currentStaff();
  if (!ctx.role) throw new Error("Acesso negado: usuário não faz parte da equipe.");
  return ctx;
}

/** Para server actions exclusivas do cargo admin (configurações e equipe). */
export async function assertAdmin() {
  const ctx = await currentStaff();
  if (ctx.role !== "admin") throw new Error("Acesso negado: somente administradores podem fazer isso.");
  return ctx;
}
