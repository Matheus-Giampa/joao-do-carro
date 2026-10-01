import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

let client: SupabaseClient | null = null;

/**
 * Cliente anônimo (sem cookies) para leituras públicas.
 * Permite que as páginas públicas sejam cacheadas (ISR). O RLS garante
 * que somente veículos publicados sejam retornados.
 */
export function createPublicClient() {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
