"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/services/auth";
import { canCreateAccounts, createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ActionResult, StaffRole } from "@/types";

const ROLES: StaffRole[] = ["admin", "funcionario"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function dbMessage(error: { message?: string } | null, fallback: string) {
  // As funções do banco já devolvem mensagens em português (ex.: "Nenhuma conta encontrada com este e-mail.")
  return error?.message && /[áéíóúãõç]|conta|acesso|cargo/i.test(error.message) ? error.message : fallback;
}

/**
 * Adiciona alguém à equipe.
 * - Se a pessoa já tem conta no site: só libera o acesso com o cargo escolhido.
 * - Se informar uma senha (e a chave service_role estiver configurada): cria a conta na hora.
 */
export async function addStaff(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await assertAdmin();
    const name = String(fd.get("name") ?? "").trim().slice(0, 120);
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const role = String(fd.get("role") ?? "") as StaffRole;
    const password = String(fd.get("password") ?? "");

    const errors: Record<string, string> = {};
    if (!EMAIL_RE.test(email)) errors.email = "Informe um e-mail válido.";
    if (!ROLES.includes(role)) errors.role = "Escolha o cargo.";
    if (password && password.length < 8) errors.password = "A senha precisa ter pelo menos 8 caracteres.";
    if (Object.keys(errors).length) return { ok: false, message: "Confira os campos destacados.", errors };

    let created = false;
    if (password) {
      if (!canCreateAccounts) {
        return {
          ok: false,
          message:
            "Para criar a conta direto pelo painel, configure a variável SUPABASE_SERVICE_ROLE_KEY (veja o README). Ou deixe a senha em branco e peça para a pessoa criar a conta no site primeiro.",
        };
      }
      const admin = createSupabaseAdminClient();
      const { error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      });
      // Conta já existente não é erro: só vamos liberar o acesso dela
      if (error && !/already|registered|exists/i.test(error.message)) {
        return { ok: false, message: "Não foi possível criar a conta. Tente outra senha ou outro e-mail." };
      }
      created = !error;
    }

    const { error } = await supabase.rpc("staff_upsert", { p_email: email, p_role: role, p_name: name || null });
    if (error) {
      const notFound = /Nenhuma conta/i.test(error.message);
      return {
        ok: false,
        message: notFound
          ? "Não existe conta com este e-mail. Peça para a pessoa criar a conta em “Entrar → Criar conta” no site, ou informe uma senha para criar agora."
          : dbMessage(error, "Não foi possível salvar. Tente novamente."),
      };
    }

    revalidatePath("/admin/equipe");
    return { ok: true, message: created ? "Conta criada e acesso liberado." : "Acesso liberado." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erro inesperado." };
  }
}

export async function changeStaffRole(email: string, role: StaffRole): Promise<ActionResult> {
  try {
    const { supabase } = await assertAdmin();
    if (!ROLES.includes(role)) return { ok: false, message: "Cargo inválido." };
    const { error } = await supabase.rpc("staff_upsert", { p_email: email, p_role: role, p_name: null });
    if (error) return { ok: false, message: dbMessage(error, "Não foi possível alterar o cargo.") };
    revalidatePath("/admin/equipe");
    return { ok: true, message: "Cargo atualizado." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erro inesperado." };
  }
}

export async function removeStaff(userId: string): Promise<ActionResult> {
  try {
    const { supabase } = await assertAdmin();
    const { error } = await supabase.rpc("staff_remove", { p_user: userId });
    if (error) return { ok: false, message: dbMessage(error, "Não foi possível remover o acesso.") };
    revalidatePath("/admin/equipe");
    return { ok: true, message: "Acesso removido." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erro inesperado." };
  }
}
