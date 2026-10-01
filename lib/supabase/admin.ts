import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

/**
 * Chave "service_role" do Supabase — dá acesso total ao banco, por isso:
 *  - NUNCA use o prefixo NEXT_PUBLIC_ nela (não pode ir para o navegador);
 *  - só é usada aqui, depois de confirmar que quem pediu é administrador.
 *
 * É opcional: sem ela, o administrador só consegue liberar acesso para quem
 * já criou conta no site. Com ela, consegue criar a conta direto no painel.
 */
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const canCreateAccounts = SERVICE_ROLE_KEY.length > 20;

export function createSupabaseAdminClient() {
  if (!canCreateAccounts) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
