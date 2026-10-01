export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Quando o Supabase ainda não foi configurado, o site funciona em
 * "modo demonstração" com os veículos de data/demo-vehicles.json.
 */
export const isSupabaseConfigured =
  /^https:\/\/.+/.test(SUPABASE_URL) && SUPABASE_ANON_KEY.length > 20 && !SUPABASE_URL.includes("SEU-PROJETO");
