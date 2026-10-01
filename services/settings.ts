import "server-only";
import { cache } from "react";
import { mergeSettings } from "@/lib/defaults";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";
import type { StoreSettings } from "@/types";

/** Configurações da loja (nome, contatos, textos). Campos vazios caem nos valores padrão. */
export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  if (!isSupabaseConfigured) return mergeSettings(null);
  const { data, error } = await createPublicClient().from("store_settings").select("*").eq("id", 1).maybeSingle();
  if (error) console.error("[getStoreSettings]", error.message);
  return mergeSettings(data as Partial<StoreSettings> | null);
});
